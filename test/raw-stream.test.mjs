/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test `type: 'raw'` Logger streams.
 */

import { Eltro as t, assert} from 'eltro'
import { format } from 'util'
import bunyan from '../lib/bunyan.mjs'


function CapturingStream(recs) {
  this.recs = recs;
}
CapturingStream.prototype.write = function (rec) {
  this.recs.push(rec);
}


t.test('raw stream', function () {
  var recs = [];

  var log = new bunyan({
    name: 'raw-stream-test',
    streams: [
      {
        stream: new CapturingStream(recs),
        type: 'raw'
      }
    ]
  });
  log.info('first');
  log.info({two: 'deux'}, 'second');

  assert.strictEqual(recs.length, 2);
  assert.strictEqual(typeof (recs[0]), 'object', 'first rec is an object');
  assert.strictEqual(recs[1].two, 'deux', '"two" field made it through');
});


t.test('raw streams and regular streams can mix', function () {
  var rawRecs = [];
  var nonRawRecs = [];

  var log = new bunyan({
    name: 'raw-stream-test',
    streams: [
      {
        stream: new CapturingStream(rawRecs),
        type: 'raw'
      },
      {
        stream: new CapturingStream(nonRawRecs)
      }
    ]
  });
  log.info('first');
  log.info({two: 'deux'}, 'second');

  assert.strictEqual(rawRecs.length, 2);
  assert.strictEqual(typeof (rawRecs[0]), 'object', 'first rawRec is an object');
  assert.strictEqual(rawRecs[1].two, 'deux', '"two" field made it through');

  assert.strictEqual(nonRawRecs.length, 2);
  assert.strictEqual(typeof (nonRawRecs[0]), 'string', 'first nonRawRec is a string');

});


t.test('child adding a non-raw stream works', function () {
  var parentRawRecs = [];
  var rawRecs = [];
  var nonRawRecs = [];

  var logParent = new bunyan({
    name: 'raw-stream-test',
    streams: [
      {
        stream: new CapturingStream(parentRawRecs),
        type: 'raw'
      }
    ]
  });
  var logChild = logParent.child({
    child: true,
    streams: [
      {
        stream: new CapturingStream(rawRecs),
        type: 'raw'
      },
      {
        stream: new CapturingStream(nonRawRecs)
      }
    ]
  });
  logParent.info('first');
  logChild.info({two: 'deux'}, 'second');

  assert.strictEqual(rawRecs.length, 1,
    format('rawRecs length should be 1 (is %d)', rawRecs.length));
  assert.strictEqual(typeof (rawRecs[0]), 'object', 'rawRec entry is an object');
  assert.strictEqual(rawRecs[0].two, 'deux', '"two" field made it through');

  assert.strictEqual(nonRawRecs.length, 1);
  assert.strictEqual(typeof (nonRawRecs[0]), 'string', 'first nonRawRec is a string');

});
