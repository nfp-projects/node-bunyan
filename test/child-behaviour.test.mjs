/*
 * Test some `<Logger>.child(...)` behaviour.
 */

import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'


function CapturingStream(recs) {
    this.recs = recs || [];
}
CapturingStream.prototype.write = function (rec) {
    this.recs.push(rec);
}


t.test('child can add stream', function () {
    let dadStream = new CapturingStream();
    let dad = bunyan.createLogger({
        name: 'surname',
        streams: [ {
            type: 'raw',
            stream: dadStream,
            level: 'info'
        } ]
    });

    let sonStream = new CapturingStream();
    let son = dad.child({
        component: 'son',
        streams: [ {
            type: 'raw',
            stream: sonStream,
            level: 'debug'
        } ]
    });

    dad.info('info from dad');
    dad.debug('debug from dad');
    son.debug('debug from son');

    let rec;
    assert.equal(dadStream.recs.length, 1);
    rec = dadStream.recs[0];
    assert.equal(rec.msg, 'info from dad');
    assert.equal(sonStream.recs.length, 1);
    rec = sonStream.recs[0];
    assert.equal(rec.msg, 'debug from son');

});


t.test('child can set level of inherited streams', function () {
    let dadStream = new CapturingStream();
    let dad = bunyan.createLogger({
        name: 'surname',
        streams: [ {
            type: 'raw',
            stream: dadStream,
            level: 'info'
        } ]
    });

    // Intention here is that the inherited `dadStream` logs at 'debug' level
    // for the son.
    let son = dad.child({
        component: 'son',
        level: 'debug'
    });

    dad.info('info from dad');
    dad.debug('debug from dad');
    son.debug('debug from son');

    let rec;
    assert.equal(dadStream.recs.length, 2);
    rec = dadStream.recs[0];
    assert.equal(rec.msg, 'info from dad');
    rec = dadStream.recs[1];
    assert.equal(rec.msg, 'debug from son');

});


t.test('child can set level of inherited streams and add streams', function () {
    let dadStream = new CapturingStream();
    let dad = bunyan.createLogger({
        name: 'surname',
        streams: [ {
            type: 'raw',
            stream: dadStream,
            level: 'info'
        } ]
    });

    // Intention here is that the inherited `dadStream` logs at 'debug' level
    // for the son.
    let sonStream = new CapturingStream();
    let son = dad.child({
        component: 'son',
        level: 'trace',
        streams: [ {
            type: 'raw',
            stream: sonStream,
            level: 'debug'
        } ]
    });

    dad.info('info from dad');
    dad.trace('trace from dad');
    son.trace('trace from son');
    son.debug('debug from son');

    assert.equal(dadStream.recs.length, 3);
    assert.equal(dadStream.recs[0].msg, 'info from dad');
    assert.equal(dadStream.recs[1].msg, 'trace from son');
    assert.equal(dadStream.recs[2].msg, 'debug from son');

    assert.equal(sonStream.recs.length, 1);
    assert.equal(sonStream.recs[0].msg, 'debug from son');

});

// issue #291
t.test('child should not lose parent "hostname"', function () {
    let stream = new CapturingStream();
    let dad = bunyan.createLogger({
        name: 'hostname-test',
        hostname: 'bar0',
        streams: [ {
            type: 'raw',
            stream: stream,
            level: 'info'
        } ]
    });
    let son = dad.child({component: 'son'});

    dad.info('HI');
    son.info('hi');

    assert.equal(stream.recs.length, 2);
    assert.equal(stream.recs[0].hostname, 'bar0');
    assert.equal(stream.recs[1].hostname, 'bar0');
    assert.equal(stream.recs[1].component, 'son');

});
