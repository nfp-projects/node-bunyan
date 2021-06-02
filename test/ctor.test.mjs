/*
 * Test type checking on creation of the Logger.
 */
import { Eltro as t, assert} from 'eltro'
import bunyan from '../lib/bunyan.mjs'

t.test('ensure Logger creation options', function () {
  assert.throws(function () { new bunyan(); },
    /options \(object\) is required/,
    'no options should throw');

  assert.throws(function () { new bunyan({}); },
    /options\.name \(string\) is required/,
    'no options.name should throw');

  new bunyan({name: 'foo'});

  let options = {name: 'foo', stream: process.stdout, streams: []};
  assert.throws(function () { new bunyan(options); },
    /cannot mix "streams" and "stream" options/, // JSSTYLED
    'cannot use "stream" and "streams"');

  // https://github.com/trentm/node-bunyan/issues/3
  options = {name: 'foo', streams: {}};
  assert.throws(function () { new bunyan(options); },
    /invalid options.streams: must be an array/,
    '"streams" must be an array');

  options = {name: 'foo', serializers: 'a string'};
  assert.throws(function () { new bunyan(options); },
    /invalid options.serializers: must be an object/,
    '"serializers" cannot be a string');

  options = {name: 'foo', serializers: [1, 2, 3]};
  assert.throws(function () { new bunyan(options); },
    /invalid options.serializers: must be an object/,
    '"serializers" cannot be an array');
});


t.test('ensure Logger constructor is safe without new', function () {
  bunyan({name: 'foo'})
});


t.test('ensure Logger creation options (createLogger)', function () {
  assert.throws(function () { bunyan.createLogger(); },
    /options \(object\) is required/,
    'no options should throw');

  assert.throws(function () { bunyan.createLogger({}); },
    /options\.name \(string\) is required/,
    'no options.name should throw');

  bunyan.createLogger({name: 'foo'});

  let options = {name: 'foo', stream: process.stdout, streams: []};
  assert.throws(function () { bunyan.createLogger(options); },
    /cannot mix "streams" and "stream" options/, // JSSTYLED
    'cannot use "stream" and "streams"');

  // https://github.com/trentm/node-bunyan/issues/3
  options = {name: 'foo', streams: {}};
  assert.throws(function () { bunyan.createLogger(options); },
    /invalid options.streams: must be an array/,
    '"streams" must be an array');

  options = {name: 'foo', serializers: 'a string'};
  assert.throws(function () { bunyan.createLogger(options); },
    /invalid options.serializers: must be an object/,
    '"serializers" cannot be a string');

  options = {name: 'foo', serializers: [1, 2, 3]};
  assert.throws(function () { bunyan.createLogger(options); },
    /invalid options.serializers: must be an object/,
    '"serializers" cannot be an array');
});


t.test('ensure Logger child() options', function () {
  let log = new bunyan({name: 'foo'});

  log.child();

  log.child({});

  assert.throws(function () { log.child({name: 'foo'}); },
    /invalid options.name: child cannot set logger name/,
    'child cannot change name');

  let options = {stream: process.stdout, streams: []};
  assert.throws(function () { log.child(options); },
    /cannot mix "streams" and "stream" options/, // JSSTYLED
    'cannot use "stream" and "streams"');

  // https://github.com/trentm/node-bunyan/issues/3
  options = {streams: {}};
  assert.throws(function () { log.child(options); },
    /invalid options.streams: must be an array/,
    '"streams" must be an array');

  options = {serializers: 'a string'};
  assert.throws(function () { log.child(options); },
    /invalid options.serializers: must be an object/,
    '"serializers" cannot be a string');

  options = {serializers: [1, 2, 3]};
  assert.throws(function () { log.child(options); },
    /invalid options.serializers: must be an object/,
    '"serializers" cannot be an array');
});


t.test('ensure Logger() rejects non-Logger parents', function () {
  let dad = new bunyan({name: 'dad', streams: []});

  assert.throws(function () { new bunyan({}, {}); },
    /invalid Logger creation: do not pass a second arg/,
    'Logger arguments must be valid');

  new bunyan(dad, {});
});
