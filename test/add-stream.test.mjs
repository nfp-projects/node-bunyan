/*
 * Test stream adding.
 */
import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'

t.test('non-writables passed as stream', function () {
    var things = ['process.stdout', {}];
    things.forEach(function (thing) {
        function createLogger() {
            bunyan.createLogger({
                name: 'foo',
                stream: thing
            });
        }
        assert.throws(createLogger,
            /stream is not writable/);
    })
});

t.test('proper stream', function () {
    var log = bunyan.createLogger({
        name: 'foo',
        stream: process.stdout
    });
});
