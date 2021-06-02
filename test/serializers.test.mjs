/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test the standard serializers in Bunyan.
 */

import http from 'http'
import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'

function CapturingStream(recs) {
  this.recs = recs;
}
CapturingStream.prototype.write = function (rec) {
  this.recs.push(rec);
}

t.test('req serializer', function (cb) {
  var records = [];
  var log = bunyan.createLogger({
    name: 'serializer-test',
    streams: [
      {
        stream: new CapturingStream(records),
        type: 'raw'
      }
    ],
    serializers: {
      req: bunyan.stdSerializers.req
    }
  });

  // None of these should blow up.
  var bogusReqs = [
    undefined,
    null,
    {},
    1,
    'string',
    [1, 2, 3],
    {'foo':'bar'}
  ];
  for (var i = 0; i < bogusReqs.length; i++) {
    log.info({req: bogusReqs[i]}, 'hi');
    assert.strictEqual(records[i].req, bogusReqs[i]);
  }

  // Get http request and response objects to play with and test.
  var theReq, theRes;
  var server = http.createServer(function (req, res) {
    theReq = req;
    theRes = res;
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  })
  server.listen(8765, function () {
    http.get({host: '127.0.0.1', port: 8765, path: '/'}, function (res) {
      res.resume();
      log.info({req: theReq}, 'the request');
      var lastRecord = records[records.length-1];

      try {
        assert.strictEqual(lastRecord.req.method, 'GET');
        assert.strictEqual(lastRecord.req.url, theReq.url);
        assert.strictEqual(lastRecord.req.remoteAddress,
          theReq.connection.remoteAddress);
        assert.strictEqual(lastRecord.req.remotePort, theReq.connection.remotePort);
      } catch (err) {
        cb(err)
      }
      server.close();
      cb()
    }).on('error', function (err) {
      server.close();
      cb(err)
    });
  });
});


t.test('res serializer', function (cb) {
  var records = [];
  var log = bunyan.createLogger({
    name: 'serializer-test',
    streams: [
      {
        stream: new CapturingStream(records),
        type: 'raw'
      }
    ],
    serializers: {
      res: bunyan.stdSerializers.res
    }
  });

  // None of these should blow up.
  var bogusRess = [
    undefined,
    null,
    {},
    1,
    'string',
    [1, 2, 3],
    {'foo':'bar'}
  ];
  for (var i = 0; i < bogusRess.length; i++) {
    log.info({res: bogusRess[i]}, 'hi');
    assert.strictEqual(records[i].res, bogusRess[i]);
  }

  // Get http request and response objects to play with and test.
  var theReq, theRes;
  var server = http.createServer(function (req, res) {
    theReq = req;
    theRes = res;
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  })
  server.listen(8765, function () {
    http.get({host: '127.0.0.1', port: 8765, path: '/'}, function (res) {
      res.resume();
      log.info({res: theRes}, 'the response');
      var lastRecord = records[records.length-1];
      try {
        assert.strictEqual(lastRecord.res.statusCode, theRes.statusCode);
        assert.strictEqual(lastRecord.res.header, theRes._header);
      } catch (err) {
        cb(err)
      }
      server.close();
      cb()
    }).on('error', function (err) {
      server.close();
      cb(err)
    });
  });
});


t.test('err serializer', function () {
  var records = [];
  var log = bunyan.createLogger({
    name: 'serializer-test',
    streams: [
      {
        stream: new CapturingStream(records),
        type: 'raw'
      }
    ],
    serializers: {
      err: bunyan.stdSerializers.err
    }
  });

  // None of these should blow up.
  var bogusErrs = [
    undefined,
    null,
    {},
    1,
    'string',
    [1, 2, 3],
    {'foo':'bar'}
  ];
  for (var i = 0; i < bogusErrs.length; i++) {
    log.info({err: bogusErrs[i]}, 'hi');
    assert.strictEqual(records[i].err, bogusErrs[i]);
  }

  var theErr = new TypeError('blah');

  log.info(theErr, 'the error');
  var lastRecord = records[records.length-1];
  assert.strictEqual(lastRecord.err.message, theErr.message);
  assert.strictEqual(lastRecord.err.name, theErr.name);
  assert.strictEqual(lastRecord.err.stack, theErr.stack);
});

t.test('err serializer: custom serializer', function () {
  var records = [];

  function customSerializer(err) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack,
      beep: err.beep
    };
  }

  var log = bunyan.createLogger({
    name: 'serializer-test',
    streams: [
      {
        stream: new CapturingStream(records),
        type: 'raw'
      }
    ],
    serializers: {
      err: customSerializer
    }
  });

  var e1 = new Error('message1');
  e1.beep = 'bop';
  var e2 = new Error('message2');
  var errs = [e1, e2];

  for (var i = 0; i < errs.length; i++) {
    log.info(errs[i]);
    assert.strictEqual(records[i].err.message, errs[i].message);
    assert.strictEqual(records[i].err.beep, errs[i].beep);
  }
});

// Bunyan 0.18.3 introduced a bug where *all* serializers are applied
// even if the log record doesn't have the associated key. That means
// serializers that don't handle an `undefined` value will blow up.
t.test('do not apply serializers if no record key', function () {
  var records = [];
  var log = bunyan.createLogger({
    name: 'serializer-test',
    streams: [ {
        stream: new CapturingStream(records),
        type: 'raw'
    } ],
    serializers: {
      err: bunyan.stdSerializers.err,
      boom: function (value) {
        throw new Error('boom');
      }
    }
  });

  log.info({foo: 'bar'}, 'record one');
  log.info({err: new Error('record two err')}, 'record two');

  assert.strictEqual(records[0].boom, undefined);
  assert.strictEqual(records[0].foo, 'bar');
  assert.strictEqual(records[1].boom, undefined);
  assert.strictEqual(records[1].err.message, 'record two err');
});
