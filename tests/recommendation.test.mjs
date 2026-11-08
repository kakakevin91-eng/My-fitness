import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestProgram} from '../recommendation.js';

const done = key => ({sets: {[key]: {done: true}}});

test('新用戶由全身計劃開始，今日已完成則保持同一計劃', () => {
  assert.equal(suggestProgram({}, '2026-11-09').id, 'gymFullA');
  const logs = {'2026-11-09': {gymChest: done('chestPress-1')}};
  assert.equal(suggestProgram(logs, '2026-11-09').id, 'gymChest');
});

test('昨日做力量且本週帶氧不足，建議 45 分鐘帶氧', () => {
  const logs = {'2026-11-08': {gymQuads: done('legPress-1')}};
  const result = suggestProgram(logs, '2026-11-09');
  assert.equal(result.id, 'cardio45');
  assert.match(result.reason, /45 分鐘/);
});

test('帶氧後建議力量，沒有完成的組數不計入', () => {
  const logs = {'2026-11-08': {cardio45: done('cardio-1'), gymChest: {sets: {'chestPress-1': {done: false}}}}};
  assert.ok(suggestProgram(logs, '2026-11-09').id.startsWith('gym'));
});

test('不會用未來日期或未完成紀錄影響建議', () => {
  const logs = {'2026-11-10': {gymBack: done('latPulldown-1')}, '2026-11-08': {gymChest: {sets: {'chestPress-1': {done: false}}}}};
  assert.equal(suggestProgram(logs, '2026-11-09').id, 'gymFullA');
});
