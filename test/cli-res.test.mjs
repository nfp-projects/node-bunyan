/*
 * Test the bunyan CLI's handling of the "res" field.
 */

import { exec, dirname } from './helper.mjs'
import { Eltro as t, assert} from 'eltro'

// ---- tests

t.test('res with "header" string (issue #444)', async function () {
  const expected = [
    /* BEGIN JSSTYLED */
    '[2017-08-02T22:37:34.798Z]  INFO: res-header/76488 on danger0.local: response sent',
    '    HTTP/1.1 200 OK',
    '    Foo: bar',
    '    Date: Wed, 02 Aug 2017 22:37:34 GMT',
    '    Connection: keep-alive',
    '    Content-Length: 21'
    /* END JSSTYLED */
  ].join('\n') + '\n';

  let res = await exec(dirname('/corpus/res-header.log'))
  assert.strictEqual(res.stdout, expected)
});

t.test('res without "header"', async function () {
  const expected = [
    /* BEGIN JSSTYLED */
    '[2017-08-02T22:37:34.798Z]  INFO: res-header/76488 on danger0.local: response sent',
    '    HTTP/1.1 200 OK'
    /* END JSSTYLED */
  ].join('\n') + '\n';
  
  let res = await exec(dirname('/corpus/res-without-header.log'))
  assert.strictEqual(res.stdout, expected)
});
