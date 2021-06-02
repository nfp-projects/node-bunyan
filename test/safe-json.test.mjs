import { Eltro as t, assert} from 'eltro'
import safeJson from '../lib/safe-json.mjs'

t.test('basic stringify', function() {
  assert.strictEqual('"foo"', safeJson('foo'));
  assert.strictEqual('{"foo":"bar"}', safeJson({foo: 'bar'}));
});

t.test('object identity', function() {
  var a = { foo: 'bar' };
  var b = { one: a, two: a };
  assert.strictEqual('{"one":{"foo":"bar"},"two":{"foo":"bar"}}',safeJson(b));
});

t.test('circular references', function() {
  var a = {};
  a.a = a;
  a.b = 'c';

  assert.doesNotThrow(
    function() { safeJson(a); },
    'should not exceed stack size'
  );

  assert.strictEqual(
    '{"a":"[Circular]","b":"c"}',
    safeJson(a)
  );
});

t.test('null', function() {
  assert.strictEqual(
    '{"x":null}',
    safeJson({x: null})
  )
});

t.test('arrays', function() {
  var arr = [ 2 ];
  assert.strictEqual(
    '[2]',
    safeJson(arr)
  );

  arr.push(arr);

  assert.strictEqual(
    '[2,"[Circular]"]',
    safeJson(arr)
  );

  assert.strictEqual(
    '{"x":[2,"[Circular]"]}',
    safeJson({x: arr})
  );
});

t.test('throwing toJSON', function() {
  var obj = {
    toJSON: function() {
      throw new Error('Failing');
    }
  };

  assert.strictEqual(
    '"[Throws: Failing]"',
    safeJson(obj)
  );

  assert.strictEqual(
    '{"x":"[Throws: Failing]"}',
    safeJson({ x: obj })
  );
});

t.test('properties on Object.create(null)', function() {
  var obj = Object.create(null, {
    foo: {
      get: function() { return 'bar'; },
      enumerable: true
    }
  });
  assert.strictEqual(
    '{"foo":"bar"}',
    safeJson(obj)
  );

  var obj = Object.create(null, {
    foo: {
      get: function() { return 'bar'; },
      enumerable: true
    },
    broken: {
      get: function() { throw new Error('Broken'); },
      enumerable: true
    }
  });
  assert.strictEqual(
    '{"foo":"bar","broken":"[Throws: Broken]"}',
    safeJson(obj)
  );
});

t.test('defined getter properties using __defineGetter__', function() {
  // non throwing
  var obj = {};
  obj.__defineGetter__('foo', function() { return 'bar'; });
  assert.strictEqual(
    '{"foo":"bar"}',
    safeJson(obj)
  );

  // throwing
  obj = {};
  obj.__defineGetter__('foo', function() { return undefined['oh my']; });

  assert.doesNotThrow(
    function(){ safeJson(obj)}
  );

  assert.strictEqual(
    '{"foo":"[Throws: Cannot read property \'oh my\' of undefined]"}',
    safeJson(obj)
  );
});

t.test('enumerable defined getter properties using Object.defineProperty', function() {
  // non throwing
  var obj = {};
  Object.defineProperty(obj, 'foo', {get: function() { return 'bar'; }, enumerable: true});
  assert.strictEqual(
    '{"foo":"bar"}',
    safeJson(obj)
  );

  // throwing
  obj = {};
  Object.defineProperty(obj, 'foo', {get: function() { return undefined['oh my']; }, enumerable: true});

  assert.doesNotThrow(
    function(){ safeJson(obj)}
  );

  assert.strictEqual(
    '{"foo":"[Throws: Cannot read property \'oh my\' of undefined]"}',
    safeJson(obj)
  );
});

t.test('formatting', function() {
  var obj = {a:{b:1, c:[{d: 1}]}}; // some nested object
  var formatters = [3, "\t", "	"];
  formatters.forEach((formatter) => {
    assert.strictEqual(
      JSON.stringify(obj, null, formatter),
      safeJson(obj, null, formatter)
    );
  });
});

t.test('replacing', function() {
  var obj = {a:{b:1, c:[{d: 1}]}}; // some nested object
  var replacers = [
    ["a", "c"],
    (k, v) => typeof v == 'number' ? "***" : v,
    () => undefined,
    []
  ];
  replacers.forEach((replacer) => {
    assert.strictEqual(
      JSON.stringify(obj, replacer),
      safeJson(obj, replacer)
    );
  });
});
