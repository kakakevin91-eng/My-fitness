'use strict';

export const STORAGE_KEY = 'my-fitness-pwa-v1';
export const TIMER_KEY = 'my-fitness-timer-v1';
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const DATA_VERSION = 1;

export const plans = {
  shoulder: {
    name: '原本圓肩練肩 Program',
    ex: [
      ['pec', '胸肌伸展', '30–60 秒', 1, 60, 'https://www.youtube.com/results?search_query=doorway+pec+stretch'],
      ['cat', '貓式伸展', '10–12 次', 1, 60, 'https://www.youtube.com/results?search_query=cat+cow+stretch+exercise'],
      ['yti', '俯臥 Y–T–I', '每個角度 15 次', 3, 60, 'https://www.youtube.com/results?search_query=prone+Y+T+I+exercise'],
      ['reverse', '反向蝴蝶機飛鳥', '15–20 次', 3, 60, 'https://www.youtube.com/results?search_query=reverse+pec+deck+fly+form'],
      ['face', 'Cable Face Pull', '15 次', 3, 60, 'https://www.youtube.com/results?search_query=cable+face+pull+proper+form'],
      ['circle', '啞鈴回環', '12–15 次（具體動作待確認）', 3, 60, 'https://www.youtube.com/results?search_query=dumbbell+shoulder+circles+exercise'],
      ['press', '坐姿啞鈴推肩', '8–15 次', 4, 60, 'https://www.youtube.com/results?search_query=seated+dumbbell+shoulder+press+form']
    ]
  },
  gentle: {
    name: '肩頸溫和活動',
    ex: [
      ['turn', '輕柔左右轉頭', '每邊 3–5 次（舒服幅度）', 1, 30, 'https://www.nhs.uk/conditions/neck-pain-and-stiff-neck/'],
      ['roll', '肩膊繞圈', '前後各 5 次', 1, 30, 'https://www.youtube.com/results?search_query=gentle+shoulder+rolls'],
      ['thoracic', '坐姿胸椎伸展', '5–8 次', 1, 30, 'https://www.youtube.com/results?search_query=seated+thoracic+extension+exercise']
    ]
  },
  lower: {
    name: '輕量下肢',
    ex: [
      ['squat', '徒手深蹲', '8–10 次', 2, 60, 'https://www.youtube.com/results?search_query=bodyweight+squat+exercise+form'],
      ['bridge', '臀橋', '10–12 次', 2, 60, 'https://www.youtube.com/results?search_query=glute+bridge+exercise+form']
    ]
  },
  walk: {
    name: '輕鬆步行',
    ex: [['walking', '輕鬆步行', '20–30 分鐘', 1, 0, 'https://www.nhs.uk/live-well/exercise/walking-for-health/']]
  }
};

export function formatLocalDate(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanOptionalNumber(value, label, max) {
  if (value === '' || value === null || value === undefined) return '';
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > max) throw new Error(`${label}超出合理範圍`);
  return String(number);
}

export function normalizeBackup(value) {
  if (!isPlainObject(value) || value.version !== DATA_VERSION || !isPlainObject(value.logs)) throw new Error('備份格式不正確');
  const dates = Object.keys(value.logs);
  if (dates.length > 4000) throw new Error('備份包含過多日期');
  const clean = {version: DATA_VERSION, logs: {}};

  for (const date of dates) {
    if (!isValidDateKey(date)) throw new Error(`日期格式不正確：${date}`);
    const rawDay = value.logs[date];
    if (!isPlainObject(rawDay)) throw new Error(`${date} 的紀錄格式不正確`);
    const cleanDay = {};

    for (const programId of Object.keys(rawDay)) {
      const plan = plans[programId];
      if (!plan) throw new Error(`不支援的訓練計劃：${programId}`);
      const rawEntry = rawDay[programId];
      if (!isPlainObject(rawEntry)) throw new Error(`${date} 的計劃紀錄格式不正確`);
      const notes = rawEntry.notes ?? '';
      if (typeof notes !== 'string' || notes.length > 5000) throw new Error('備註格式或長度不正確');
      const pain = rawEntry.pain ?? '';
      if (pain !== '' && (!/^\d+$/.test(String(pain)) || Number(pain) < 0 || Number(pain) > 10)) throw new Error('痛楚分數必須為 0–10');
      const rawSets = rawEntry.sets ?? {};
      if (!isPlainObject(rawSets)) throw new Error('組數紀錄格式不正確');
      const allowedSets = new Set(plan.ex.flatMap(exercise => Array.from({length: exercise[3]}, (_, index) => `${exercise[0]}-${index + 1}`)));
      const cleanSets = {};

      for (const setKey of Object.keys(rawSets)) {
        if (!allowedSets.has(setKey)) throw new Error(`不支援的組數紀錄：${setKey}`);
        const rawSet = rawSets[setKey];
        if (!isPlainObject(rawSet) || typeof rawSet.done !== 'boolean') throw new Error(`${setKey} 格式不正確`);
        let at = null;
        if (rawSet.at !== null && rawSet.at !== undefined && rawSet.at !== '') {
          if (typeof rawSet.at !== 'string' || !Number.isFinite(Date.parse(rawSet.at))) throw new Error(`${setKey} 完成時間不正確`);
          at = new Date(rawSet.at).toISOString();
        }
        cleanSets[setKey] = {
          done: rawSet.done,
          at,
          weight: cleanOptionalNumber(rawSet.weight, '重量', 2000),
          reps: cleanOptionalNumber(rawSet.reps, '次數', 10000)
        };
      }

      cleanDay[programId] = {sets: cleanSets, notes, pain: pain === '' ? '' : String(Number(pain))};
    }
    clean.logs[date] = cleanDay;
  }
  return clean;
}

export function summarizeLogs(data) {
  let days = 0;
  let sets = 0;
  for (const day of Object.values(data.logs || {})) {
    const count = Object.values(day).reduce((sum, item) => sum + Object.values(item.sets || {}).filter(set => set.done).length, 0);
    if (count) days += 1;
    sets += count;
  }
  return {days, sets};
}

export function restoreTimerState(value, now = Date.now()) {
  const fallback = {selected: 60, remaining: 60, running: false, endTime: 0};
  if (!isPlainObject(value)) return fallback;
  const selected = [30, 60, 90, 120].includes(Number(value.selected)) ? Number(value.selected) : 60;
  const remaining = Number(value.remaining);
  const endTime = Number(value.endTime);
  if (!Number.isFinite(remaining) || remaining < 0 || remaining > 7200) return {...fallback, selected};
  if (value.running === true && Number.isFinite(endTime) && endTime > now) {
    return {selected, remaining: Math.max(0, (endTime - now) / 1000), running: true, endTime};
  }
  return {selected, remaining: value.running === true ? 0 : remaining, running: false, endTime: 0};
}

function initApp() {
  const $ = id => document.getElementById(id);
  const today = () => formatLocalDate(new Date());
  let data = {version: DATA_VERSION, logs: {}};
  let loadWarning = '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) data = normalizeBackup(JSON.parse(raw));
  } catch (error) {
    loadWarning = '現有本機資料格式異常，未有覆蓋原檔；請從備份匯入。';
  }

  let current = 'shoulder';
  let selected = today();
  let shownMonth = new Date().getMonth();
  let shownYear = new Date().getFullYear();
  let remaining = 60;
  let running = false;
  let endTime = 0;
  let interval = null;
  let toastTimer = null;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').style.display = 'block';
    toastTimer = setTimeout(() => {$('toast').style.display = 'none';}, 3000);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      $('sessionLabel').textContent = '已儲存';
      return true;
    } catch (error) {
      $('sessionLabel').textContent = '儲存失敗：請匯出備份';
      toast('本機儲存失敗，請立即匯出備份');
      return false;
    }
  }

  function day() {
    data.logs[selected] ||= {};
    return data.logs[selected];
  }

  function entry() {
    const selectedDay = day();
    selectedDay[current] ||= {sets: {}, notes: '', pain: ''};
    return selectedDay[current];
  }

  function saveTimer() {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify({selected: Number($('restSelect').value), remaining, running, endTime}));
    } catch (error) {
      // Training data is more important; timer persistence may fail independently.
    }
  }

  function updateRemaining() {
    if (running) remaining = Math.max(0, (endTime - Date.now()) / 1000);
  }

  function timerDisplay() {
    const seconds = Math.max(0, Math.ceil(remaining));
    $('timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    $('timerToggle').textContent = running ? '暫停' : '開始';
  }

  function finishTimer() {
    clearInterval(interval);
    interval = null;
    running = false;
    remaining = 0;
    endTime = 0;
    saveTimer();
    timerDisplay();
    $('timerNote').textContent = '休息完成，可以做下一組';
    if (navigator.vibrate) navigator.vibrate([180, 100, 180]);
  }

  function tick() {
    updateRemaining();
    if (remaining <= 0) finishTimer();
    else timerDisplay();
  }

  function pause() {
    if (running) updateRemaining();
    clearInterval(interval);
    interval = null;
    running = false;
    endTime = 0;
    saveTimer();
    timerDisplay();
  }

  function start() {
    if (running) return;
    if (remaining <= 0) remaining = Number($('restSelect').value);
    running = true;
    endTime = Date.now() + remaining * 1000;
    interval = setInterval(tick, 250);
    $('timerNote').textContent = '休息中';
    saveTimer();
    timerDisplay();
  }

  function startRest(seconds) {
    pause();
    $('restSelect').value = String(seconds);
    remaining = seconds;
    start();
  }

  function restoreTimer() {
    try {
      const state = restoreTimerState(JSON.parse(localStorage.getItem(TIMER_KEY) || 'null'));
      $('restSelect').value = String(state.selected);
      remaining = state.remaining;
      running = state.running;
      endTime = state.endTime;
      if (running) {
        $('timerNote').textContent = '休息中';
        interval = setInterval(tick, 250);
      } else if (remaining === 0) {
        $('timerNote').textContent = '休息完成，可以做下一組';
      }
    } catch (error) {
      remaining = 60;
    }
    timerDisplay();
  }

  function renderTrain() {
    const plan = plans[current];
    const record = entry();
    $('program').value = current;
    $('logDate').value = selected;
    $('trainDate').textContent = selected;
    $('pain').value = record.pain ?? '';
    $('notes').value = record.notes ?? '';
    let completed = 0;
    let total = 0;
    let html = '';

    plan.ex.forEach(exercise => {
      const [id, name, target, count, rest, url] = exercise;
      total += count;
      html += `<div class="exercise"><div class="row"><div><h3>${esc(name)}</h3><span class="muted">${esc(target)} · ${count} 組</span></div><a class="small" target="_blank" rel="noopener noreferrer" href="${url}">睇示範 ↗</a></div><div class="sets">`;
      for (let index = 1; index <= count; index += 1) {
        const key = `${id}-${index}`;
        const done = Boolean(record.sets?.[key]?.done);
        if (done) completed += 1;
        html += `<button class="set ${done ? 'done' : ''}" data-set="${esc(key)}" data-rest="${rest}" aria-label="${esc(name)} 第${index}組">${done ? '✓' : index}</button>`;
      }
      html += `</div><div class="row small"><span class="muted">重量／次數可按組記錄</span><button class="outline" data-detail="${esc(id)}">編輯組數資料</button></div><div id="detail-${id}" class="hidden"></div></div>`;
    });

    $('exerciseList').innerHTML = html;
    $('progressLabel').textContent = `${completed} / ${total} 組`;
    $('progressBar').style.width = `${total ? completed / total * 100 : 0}%`;

    $('exerciseList').querySelectorAll('[data-set]').forEach(button => {
      button.onclick = () => {
        const key = button.dataset.set;
        const recordNow = entry();
        recordNow.sets ||= {};
        const previous = recordNow.sets[key] || {};
        const done = !previous.done;
        recordNow.sets[key] = {...previous, done, at: done ? new Date().toISOString() : null};
        save();
        if (done && Number(button.dataset.rest)) startRest(Number(button.dataset.rest));
        renderTrain();
      };
    });
    $('exerciseList').querySelectorAll('[data-detail]').forEach(button => {button.onclick = () => showDetail(button.dataset.detail);});
  }

  function showDetail(id) {
    const container = $(`detail-${id}`);
    const exercise = plans[current].ex.find(item => item[0] === id);
    const record = entry();
    if (!container.classList.contains('hidden')) {
      container.classList.add('hidden');
      return;
    }
    let html = '<div style="padding:10px;background:#f5f8f4;border-radius:12px">';
    for (let index = 1; index <= exercise[3]; index += 1) {
      const key = `${id}-${index}`;
      const set = record.sets?.[key] || {};
      html += `<div class="row detail-row" style="margin-bottom:9px"><strong class="small">第 ${index} 組</strong><label class="small">kg<input class="field" style="width:78px" type="number" min="0" max="2000" step="0.5" data-weight="${key}" value="${esc(set.weight ?? '')}"></label><label class="small">次數<input class="field" style="width:78px" type="number" min="0" max="10000" step="1" data-reps="${key}" value="${esc(set.reps ?? '')}"></label></div>`;
    }
    container.innerHTML = `${html}</div>`;
    container.classList.remove('hidden');
    container.querySelectorAll('input').forEach(input => {
      input.onchange = () => {
        const key = input.dataset.weight || input.dataset.reps;
        const recordNow = entry();
        recordNow.sets ||= {};
        recordNow.sets[key] ||= {done: false, at: null, weight: '', reps: ''};
        const value = input.value === '' ? '' : String(Math.max(0, Number(input.value)));
        if (input.dataset.weight) recordNow.sets[key].weight = value;
        else recordNow.sets[key].reps = value;
        save();
      };
    });
  }

  function tab(name) {
    for (const view of ['train', 'calendar', 'settings']) $(`${view}View`).classList.toggle('hidden', view !== name);
    document.querySelectorAll('[data-tab]').forEach(button => button.classList.toggle('active', button.dataset.tab === name));
    if (name === 'calendar') renderCalendar();
    if (name === 'settings') renderStats();
  }

  function renderCalendar() {
    const month = new Date(shownYear, shownMonth, 1);
    $('monthLabel').textContent = `${month.getFullYear()} 年 ${month.getMonth() + 1} 月`;
    $('weekdays').innerHTML = ['日','一','二','三','四','五','六'].map(value => `<div class="week">${value}</div>`).join('');
    const start = month.getDay();
    const days = new Date(shownYear, shownMonth + 1, 0).getDate();
    let html = ''.padEnd(0);
    for (let index = 0; index < start; index += 1) html += '<div class="day blank"></div>';
    for (let dayNumber = 1; dayNumber <= days; dayNumber += 1) {
      const date = `${shownYear}-${String(shownMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const logs = data.logs[date] || {};
      const count = Object.values(logs).reduce((sum, item) => sum + Object.values(item.sets || {}).filter(set => set.done).length, 0);
      const note = Object.values(logs).some(item => Boolean(item.notes) || item.pain !== '');
      html += `<button class="day ${date === selected ? 'active' : ''} ${date === today() ? 'today' : ''}" data-date="${date}" aria-label="${date}${count ? `，完成 ${count} 組` : ''}"><span>${dayNumber}</span><span class="dots">${count ? '<span class="dot"></span>' : ''}${note ? '<span class="dot secondary-dot"></span>' : ''}</span></button>`;
    }
    $('calendar').innerHTML = html;
    $('calendar').querySelectorAll('[data-date]').forEach(button => {
      button.onclick = () => {selected = button.dataset.date; renderCalendar();};
    });
    $('selectedDateLabel').textContent = `${selected} 紀錄`;
    renderDayDetail();
  }

  function renderDayDetail() {
    const logs = data.logs[selected] || {};
    let html = '';
    let found = false;
    for (const [programId, programRecord] of Object.entries(logs)) {
      if (!plans[programId]) continue;
      const completed = Object.entries(programRecord.sets || {}).filter(([, set]) => set.done);
      if (!completed.length && !programRecord.notes && programRecord.pain === '') continue;
      found = true;
      html += `<div class="history"><strong>${esc(plans[programId].name)}</strong><div class="muted small">完成 ${completed.length} 組${programRecord.pain !== '' ? ` · 肩頸痛 ${esc(programRecord.pain)}/10` : ''}</div>`;
      for (const [key, set] of completed) {
        const exercise = plans[programId].ex.find(item => key.startsWith(`${item[0]}-`));
        html += `<div class="small" style="padding:3px 0">✓ ${esc(exercise?.[1] || key)} 第${esc(key.split('-').at(-1))}組${set.weight ? ` · ${esc(set.weight)} kg` : ''}${set.reps ? ` × ${esc(set.reps)}次` : ''}</div>`;
      }
      if (programRecord.notes) html += `<div class="small muted">備註：${esc(programRecord.notes)}</div>`;
      html += '</div>';
    }
    $('dayDetail').innerHTML = found ? html : '<p class="muted">呢日未有訓練紀錄。</p>';
  }

  function renderStats() {
    const summary = summarizeLogs(data);
    $('stats').textContent = `已訓練 ${summary.days} 日 · 完成 ${summary.sets} 組`;
  }

  function moveMonth(delta) {
    shownMonth += delta;
    if (shownMonth < 0) {shownMonth = 11; shownYear -= 1;}
    if (shownMonth > 11) {shownMonth = 0; shownYear += 1;}
    selected = `${shownYear}-${String(shownMonth + 1).padStart(2, '0')}-01`;
    renderCalendar();
  }

  for (let score = 0; score <= 10; score += 1) $('pain').insertAdjacentHTML('beforeend', `<option value="${score}">${score}/10</option>`);
  $('program').onchange = event => {current = event.target.value; renderTrain();};
  $('logDate').onchange = event => {
    if (!isValidDateKey(event.target.value)) {event.target.value = selected; return;}
    selected = event.target.value;
    shownYear = Number(selected.slice(0, 4));
    shownMonth = Number(selected.slice(5, 7)) - 1;
    renderTrain();
  };
  $('pain').onchange = event => {entry().pain = event.target.value; save();};
  $('notes').oninput = event => {entry().notes = event.target.value.slice(0, 5000); save();};
  $('timerToggle').onclick = () => running ? pause() : start();
  $('timerReset').onclick = () => {pause(); remaining = Number($('restSelect').value); $('timerNote').textContent = '準備開始'; saveTimer(); timerDisplay();};
  $('restSelect').onchange = () => $('timerReset').click();
  document.querySelectorAll('[data-tab]').forEach(button => {button.onclick = () => tab(button.dataset.tab);});
  $('prevMonth').onclick = () => moveMonth(-1);
  $('nextMonth').onclick = () => moveMonth(1);
  $('editSelected').onclick = () => {current = Object.keys(data.logs[selected] || {}).find(key => plans[key]) || 'shoulder'; renderTrain(); tab('train');};
  $('export').onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fitness-backup-${today()}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('備份已準備下載');
  };
  $('importBtn').onclick = () => $('importFile').click();
  $('importFile').onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('檔案超過 2 MB');
      const imported = normalizeBackup(JSON.parse(await file.text()));
      if (!confirm('匯入會覆蓋目前紀錄，確定繼續？')) return;
      data = imported;
      save();
      renderTrain();
      toast('已匯入備份');
    } catch (error) {
      toast(`匯入失敗：${error.message}`);
    } finally {
      event.target.value = '';
    }
  };
  $('clearData').onclick = () => {
    if (confirm('確定清除全部訓練紀錄？無法還原。')) {
      data = {version: DATA_VERSION, logs: {}};
      save();
      renderTrain();
      renderStats();
      toast('紀錄已清除');
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && running) tick();
  });
  window.addEventListener('pageshow', () => {if (running) tick();});

  $('todayLabel').textContent = today();
  renderTrain();
  restoreTimer();
  if (loadWarning) setTimeout(() => toast(loadWarning), 0);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js', {scope: './'}).catch(() => {});
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') initApp();
