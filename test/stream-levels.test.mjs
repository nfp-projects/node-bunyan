/*
 * Test that streams (the various way they can be added to
 * a Logger instance) get the appropriate level.
 */
import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'


// ---- Tests


t.test('default stream log level', function () {
  var log = bunyan.createLogger({
    name: 'foo'
  });
  assert.strictEqual(log.level(), bunyan.INFO);
  assert.strictEqual(log.streams[0].level, bunyan.INFO);
});

t.test('default stream, level=DEBUG specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    level: bunyan.DEBUG
  });
  assert.strictEqual(log.level(), bunyan.DEBUG);
  assert.strictEqual(log.streams[0].level, bunyan.DEBUG);
});

t.test('default stream, level="trace" specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    level: 'trace'
  });
  assert.strictEqual(log.level(), bunyan.TRACE);
  assert.strictEqual(log.streams[0].level, bunyan.TRACE);
});

t.test('stream & level="trace" specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    stream: process.stderr,
    level: 'trace'
  });
  assert.strictEqual(log.level(), bunyan.TRACE);
  assert.strictEqual(log.streams[0].level, bunyan.TRACE);
});

t.test('one stream, default level', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    streams: [
      {
        stream: process.stderr
      }
    ]
  });
  assert.strictEqual(log.level(), bunyan.INFO);
  assert.strictEqual(log.streams[0].level, bunyan.INFO);
});

t.test('one stream, top-"level" specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    level: 'error',
    streams: [
      {
        stream: process.stderr
      }
    ]
  });
  assert.strictEqual(log.level(), bunyan.ERROR);
  assert.strictEqual(log.streams[0].level, bunyan.ERROR);
});

t.test('one stream, stream-"level" specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    streams: [
      {
        stream: process.stderr,
        level: 'error'
      }
    ]
  });
  assert.strictEqual(log.level(), bunyan.ERROR);
  assert.strictEqual(log.streams[0].level, bunyan.ERROR);
});

t.test('one stream, both-"level" specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    level: 'debug',
    streams: [
      {
        stream: process.stderr,
        level: 'error'
      }
    ]
  });
  assert.strictEqual(log.level(), bunyan.ERROR);
  assert.strictEqual(log.streams[0].level, bunyan.ERROR);
});

t.test('two streams, both-"level" specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    level: 'debug',
    streams: [
      {
        stream: process.stdout,
        level: 'trace'
      },
      {
        stream: process.stderr,
        level: 'fatal'
      }
    ]
  });
  assert.strictEqual(log.level(), bunyan.TRACE, 'log.level()');
  assert.strictEqual(log.streams[0].level, bunyan.TRACE);
  assert.strictEqual(log.streams[1].level, bunyan.FATAL);
});

t.test('two streams, one with "level" specified', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    streams: [
      {
        stream: process.stdout,
      },
      {
        stream: process.stderr,
        level: 'fatal'
      }
    ]
  });
  assert.strictEqual(log.level(), bunyan.INFO);
  assert.strictEqual(log.streams[0].level, bunyan.INFO);
  assert.strictEqual(log.streams[1].level, bunyan.FATAL);
});

// Issue #335
t.test('log level 0 to turn on all logging', function () {
  var log = bunyan.createLogger({
    name: 'foo',
    level: 0
  });
  assert.strictEqual(log.level(), 0);
  assert.strictEqual(log.streams[0].level, 0);
});
