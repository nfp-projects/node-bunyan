/*
 * If available, use `safe-json-stringfy` as a fallback stringifier.
 * This covers the case where an enumerable property throws an error
 * in its getter.
 *
 * See <https://github.com/trentm/node-bunyan/pull/182>
 */

import { Eltro as t, assert} from 'eltro'
import { exec, dirname } from './helper.mjs'


t.test('__defineGetter__ boom', async function () {
  let res = await exec('', 'node', dirname('/safe-json-stringify-1.mjs'))
  
  var rec = JSON.parse(res.stdout.trim());
  assert.strictEqual(rec.obj.boom, '[Throws: __defineGetter__ ouch!]');
});

t.test('__defineGetter__ boom, without safe-json-stringify', async function () {
  let res = await exec('', 'node', dirname('/safe-json-stringify-2.mjs'))
  assert.ok(res.stdout.indexOf('Exception in JSON.stringify') !== -1);
  assert.ok(res.stderr.indexOf(
    'You can install the "safe-json-stringify" module') !== -1);
});

t.test('defineProperty boom', async function () {
  let res = await exec('', 'node', dirname('/safe-json-stringify-3.mjs'))
  var recs = res.stdout.trim().split(/\n/g);
  assert.strictEqual(recs.length, 2);
  var rec = JSON.parse(recs[0]);
  assert.strictEqual(rec.obj.boom, '[Throws: defineProperty ouch!]');
});

t.test('defineProperty boom, without safe-json-stringify', async function () {
  let res = await exec('', 'node', dirname('/safe-json-stringify-4.mjs'))
  
  assert.ok(res.stdout.indexOf('Exception in JSON.stringify') !== -1);
  assert.strictEqual(res.stdout.match(/Exception in JSON.stringify/g).length, 2);
  assert.ok(res.stderr.indexOf(
    'You can install the "safe-json-stringify" module') !== -1);
  assert.strictEqual(res.stderr.match(
    /You can install the "safe-json-stringify" module/g).length, 1);
});
