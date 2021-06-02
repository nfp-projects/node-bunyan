/*
 * Test the bunyan CLI's handling of the "client_req" field.
 * "client_req" is a common-ish Bunyan log field from restify-clients. See:
 *      // JSSTYLED
 *      https://github.com/restify/clients/blob/85374f87db9f4469de2605b6b15632b317cc12be/lib/helpers/bunyan.js#L213
 */

import { exec, dirname } from './helper.mjs'
import { Eltro as t, assert} from 'eltro'

// ---- tests

t.test('client_req extra newlines, client_res={} (pull #252)', async function () {
  const expected = [
    /* BEGIN JSSTYLED */
    '[2016-02-10T07:28:40.510Z] TRACE: aclientreq/23280 on danger0.local: request sent',
    '    GET /--ping HTTP/1.1',
    '[2016-02-10T07:28:41.419Z] TRACE: aclientreq/23280 on danger0.local: Response received',
    '    HTTP/1.1 200 OK',
    '    request-id: e8a5a700-cfc7-11e5-a3dc-3b85d20f26ef',
    '    content-type: application/json'
    /* END JSSTYLED */
  ].join('\n') + '\n';

  let res = await exec(dirname('/corpus/clientreqres.log'))
  assert.strictEqual(res.stdout, expected)
});


t.test('client_req.address is not used for Host header in 2.x (issue #504)', async function () {
  const expected = [
    // JSSTYLED
    '[2017-05-12T23:59:15.877Z] TRACE: minfo/66266 on sharptooth.local: request sent (client_req.address=127.0.0.1)',
    '    HEAD /dap/stor HTTP/1.1',
    '    accept: application/json, */*',
    '    host: foo.example.com',
    '    date: Fri, 12 May 2017 23:59:15 GMT',
    ''
  ].join('\n')
  
  let res = await exec(dirname('/corpus/client-req-with-address.log'))
  assert.strictEqual(res.stdout, expected)
});
