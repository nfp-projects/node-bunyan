/*
 * Test the RingBuffer output stream.
 */

import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'
var ringbuffer = new bunyan.RingBuffer({ 'limit': 5 });

var log1 = new bunyan({
  name: 'log1',
  streams: [
    {
      stream: ringbuffer,
      type: 'raw',
      level: 'info'
    }
  ]
});

t.test('ringbuffer', function () {
  log1.info('hello');
  log1.trace('there');
  log1.error('android');
  assert.strictEqual(ringbuffer.records.length, 2);
  assert.strictEqual(ringbuffer.records[0]['msg'], 'hello');
  assert.strictEqual(ringbuffer.records[1]['msg'], 'android');
  log1.error('one');
  log1.error('two');
  log1.error('three');
  assert.strictEqual(ringbuffer.records.length, 5);
  log1.error('four');
  assert.strictEqual(ringbuffer.records.length, 5);
  assert.strictEqual(ringbuffer.records[0]['msg'], 'android');
  assert.strictEqual(ringbuffer.records[1]['msg'], 'one');
  assert.strictEqual(ringbuffer.records[2]['msg'], 'two');
  assert.strictEqual(ringbuffer.records[3]['msg'], 'three');
  assert.strictEqual(ringbuffer.records[4]['msg'], 'four');
});
