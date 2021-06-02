/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Make sure cycles are safe.
 */

import { Stream } from 'stream'
import { Eltro as t, assert} from 'eltro'
import Logger from '../lib/bunyan.mjs'

var outstr = new Stream;
outstr.writable = true;
var output = [];
outstr.write = function (c) {
  output.push(JSON.parse(c + ''));
};
outstr.end = function (c) {
  if (c) this.write(c);
  this.emit('end');
};

// these are lacking a few fields that will probably never match
var expect = [
  {
    'name': 'blammo',
    'level': 30,
    'msg': 'bango <ref *1> { bang: \'boom\', KABOOM: [Circular *1] }',
    'v': 0
  },
  {
    'name': 'blammo',
    'level': 30,
    'msg': 'kaboom <ref *1> { bang: \'boom\', KABOOM: [Circular *1] }',
    'v': 0
  },
  {
    'name': 'blammo',
    'level': 30,
    'bang': 'boom',
    'KABOOM': {
      'bang': 'boom',
      'KABOOM': '[Circular]'
    },
    'msg': '',
    'v': 0
  }
];

var log = new Logger({
  name: 'blammo',
  streams: [
    {
      type: 'stream',
      level: 'info',
      stream: outstr
    }
  ]
});

t.test('cycles', function (cb) {
  outstr.on('end', function () {
    output.forEach(function (o, i) {
      // Drop variable parts for comparison.
      delete o.hostname;
      delete o.pid;
      delete o.time;
      // Hack object/dict comparison: JSONify.
      try {
        assert.strictEqual(JSON.stringify(o), JSON.stringify(expect[i]))
      } catch (err) {
        cb(err)
      }
    });
    cb()
  });

  var obj = { bang: 'boom' };
  obj.KABOOM = obj;
  log.info('bango', obj);
  log.info('kaboom', obj.KABOOM);
  log.info(obj);
  outstr.end();
});
