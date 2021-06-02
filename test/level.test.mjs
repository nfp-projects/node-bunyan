/*
 * Test the `log.level(...)`.
 */

import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'
import { dirname } from './helper.mjs'


// ---- test boolean `log.<level>()` calls

var log1 = bunyan.createLogger({
  name: 'log1',
  streams: [
    {
      level: 'info',
      stream: process.stdout,
    }
  ]
});


t.test('log.level() -> level num', function () {
  assert.strictEqual(log1.level(), bunyan.INFO);
});

t.test('log.level(<const>)', function () {
  log1.level(bunyan.DEBUG);
  assert.strictEqual(log1.level(), bunyan.DEBUG);
});

t.test('log.level(<num>)', function () {
  log1.level(10);
  assert.strictEqual(log1.level(), bunyan.TRACE);
});

t.test('log.level(<name>)', function () {
  log1.level('error');
  assert.strictEqual(log1.level(), bunyan.ERROR);
});

// A trick to turn logging off.
// See <https://github.com/trentm/node-bunyan/pull/148#issuecomment-53232979>.
t.test('log.level(FATAL + 1)', function () {
  log1.level(bunyan.FATAL + 1);
  assert.strictEqual(log1.level(), bunyan.FATAL + 1);
});

t.test('log.level(<weird numbers>)', function () {
  log1.level(0);
  assert.strictEqual(log1.level(), 0);
  log1.level(Number.MAX_VALUE);
  assert.strictEqual(log1.level(), Number.MAX_VALUE);
  log1.level(Infinity);
  assert.strictEqual(log1.level(), Infinity);
});

t.test('log.level(<invalid values>)', function () {
  assert.throws(function () {
    bunyan.createLogger({name: 'invalid', level: 'booga'});
  }, /unknown level name: "booga"/);
  assert.throws(function () {
    bunyan.createLogger({name: 'invalid', level: []});
  }, /cannot resolve level: invalid arg \(object\): \[\]/);
  assert.throws(function () {
    bunyan.createLogger({name: 'invalid', level: true});
  }, /cannot resolve level: invalid arg \(boolean\): true/);
  assert.throws(function () {
    bunyan.createLogger({name: 'invalid', level: -1});
  }, /level is not a positive integer: -1/);
  assert.throws(function () {
    bunyan.createLogger({name: 'invalid', level: 3.14});
  }, /level is not a positive integer: 3.14/);
  assert.throws(function () {
    bunyan.createLogger({name: 'invalid', level: -Infinity});
  }, /level is not a positive integer: -Infinity/);
});
