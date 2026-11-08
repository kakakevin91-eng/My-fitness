import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  DATA_VERSION,
  formatLocalDate,
  isValidDateKey,
  normalizeBackup,
  plans,
  restoreTimerState,
  summarizeLogs
} from '../app.js';
import {activePlanIds, exerciseLibrary, shoulderDetails} from '../gym-plans.js';

test('保留原本圓肩計劃及總組數', () => {
  assert.ok(activePlanIds.includes('shoulder'));
  assert.equal(activePlanIds.length, 11);
  assert.deepEqual(plans.shoulder.ex.map(item => item[1]), [
    '胸肌伸展', '貓式伸展', '俯臥 Y–T–I', '反向蝴蝶機飛鳥',
    'Cable Face Pull', '啞鈴回環', '坐姿啞鈴推肩'
  ]);
  assert.equal(plans.shoulder.ex.reduce((sum, item) => sum + item[3], 0), 18);
  for (const exercise of plans.shoulder.ex) assert.ok(shoulderDetails[exercise[0]]?.[0] && shoulderDetails[exercise[0]]?.[1]);
});

test('提供 20 個各自不同的入門計劃', () => {
  const beginnerPlans = Object.entries(plans).filter(([id]) => /^beginner\d{2}$/.test(id));
  assert.equal(beginnerPlans.length, 20);
  assert.equal(new Set(beginnerPlans.map(([, plan]) => plan.name)).size, 20);
  for (const [, plan] of beginnerPlans) {
    assert.ok(plan.ex.length >= 5);
    assert.equal(new Set(plan.ex.map(item => item[0])).size, plan.ex.length);
  }
});

test('日常選單有十套健身室計劃及中英文部位與替代動作', () => {
  assert.equal(activePlanIds.filter(id => id.startsWith('gym')).length, 10);
  for (const id of activePlanIds.filter(id => id.startsWith('gym'))) {
    assert.ok(plans[id].ex.length >= 4);
    for (const exercise of plans[id].ex) {
      const info = exerciseLibrary[exercise[0]];
      assert.ok(info?.[1] && info?.[2] && info?.[3] && exerciseLibrary[info[5]] && info[6] && info[7]);
    }
  }
  const backup = {version: 1, logs: {'2026-11-09': {gymChest: {sets: {'chestPress-1': {done: true, weight: '10', reps: '8'}}, swaps: {chestPress: 'alternate'}, notes: '', pain: ''}}}};
  const clean = normalizeBackup(backup);
  assert.equal(clean.logs['2026-11-09'].gymChest.swaps.chestPress, 'alternate');
  assert.equal(clean.logs['2026-11-09'].gymChest.sets['chestPress-1'].weight, '10');
  assert.throws(() => normalizeBackup({...backup, logs: {'2026-11-09': {gymChest: {...backup.logs['2026-11-09'].gymChest, swaps: {chestPress: 'script'}}}}}), /替代/);
});

test('使用本地日曆日期而非 UTC 日期', () => {
  assert.equal(formatLocalDate(new Date(2026, 0, 2, 23, 30)), '2026-01-02');
  assert.equal(isValidDateKey('2024-02-29'), true);
  assert.equal(isValidDateKey('2025-02-29'), false);
  assert.equal(isValidDateKey('__proto__'), false);
});

test('備份驗證會保留不同日期和 Program', () => {
  const backup = {
    version: DATA_VERSION,
    logs: {
      '2026-11-07': {shoulder: {sets: {'pec-1': {done: true, at: '2026-11-07T01:02:03.000Z', weight: '', reps: '1'}}, notes: '測試', pain: '2'}},
      '2026-11-08': {lower: {sets: {'squat-1': {done: true, at: null, weight: '10', reps: '8'}}, notes: '', pain: ''}}
    }
  };
  const clean = normalizeBackup(backup);
  assert.equal(clean.logs['2026-11-07'].shoulder.sets['pec-1'].done, true);
  assert.equal(clean.logs['2026-11-08'].lower.sets['squat-1'].weight, '10');
  assert.deepEqual(summarizeLogs(clean), {days: 2, sets: 2});
});

test('備份驗證拒絕未知計劃、異常組數和過長備註', () => {
  assert.throws(() => normalizeBackup({version: 1, logs: {'2026-11-08': {unknown: {sets: {}, notes: '', pain: ''}}}}), /不支援/);
  assert.throws(() => normalizeBackup({version: 1, logs: {'2026-11-08': {shoulder: {sets: {'hack-1': {done: true}}, notes: '', pain: ''}}}}), /不支援/);
  assert.throws(() => normalizeBackup({version: 1, logs: {'2026-11-08': {shoulder: {sets: {}, notes: 'x'.repeat(5001), pain: ''}}}}), /備註/);
});

test('重新開 App 後可恢復進行中的倒數', () => {
  const now = 1_000_000;
  const running = restoreTimerState({selected: 90, remaining: 90, running: true, endTime: now + 45_000}, now);
  assert.equal(running.running, true);
  assert.equal(running.remaining, 45);
  const finished = restoreTimerState({selected: 60, remaining: 60, running: true, endTime: now - 1}, now);
  assert.equal(finished.running, false);
  assert.equal(finished.remaining, 0);
});

test('靜態部署只使用相對資源並設有私隱防護', async () => {
  const [html, manifest, serviceWorker, gitignore] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'),
    readFile(new URL('../sw.js', import.meta.url), 'utf8'),
    readFile(new URL('../.gitignore', import.meta.url), 'utf8')
  ]);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /rel="noopener noreferrer"|app\.js/);
  assert.doesNotMatch(html, /https?:\/\/(?!www\.youtube\.com|www\.nhs\.uk)/);
  assert.equal(JSON.parse(manifest).start_url, './');
  assert.match(serviceWorker, /\.\/app\.js/);
  assert.match(gitignore, /fitness-backup-\*\.json/);
});
