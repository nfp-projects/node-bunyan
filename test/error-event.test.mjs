/*
 * Copyright 2016 Trent Mick
 *
 * Test emission and handling of 'error' event in a logger with a 'path'
 * stream.
 */

import { EventEmitter } from 'events'
import util from 'util'
import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'


var BOGUS_PATH = '/this/path/is/bogus.log';

t.test('error event on file stream (reemitErrorEvents=undefined)', function (cb) {
  var log = bunyan.createLogger(
    {name: 'error-event-1', streams: [ {path: BOGUS_PATH} ]});
  log.on('error', function (err, stream) {
    try {
      assert.ok(err, 'got err in error event: ' + err);
      assert.strictEqual(err.code, 'ENOENT', 'error code is ENOENT');
      assert.ok(stream, 'got a stream argument');
      assert.strictEqual(stream.path, BOGUS_PATH);
      assert.strictEqual(stream.type, 'file');
      cb()
    } catch (err) {
      cb(err)
    }
  });
  log.info('info log message');
});

t.test('error event on file stream (reemitErrorEvents=true)', function (cb) {
  var log = bunyan.createLogger({
    name: 'error-event-2',
    streams: [ {
      path: BOGUS_PATH,
      reemitErrorEvents: true
    } ]
  });
  log.on('error', function (err, stream) {
    try {
      assert.ok(err, 'got err in error event: ' + err);
      assert.strictEqual(err.code, 'ENOENT', 'error code is ENOENT');
      assert.ok(stream, 'got a stream argument');
      assert.strictEqual(stream.path, BOGUS_PATH);
      assert.strictEqual(stream.type, 'file');
      cb()
    } catch(err) {
      cb(err)
    }
  });
  log.info('info log message');
});

t.test('error event on file stream (reemitErrorEvents=false)',
    function (cb) {
  var log = bunyan.createLogger({
    name: 'error-event-3',
    streams: [ {
      path: BOGUS_PATH,
      reemitErrorEvents: false
    } ]
  });
  // Hack into the underlying created file stream to catch the error event.
  log.streams[0].stream.on('error', function (err) {
    try {
      assert.ok(err, 'got error event on the file stream');
      cb()
    } catch (err) {
      cb(err)
    }
  });
  log.on('error', function (err, stream) {
    cb('should not have gotten error event on logger')
  });
  log.info('info log message');
});


function MyErroringStream() {}
util.inherits(MyErroringStream, EventEmitter);
MyErroringStream.prototype.write = function (rec) {
  this.emit('error', new Error('boom'));
}

t.test('error event on raw stream (reemitErrorEvents=undefined)', function (cb) {
  var estream = new MyErroringStream();
  var log = bunyan.createLogger({
    name: 'error-event-raw',
    streams: [
      {
        stream: estream,
        type: 'raw'
      }
    ]
  });
  estream.on('error', function (err) {
    try {
      assert.ok(err, 'got error event on the raw stream');
      cb()
    } catch (err) {
      cb(err)
    }
  });
  log.on('error', function (err, stream) {
    cb('should not have gotten error event on logger');
  });
  log.info('info log message');
});

t.test('error event on raw stream (reemitErrorEvents=false)', function (cb) {
  var estream = new MyErroringStream();
  var log = bunyan.createLogger({
    name: 'error-event-raw',
    streams: [
      {
        stream: estream,
        type: 'raw',
        reemitErrorEvents: false
      }
    ]
  });
  estream.on('error', function (err) {
    try {
      assert.ok(err, 'got error event on the raw stream');
      cb()
    } catch (err) {
      cb(err)
    }
  });
  log.on('error', function (err, stream) {
    cb('should not have gotten error event on logger');
  });
  log.info('info log message');
});

t.test('error event on raw stream (reemitErrorEvents=true)', function (cb) {
  var estream = new MyErroringStream();
  var log = bunyan.createLogger({
    name: 'error-event-raw',
    streams: [
      {
        stream: estream,
        type: 'raw',
        reemitErrorEvents: true
      }
    ]
  });
  log.on('error', function (err, stream) {
    try {
      assert.ok(err, 'got err in error event: ' + err);
      assert.strictEqual(err.message, 'boom');
      assert.ok(stream, 'got a stream argument');
      assert.ok(stream.stream instanceof MyErroringStream);
      assert.strictEqual(stream.type, 'raw');
      cb()
    } catch (err) {
      cb(err)
    }
  });
  log.info('info log message');
});
