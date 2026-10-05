import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { runDeviceCli } from '../src/device-cli.mjs';

const args = ['https://platform.example.invalid', 'local', 'synthetic-agent-kit'];
function fixture(overrides = {}) {
  const calls = [], output = [];
  const secret = 'synthetic-raw-credential-must-never-be-printed';
  const client = {
    async begin() { calls.push('begin'); return { userCode:'ABCDE-FGHJK', verificationUri:args[0]+'/device', expiresAt:'2026-10-05T00:05:00.000Z', deviceCode:secret, privateJwk:{d:secret} }; },
    async pair() { calls.push('pair'); return { refreshHandle:secret, accessToken:secret }; },
    async refresh() { calls.push('refresh'); return { handle:secret }; },
    async readStatus() { calls.push('status'); return { connectionId:'synthetic-connection', runtimeDeviceId:'synthetic-runtime', state:'active', expiresAt:'2026-10-05T00:10:00.000Z', accessToken:secret }; },
    close() { calls.push('close'); }, ...overrides,
  };
  return { calls, output, secret, ports: { createClient: async config => { assert.deepEqual(config, { origin:args[0], environment:args[1], clientId:args[2] }); return client; }, write: line => output.push(JSON.parse(line)) } };
}
test('thin CLI prints only pairing instructions and bootstrap status, then discards memory', async () => {
  const f = fixture(); assert.equal(await runDeviceCli(args, f.ports), 0);
  assert.deepEqual(f.calls, ['begin','pair','refresh','status','close']);
  assert.equal(f.output.length, 2); assert.equal(f.output[0].stage, 'member_approval_required');
  assert.equal(f.output[1].operation, 'bootstrap.status.read'); assert(f.output.every(value => value.operational_authority === false));
  assert.equal(JSON.stringify(f.output).includes(f.secret), false);
});
test('unknown refresh stops without retry, leaks no exception details and closes', async () => {
  let refreshes = 0;
  const f = fixture({ async refresh() { refreshes++; throw Object.assign(Error('secret raw exception'), { code:'refresh_outcome_unknown' }); } });
  assert.equal(await runDeviceCli(args, f.ports), 1); assert.equal(refreshes, 1); assert.equal(f.calls.includes('status'), false);
  assert.deepEqual(f.output[1], { error:'refresh_outcome_unknown', operational_authority:false }); assert.equal(f.calls.at(-1), 'close');
});
test('member denial and cancellation do not reach refresh or status', async () => {
  for (const status of ['access_denied','expired_token']) {
    const f = fixture({ async pair() { return { status }; } }); assert.equal(await runDeviceCli(args, f.ports), 1);
    assert.deepEqual(f.calls, ['begin','close']); assert.equal(f.output[1].stage, status);
  }
  const f = fixture({ async pair({signal}) { assert.equal(signal.aborted, true); throw Object.assign(Error('private'), {code:'aborted'}); } });
  assert.equal(await runDeviceCli(args, {...f.ports, signal:AbortSignal.abort()}), 1); assert.equal(f.output[1].error, 'aborted');
});
test('invalid arguments and arbitrary error objects have fixed public errors', async () => {
  const f = fixture(); assert.equal(await runDeviceCli([...args, '/unsafe/custody-file'], f.ports), 2); assert.deepEqual(f.calls, []);
  const bad = fixture({ async begin() { throw Error('private key, token, cookie'); } });
  assert.equal(await runDeviceCli(args, bad.ports), 1); assert.deepEqual(bad.output, [{error:'device_client_failed',operational_authority:false}]);
});
test('published launcher actually loads the shared command and rejects invalid arguments before transport', () => {
  for (const [argv, status, error] of [[[], 2, 'usage'], [['http://platform.example.invalid', 'local', 'synthetic-agent-kit'], 1, 'configuration_invalid']]) {
    const child = spawnSync(process.execPath, ['src/device-cli.mjs', ...argv], {
      cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 5000, maxBuffer: 65536,
      env: { PATH: process.env.PATH, LANG: 'C' },
    });
    assert.equal(child.error, undefined); assert.equal(child.signal, null);
    assert.equal(child.status, status); assert.equal(child.stderr, '');
    const value = JSON.parse(child.stdout); assert.equal(value.error, error); assert.equal(value.operational_authority, false);
  }
});
