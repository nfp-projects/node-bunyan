/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test other parts of the exported API.
 */

import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'


t.test('bunyan.<LEVEL>s', function () {
    assert.ok(bunyan.TRACE, 'TRACE');
    assert.ok(bunyan.DEBUG, 'DEBUG');
    assert.ok(bunyan.INFO, 'INFO');
    assert.ok(bunyan.WARN, 'WARN');
    assert.ok(bunyan.ERROR, 'ERROR');
    assert.ok(bunyan.FATAL, 'FATAL');
});

t.test('bunyan.resolveLevel()', function () {
    assert.strictEqual(bunyan.resolveLevel('trace'), bunyan.TRACE, 'TRACE');
    assert.strictEqual(bunyan.resolveLevel('TRACE'), bunyan.TRACE, 'TRACE');
    assert.strictEqual(bunyan.resolveLevel('debug'), bunyan.DEBUG, 'DEBUG');
    assert.strictEqual(bunyan.resolveLevel('DEBUG'), bunyan.DEBUG, 'DEBUG');
    assert.strictEqual(bunyan.resolveLevel('info'), bunyan.INFO, 'INFO');
    assert.strictEqual(bunyan.resolveLevel('INFO'), bunyan.INFO, 'INFO');
    assert.strictEqual(bunyan.resolveLevel('warn'), bunyan.WARN, 'WARN');
    assert.strictEqual(bunyan.resolveLevel('WARN'), bunyan.WARN, 'WARN');
    assert.strictEqual(bunyan.resolveLevel('error'), bunyan.ERROR, 'ERROR');
    assert.strictEqual(bunyan.resolveLevel('ERROR'), bunyan.ERROR, 'ERROR');
    assert.strictEqual(bunyan.resolveLevel('fatal'), bunyan.FATAL, 'FATAL');
    assert.strictEqual(bunyan.resolveLevel('FATAL'), bunyan.FATAL, 'FATAL');
});
