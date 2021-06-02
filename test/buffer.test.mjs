/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 * Copyright (c) 2012 Joyent Inc. All rights reserved.
 *
 * Test logging with (accidental) usage of buffers.
 */

import util from 'util'
import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'

const inspect = util.inspect
const format = util.format


function Catcher() {
  this.records = []
}
Catcher.prototype.write = function (record) {
  this.records.push(record)
}

let catcher = new Catcher()
let log = new bunyan.createLogger({
  name: 'buffer.test',
  streams: [
    {
      type: 'raw',
      stream: catcher,
      level: 'trace'
    }
  ]
})


t.test('log.info(BUFFER)', function () {
  let b = Buffer.from('foo')

  let testLevels = ['trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal']
  
  testLevels.forEach(function (lvl) {
    log[lvl].call(log, b)
    let rec = catcher.records[catcher.records.length - 1]
    assert.strictEqual(rec.msg, inspect(b),
      format('log.%s msg is inspect(BUFFER)', lvl))
    assert.ok(rec['0'] === undefined,
      'no "0" array index key in record: ' + inspect(rec['0']))
    assert.ok(rec['parent'] === undefined,
      'no "parent" array index key in record: ' + inspect(rec['parent']))

    log[lvl].call(log, b, 'bar')
    rec = catcher.records[catcher.records.length - 1]
    assert.strictEqual(rec.msg, inspect(b) + ' bar', format(
      'log.%s(BUFFER, "bar") msg is inspect(BUFFER) + " bar"', lvl))
  })
})


//test('log.info({buf: BUFFER})', function (t) {
//  let b = new Buffer('foo')
//
//  // Really there isn't much Bunyan can do here. See
//  // <https://github.com/joyent/node/issues/3905>. An unwelcome hack would
//  // be to monkey-patch in Buffer.toJSON. Bletch.
//  log.info({buf: b}, 'my message')
//  let rec = catcher.records[catcher.records.length - 1]
//
//  t.end()
//})
