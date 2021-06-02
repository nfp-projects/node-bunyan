/*
 * Test the `bunyan` CLI.
 */

import fs from 'fs'
import path from 'path'
import { exec, dirname } from './helper.mjs'
import { Eltro as t, assert} from 'eltro'

// ---- assertable variables

const catter = process.platform === 'win32' ? 'type' : 'cat'
const assertSimpleLog = '[2012-02-08T22:56:52.856Z]  INFO: myservice/123 on example.com: My message\n'

// ---- tests

t.test('--version', async function () {
  let pckg = JSON.parse(fs.readFileSync(dirname('/../package.json')))
  const version = pckg.version
  
  let res = await exec('--version')
  assert.strictEqual(res.stdout, 'bunyan ' + version + '\n')
});

t.test('--help', async function () {
  let res = await exec('--help')
  assert.match(res.stdout, /General options:/)
});

t.test('-h', async function () {
  let res = await exec('-h')
  assert.match(res.stdout, /General options:/)
});

t.test('--bogus', async function () {
  let err = await assert.isRejected(exec('--bogus'))
  assert.strictEqual(err.code, 1)
});

t.test('simple.log', async function () {
  let res = await exec(dirname('/corpus/simple.log'))
  assert.strictEqual(res.stdout, assertSimpleLog)
});

t.test(`${catter} simple.log`, async function () {
  let res = await exec('', `${catter} ${dirname('/corpus/simple.log')} | node `)
  assert.strictEqual(res.stdout, assertSimpleLog)
});

t.test('time: simple.log utc long', async function () {
  let res = await exec('-o long --time utc ' + dirname('/corpus/simple.log'))
  assert.strictEqual(res.stdout, assertSimpleLog)
});

t.test('time: simple.log utc short', async function () {
  let res = await exec('-o short ' + dirname('/corpus/simple.log'))
  assert.strictEqual(res.stdout, '22:56:52.856Z  INFO myservice: My message\n')
});

t.test('simple.log with color', async function () {
  let res = await exec(dirname('/corpus/simple.log'))
  assert.notMatch(res.stdout, /\[2012-02-08T22:56:52.856Z\] [^ ]+ INFO[^:]+:/)
  res = await exec('--color ' + dirname('/corpus/simple.log'))
  assert.match(res.stdout, /\[2012-02-08T22:56:52.856Z\] [^ ]+ INFO[^:]+:/)
});

t.test('extrafield.log', async function () {
  let res = await exec(dirname('/corpus/extrafield.log'))
  assert.strictEqual(res.stdout, '[2012-02-08T22:56:52.856Z]  INFO: myservice/123 on example.com: My message (extra=field)\n')
});

t.test('extrafield.log with color', async function () {
  let res = await exec(dirname('/corpus/extrafield.log'))
  assert.notMatch(res.stdout, /My message[^ ]+ \(extra=field\)\n.+/)
  res = await exec('--color ' + dirname('/corpus/extrafield.log'))
  assert.match(res.stdout, /My message[^ ]+ \(extra=field\)\n.+/)
});

t.test('bogus.log', async function () {
  let res = await exec(dirname('/corpus/bogus.log'))
  assert.strictEqual(res.stdout, 'not a JSON line\n{"hi": "there"}\n')
});

t.test('bogus.log -j', async function () {
  let res = await exec('-j ' + dirname('/corpus/bogus.log'))
  assert.strictEqual(res.stdout, 'not a JSON line\n{"hi": "there"}\n')
});

t.test('all.log', async function () {
  // Just make sure don't blow up on this.
  await exec(dirname('/corpus/all.log'))
});

t.test('simple.log doesnotexist1.log doesnotexist2.log', async function () {
  let res = await assert.isRejected(exec(dirname('/corpus/simple.log') + ' doesnotexist1.log doesnotexist2.log'))
  assert.strictEqual(res.stdout, '[2012-02-08T22:56:52.856Z]  INFO: myservice/123 on example.com: My message\n')
  
  // Note: node v0.6.10:
  //   ENOENT, no such file or directory 'asdf.log'
  // but node v0.6.14:
  //   ENOENT, open 'asdf.log'
  // io.js 2.2 (at least):
  //   ENOENT: no such file or directory, open 'doesnotexist1.log'
  let matches = [
    /^bunyan: ENOENT.*?, open '.+doesnotexist1.log'/m,
    /^bunyan: ENOENT.*?, open '.+doesnotexist2.log'/m,
  ];
  matches.forEach(function (match) {
    assert.match(res.stderr, match);
  });
});

t.test('multiple logs', async function () {
  let res = await exec(dirname('/corpus/log1.log') + ' ' + dirname('/corpus/log2.log'))
  assert.strictEqual(res.stdout, [
    '[2012-05-08T16:57:55.586Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T16:58:55.586Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:01:49.339Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:02:47.404Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.339Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.404Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.404Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:57.404Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:08:01.105Z]  INFO: agent2/76156 on headnode: message\n',
  ].join(''))
});

t.test('multiple logs, bunyan format', async function () {
  let res = await exec('-o bunyan ' + dirname('/corpus/log1.log') + ' ' + dirname('/corpus/log2.log'))
  assert.strictEqual(res.stdout, [
    '{"name":"agent1","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T16:57:55.586Z","v":0}\n',
      '{"name":"agent2","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T16:58:55.586Z","v":0}\n',
      '{"name":"agent2","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T17:01:49.339Z","v":0}\n',
      '{"name":"agent2","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T17:02:47.404Z","v":0}\n',
      '{"name":"agent1","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T17:02:49.339Z","v":0}\n',
      '{"name":"agent1","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T17:02:49.404Z","v":0}\n',
      '{"name":"agent1","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T17:02:49.404Z","v":0}\n',
      '{"name":"agent2","pid":73267,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T17:02:57.404Z","v":0}\n',
      '{"name":"agent2","pid":76156,"hostname":"headnode","level":30,"msg":"message","time":"2012-05-08T17:08:01.105Z","v":0}\n',
  ].join(''))
});

t.test('log1.log.gz', async function () {
  let res = await exec(dirname('/corpus/log1.log.gz'))
  assert.strictEqual(res.stdout, [
    '[2012-05-08T16:57:55.586Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.339Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.404Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.404Z]  INFO: agent1/73267 on headnode: message\n',
  ].join(''))
});

t.test('mixed text and gzip logs', async function () {
  let res = await exec(dirname('/corpus/log1.log.gz') + ' ' + dirname('/corpus/log2.log'))
  assert.strictEqual(res.stdout, [
    '[2012-05-08T16:57:55.586Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T16:58:55.586Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:01:49.339Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:02:47.404Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.339Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.404Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:49.404Z]  INFO: agent1/73267 on headnode: message\n',
    '[2012-05-08T17:02:57.404Z]  INFO: agent2/73267 on headnode: message\n',
    '[2012-05-08T17:08:01.105Z]  INFO: agent2/76156 on headnode: message\n',
  ].join(''))
});

t.test('--level 40', async function () {
  let res = await exec('-l 40 ' + dirname('/corpus/all.log'))
  assert.strictEqual(res.stdout, [
    '# levels\n',
    '[2012-02-08T22:56:53.856Z]  WARN: myservice/123 on example.com: My message\n',
    '[2012-02-08T22:56:54.856Z] ERROR: myservice/123 on example.com: My message\n',
    '[2012-02-08T22:56:55.856Z] LVL55: myservice/123 on example.com: My message\n',
    '[2012-02-08T22:56:56.856Z] FATAL: myservice/123 on example.com: My message\n',
    '\n',
    '# extra fields\n',
    '\n',
    '# bogus\n',
    'not a JSON line\n',
    '{"hi": "there"}\n'
  ].join(''))
});

t.test('--condition "this.level === 10 && this.pid === 123"', async function () {
  let res = await exec('-c "this.level === 10 && this.pid === 123" ' + dirname('/corpus/all.log'))
  assert.strictEqual(res.stdout, [
    '# levels\n',
    '[2012-02-08T22:56:50.856Z] TRACE: myservice/123 on example.com: My message\n',
    '\n',
    '# extra fields\n',
    '\n',
    '# bogus\n',
    'not a JSON line\n',
    '{"hi": "there"}\n'
  ].join(''))
});

t.test('--condition "this.level === TRACE', async function () {
  let res = await exec('-c "this.level === TRACE" ' + dirname('/corpus/all.log'))
  assert.strictEqual(res.stdout, [
    '# levels\n',
    '[2012-02-08T22:56:50.856Z] TRACE: myservice/123 on example.com: My message\n',
    '\n',
    '# extra fields\n',
    '\n',
    '# bogus\n',
    'not a JSON line\n',
    '{"hi": "there"}\n'
  ].join(''))
});

t.test('multiple --conditions', async function () {
  let res = await exec(dirname('/corpus/all.log') + ' -c "this.level === 40" -c "this.pid === 123"')
  assert.strictEqual(res.stdout, [
    '# levels\n',
    '[2012-02-08T22:56:53.856Z]  WARN: myservice/123 on example.com: My message\n',
    '\n',
    '# extra fields\n',
    '\n',
    '# bogus\n',
    'not a JSON line\n',
    '{"hi": "there"}\n'
  ].join(''))
});

// https://github.com/trentm/node-bunyan/issues/30
//
// One of the records in corpus/withreq.log has a 'req'
// field with no 'headers'. Ditto for the 'res' field.
t.test('robust req handling', async function () {
  let res = await exec(dirname('/corpus/withreq.log'))
  assert.strictEqual(res.stdout, [
    '[2012-08-08T10:25:47.636Z] DEBUG: amon-master/12859 on 9724a190-27b6-4fd8-830b-a574f839c67d: headAgentProbes respond (req_id=cce79d15-ffc2-487c-a4e4-e940bdaac31e, route=HeadAgentProbes, contentMD5=11FxOYiYfpMxmANj4kGJzg==)',
    '[2012-08-08T10:25:47.637Z]  INFO: amon-master/12859 on 9724a190-27b6-4fd8-830b-a574f839c67d: HeadAgentProbes handled: 200 (req_id=cce79d15-ffc2-487c-a4e4-e940bdaac31e, audit=true, remoteAddress=10.2.207.2, remotePort=50394, latency=3, secure=false, _audit=true, req.version=*)',
    '    HEAD /agentprobes?agent=ccf92af9-0b24-46b6-ab60-65095fdd3037 HTTP/1.1',
    '    accept: application/json',
    '    content-type: application/json',
    '    host: 10.2.207.16',
    '    connection: keep-alive',
    '    --',
    '    HTTP/1.1 200 OK',
    '    content-md5: 11FxOYiYfpMxmANj4kGJzg==',
    '    access-control-allow-origin: *',
    '    access-control-allow-headers: Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    '    access-control-allow-methods: HEAD',
    '    access-control-expose-headers: X-Api-Version, X-Request-Id, X-Response-Time',
    '    connection: Keep-Alive',
    '    date: Wed, 08 Aug 2012 10:25:47 GMT',
    '    server: Amon Master/1.0.0',
    '    x-request-id: cce79d15-ffc2-487c-a4e4-e940bdaac31e',
    '    x-response-time: 3',
    '    --',
    '    route: {',
    '      "name": "HeadAgentProbes",',
    '      "version": false',
    '    }',
    '[2012-08-08T10:25:47.637Z]  INFO: amon-master/12859 on 9724a190-27b6-4fd8-830b-a574f839c67d: HeadAgentProbes handled: 200 (req_id=cce79d15-ffc2-487c-a4e4-e940bdaac31e, audit=true, remoteAddress=10.2.207.2, remotePort=50394, latency=3, secure=false, _audit=true, req.version=*)',
    '    HEAD /agentprobes?agent=ccf92af9-0b24-46b6-ab60-65095fdd3037 HTTP/1.1',
    '    --',
    '    HTTP/1.1 200 OK',
    '    --',
    '    route: {',
    '      "name": "HeadAgentProbes",',
    '      "version": false',
    '    }'
  ].join('\n') + '\n')
});

// Some past crashes from issues.
t.test('should not crash on corpus/old-crashers/*.log', async function () {
  let oldCrashers = fs.readdirSync(
    path.resolve(dirname('/corpus/old-crashers')))
    .filter(function (f) { return f.slice(-4) === '.log'; });

  await Promise.all(oldCrashers.map(function(logFile) {
    return exec(dirname('/corpus/old-crashers/' + logFile))
  }))
});

t.test('should only show nonempty response bodies', async function () {
  let res = await exec(dirname('/corpus/content-length-0-res.log'))
  assert.strictEqual(res.stdout, [
    '[2016-02-10T07:28:41.419Z]  INFO: myservice/123 on example.com: UnauthorizedError',
    '    HTTP/1.1 401 Unauthorized',
    '    content-type: text/plain',
    '    date: Sat, 07 Mar 2015 06:58:43 GMT',
    '[2016-02-10T07:28:41.419Z]  INFO: myservice/123 on example.com: hello',
    '    HTTP/1.1 200 OK',
    '    content-type: text/plain',
    '    content-length: 0',
    '    date: Sat, 07 Mar 2015 06:58:43 GMT',
    '    ',
    '    hello',
    '[2016-02-10T07:28:41.419Z]  INFO: myservice/123 on example.com: UnauthorizedError',
    '    HTTP/1.1 401 Unauthorized',
    '    content-type: text/plain',
    '    date: Sat, 07 Mar 2015 06:58:43 GMT'
  ].join('\n') + '\n');
});
