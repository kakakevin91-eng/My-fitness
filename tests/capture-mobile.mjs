import {writeFile} from 'node:fs/promises';

const endpoint = process.argv[2] || 'http://127.0.0.1:9223';
const pageUrl = process.argv[3] || 'http://127.0.0.1:4173/';
const output = process.argv[4] || 'tests/mobile-preview-cdp.png';
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(pageUrl)}`, {method: 'PUT'}).then(response => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const {resolve, reject} = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
};

await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, {resolve, reject});
  socket.send(JSON.stringify({id, method, params}));
});

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844
});
await send('Page.navigate', {url: pageUrl});
await new Promise(resolve => setTimeout(resolve, 1200));
const metrics = await send('Runtime.evaluate', {expression: '({innerWidth,scrollWidth:document.documentElement.scrollWidth,ready:document.readyState})', returnByValue: true});
const screenshot = await send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false, fromSurface: true});
await writeFile(output, Buffer.from(screenshot.data, 'base64'));
console.log(JSON.stringify(metrics.result.value));
socket.close();
