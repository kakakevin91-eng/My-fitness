import {gymPlans} from './gym-plans.js';
import {activePlanIds} from './gym-plans.js';

const targets = {
  gymFullA: ['chest', 'back', 'legs', 'core'],
  gymFullB: ['chest', 'back', 'legs', 'core'],
  gymChest: ['chest', 'arms'],
  gymBack: ['back', 'shoulders'],
  gymShoulder: ['shoulders'],
  gymQuads: ['legs'],
  gymPosterior: ['legs'],
  gymArms: ['arms'],
  gymCore: ['core'],
  gymUpper: ['chest', 'back', 'shoulders', 'arms'],
  shoulder: ['shoulders', 'back']
};

const dateNumber = key => Date.parse(`${key}T00:00:00Z`);
const completedCount = entry => Object.values(entry?.sets || {}).filter(set => set?.done === true).length;

export function suggestProgram(logs, dateKey) {
  const sessions = Object.entries(logs || {}).flatMap(([date, day]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > dateKey || !day || typeof day !== 'object') return [];
    return Object.entries(day).filter(([, entry]) => completedCount(entry) > 0)
      .map(([id, entry]) => ({date, id, count: completedCount(entry)}));
  }).sort((a, b) => b.date.localeCompare(a.date));

  if (!sessions.length) return {id: 'gymFullA', reason: '未有完成紀錄，先由全身基礎開始。'};

  const today = sessions.filter(session => session.date === dateKey && activePlanIds.includes(session.id));
  if (today.length) {
    const latest = today[0];
    return {id: latest.id, reason: '今日已有訓練紀錄，繼續完成呢套 Programme。'};
  }

  const latest = sessions[0];
  const daysSince = Math.floor((dateNumber(dateKey) - dateNumber(latest.date)) / 86400000);
  const weekAgo = dateNumber(dateKey) - 7 * 86400000;
  const cardioMinutes = sessions.filter(s => s.id === 'cardio45' && dateNumber(s.date) >= weekAgo).length * 45;
  if (daysSince === 1 && latest.id !== 'cardio45' && cardioMinutes < 150) {
    return {id: 'cardio45', reason: `昨日完成咗力量訓練；近 7 日記錄到 ${cardioMinutes} 分鐘帶氧，可考慮今日做 45 分鐘帶氧。`};
  }

  const gymIds = Object.keys(gymPlans);
  const candidates = gymIds.map((id, order) => {
    const same = sessions.find(s => s.id === id);
    const lastTargets = targets[latest.id] || [];
    const overlap = targets[id].filter(part => lastTargets.includes(part)).length;
    const age = same ? Math.min(14, Math.floor((dateNumber(dateKey) - dateNumber(same.date)) / 86400000)) : 15;
    const recentFrequency = sessions.filter(s => s.id === id && dateNumber(s.date) >= weekAgo).length;
    const score = age - overlap * (daysSince <= 2 ? 5 : 1) - recentFrequency * 2;
    return {id, order, score};
  }).sort((a, b) => b.score - a.score || a.order - b.order);
  const choice = candidates[0].id;
  return {id: choice, reason: latest.id === 'cardio45'
    ? '上次係帶氧；今日可考慮力量訓練，優先揀近期較少做嘅 Programme。'
    : '根據最近完成日期同訓練部位，優先揀近期較少做嘅 Programme。'};
}
