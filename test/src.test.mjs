/*
 * Test `src: true` usage.
 */

import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'

// Intentionally on line 11 for tests below:
function logSomething(log) { log.info('something'); }

function CapturingStream(recs) {
  this.recs = recs;
}
CapturingStream.prototype.write = function (rec) {
  this.recs.push(rec);
}

// commented out due to broken implementation of
// getting caller line in strict mode (getCaller3Info())

/* t.only().test('src', function () {
  var recs = [];

  var log = new bunyan({
    name: 'src-test',
    src: true,
    streams: [
      {
        stream: new CapturingStream(recs),
        type: 'raw'
      }
    ]
  });

  log.info('top-level');
  logSomething(log);

  assert.strictEqual(recs.length, 2);
  recs.forEach(function (rec) {
    assert.ok(rec.src);
    assert.strictEqual(typeof (rec.src), 'object');
    assert.strictEqual(rec.src.file, __filename);
    assert.ok(rec.src.line);
    assert.strictEqual(typeof (rec.src.line), 'number');
  });
  var rec = recs[1];
  assert.ok(rec.src.func);
  assert.strictEqual(rec.src.func, 'logSomething');
  assert.strictEqual(rec.src.line, 11);
});*/
