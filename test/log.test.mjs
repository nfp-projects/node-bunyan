/*
 * Test the `log.trace(...)`, `log.debug(...)`, ..., `log.fatal(...)` API.
 */

import { Eltro as t, assert} from 'eltro'
import { format } from 'util'
import bunyan from '../lib/bunyan.mjs'

// ---- test boolean `log.<level>()` calls

var log1 = bunyan.createLogger({
  name: 'log1',
  streams: [
    {
      stream: process.stdout,
      level: 'info'
    }
  ]
});

var log2 = bunyan.createLogger({
  name: 'log2',
  streams: [
    {
      stream: process.stdout,
      level: 'error'
    },
    {
      stream: process.stdout,
      level: 'debug'
    }
  ]
})

t.test('log.LEVEL() -> boolean', function () {
  assert.strictEqual(log1.trace(), false, 'log1.trace() is false')
  assert.strictEqual(log1.debug(), false)
  assert.strictEqual(log1.info(), true)
  assert.strictEqual(log1.warn(), true)
  assert.strictEqual(log1.error(), true)
  assert.strictEqual(log1.fatal(), true)

  // Level is the *lowest* level of all streams.
  assert.strictEqual(log2.trace(), false)
  assert.strictEqual(log2.debug(), true)
  assert.strictEqual(log2.info(), true)
  assert.strictEqual(log2.warn(), true)
  assert.strictEqual(log2.error(), true)
  assert.strictEqual(log2.fatal(), true)
});


// ---- test `log.<level>(...)` calls which various input types

function Catcher() {
  this.records = [];
}
Catcher.prototype.write = function (record) {
  this.records.push(record);
}
var catcher = new Catcher();
var log3 = new bunyan.createLogger({
  name: 'log3',
  streams: [
    {
      type: 'raw',
      stream: catcher,
      level: 'trace'
    }
  ]
});

var names = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
var fields = {one: 'un'};

t.test('log.info(undefined, <msg>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](undefined, 'some message');
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'undefined some message');
  });
});

t.test('log.info(<fields>, undefined)', function () {
  names.forEach(function (lvl) {
    log3[lvl](fields, undefined);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'undefined');
    assert.strictEqual(rec.one, 'un');
  });
});

t.test('log.info(null, <msg>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](null, 'some message');
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'some message');
  });
});

t.test('log.info(<fields>, null)', function () {
  names.forEach(function (lvl) {
    log3[lvl](fields, null);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'null');
    assert.strictEqual(rec.one, 'un');
  });
});

t.test('log.info(<str>)', function () {
  names.forEach(function (lvl) {
    log3[lvl]('some message');
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'some message');
  });
});

t.test('log.info(<fields>, <str>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](fields, 'some message');
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'some message');
    assert.strictEqual(rec.one, 'un');
  });
});

t.test('log.info(<bool>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](true);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'true');
  });
});

t.test('log.info(<fields>, <bool>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](fields, true);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'true');
    assert.strictEqual(rec.one, 'un');
  });
});

t.test('log.info(<num>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](3.14);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, '3.14');
  });
});

t.test('log.info(<fields>, <num>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](fields, 3.14);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, '3.14');
    assert.strictEqual(rec.one, 'un');
  });
});

t.test('log.info(<function>)', function () {
  var func = function func1() {};
  names.forEach(function (lvl) {
    log3[lvl](func);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, '[Function: func1]');
  });
});

t.test('log.info(<fields>, <function>)', function () {
  var func = function func2() {};
  names.forEach(function (lvl) {
    log3[lvl](fields, func);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, '[Function: func2]');
    assert.strictEqual(rec.one, 'un');
  });
});

t.test('log.info(<array>)', function () {
  var arr = ['a', 1, {two: 'deux'}];
  names.forEach(function (lvl) {
    log3[lvl](arr);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, format(arr));
  });
});

t.test('log.info(<fields>, <array>)', function () {
  var arr = ['a', 1, {two: 'deux'}];
  names.forEach(function (lvl) {
    log3[lvl](fields, arr);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, format(arr));
    assert.strictEqual(rec.one, 'un');
  });
});


/*
 * By accident (starting with trentm/node-bunyan#85 in bunyan@0.23.0),
 *      log.info(null, ...)
 * was interpreted as `null` being the object of fields. It is gracefully
 * handled, which is good. However, had I to do it again, I would have made
 * that interpret `null` as the *message*, and no fields having been passed.
 * I think it is baked now. It would take a major bunyan rev to change it,
 * but I don't think it is worth it: passing `null` as the first arg isn't
 * really an intended way to call these Bunyan methods for either case.
 */

t.test('log.info(null)', function () {
  names.forEach(function (lvl) {
    log3[lvl](null);
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, '', format('log.%s msg: got %j', lvl, rec.msg));
  });
});

t.test('log.info(null, <msg>)', function () {
  names.forEach(function (lvl) {
    log3[lvl](null, 'my message');
    var rec = catcher.records[catcher.records.length - 1];
    assert.strictEqual(rec.msg, 'my message');
  });
});
