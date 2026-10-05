/** In-memory machine pairing for bootstrap.status.read only. No ExecutionGrant,
 * member cookie, key export, disk custody, provider call or automatic retry.
 * Losing the process loses the session: recovery starts with a fresh key.
 */
const paths = Object.freeze({ begin: '/execution-api/v1/auth/device-authorizations',
  token: '/execution-api/v1/auth/token', nonce: '/execution-api/v1/auth/nonce', status: '/execution-api/v1/bootstrap' });
const encoder = new TextEncoder();
const bytes32 = /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const compact = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const environments = ['local', 'staging-next', 'next'];
const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const encode = value => b64(encoder.encode(typeof value === 'string' ? value : JSON.stringify(value)));
const hash = async value => b64(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const isString = (v, re) => typeof v === 'string' && re.test(v) && !/[\r\n]/.test(v);
const isTime = v => typeof v === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v)
  && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
const isVersion = v => isString(v, /^[1-9][0-9]{0,18}$/) && BigInt(v) <= 9223372036854775807n;
const shape = (v, fields) => v !== null && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).length === Object.keys(fields).length && Object.entries(fields).every(([k, check]) => Object.hasOwn(v, k) && check(v[k]));
const literal = expected => v => v === expected;
const id = v => isString(v, uuid);
const bytes = v => isString(v, bytes32);
const noAuthority = literal(false);
const verificationUri = (value, origin) => {
  try { const url = new URL(value); return typeof value === 'string' && value.length <= 512 && url.origin === origin
    && url.href === value && !url.username && !url.password && !/[?#%\\\x00-\x20\x7f-\uffff]/.test(value); }
  catch { return false; }
};
const interval = v => Number.isInteger(v) && v >= 5 && v <= 325;
const token = v => typeof v === 'string' && v.length <= 8192 && isString(v, compact);
const nonceShape = v => shape(v, { nonceId: id, nonce: bytes, connectionId: id,
  issuedAt: isTime, expiresAt: isTime, operational_authority: noAuthority })
  && Date.parse(v.expiresAt) > Date.parse(v.issuedAt) && Date.parse(v.expiresAt) - Date.parse(v.issuedAt) <= 60000;
const refreshShape = v => shape(v, { familyId: id, generation: isVersion, handle: bytes, expiresAt: isTime });
const sessionFields = { accessToken: token, tokenType: literal('DPoP'), expiresAt: isTime,
  connectionId: id, runtimeDeviceId: id, refresh: refreshShape, operational_authority: noAuthority };

export class MachineDeviceError extends Error {
  constructor(code, status) { super(code); this.name = 'MachineDeviceError'; this.code = code; if (status) this.status = status; }
}
const fail = code => { throw new MachineDeviceError(code); };
const check = (condition, code = 'response_invalid') => { if (!condition) fail(code); };

// Reject duplicate decoded keys, unsafe integers and nested/large JSON before
// JSON.parse can collapse distinctions. This closed DTO grammar has no arrays.
function parseJson(text) {
  let at = 0, nodes = 0;
  const ws = () => { while (' \t\r\n'.includes(text[at]) && at < text.length) at++; };
  function string() {
    const start = at++;
    while (at < text.length) {
      const c = text[at++];
      if (c === '"') return JSON.parse(text.slice(start, at));
      if (c === '\\') at++;
    }
    fail('response_invalid');
  }
  function value(depth) {
    check(depth <= 8 && ++nodes <= 128); ws();
    if (text[at] === '{') {
      at++; ws(); const keys = new Set();
      if (text[at] === '}') { at++; return; }
      while (at < text.length) {
        check(text[at] === '"'); const key = string();
        check(!keys.has(key) && !['__proto__', 'constructor', 'prototype'].includes(key)); keys.add(key);
        ws(); check(text[at++] === ':'); value(depth + 1); ws();
        const end = text[at++]; if (end === '}') return;
        check(end === ','); ws();
      }
      fail('response_invalid');
    }
    if (text[at] === '"') { string(); return; }
    const match = /^(?:true|false|null|0|[1-9][0-9]*)/.exec(text.slice(at));
    check(match !== null); at += match[0].length;
    if (/^[0-9]/.test(match[0])) check(Number.isSafeInteger(Number(match[0])));
  }
  value(0); ws(); check(at === text.length);
  return JSON.parse(text);
}

function publicSession(session) {
  return Object.freeze({ connectionId: session.connectionId, runtimeDeviceId: session.runtimeDeviceId,
    expiresAt: session.expiresAt, refreshGeneration: session.refresh.generation,
    operation: 'bootstrap.status.read', operational_authority: false });
}

/** Trusted configuration only. fetch is an optional transport port for native
 * hosts/tests; it must honor redirect:error, credentials:omit and AbortSignal.
 * Like standard Fetch, its response body must already be decoded for any
 * gzip/deflate/br Content-Encoding header it retains.
 * No state import/export is provided. A future durable custody adapter must
 * durably reserve one-use material BEFORE sending and atomically settle it;
 * an interrupted reservation is terminal, including after a process crash.
 */
export async function createMachineDeviceClient({ origin, environment, clientId, fetch: fetchPort = globalThis.fetch,
  requestTimeoutMs = 10000 } = {}) {
  let parsed;
  try { parsed = new URL(origin); } catch { fail('configuration_invalid'); }
  check(typeof origin === 'string' && parsed.origin === origin && parsed.protocol === 'https:'
    && !/[^\x21-\x7e]|[%\\?#]/.test(origin) && origin.length <= 400
    && environments.includes(environment) && isString(clientId, /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/)
    && typeof fetchPort === 'function' && Number.isInteger(requestTimeoutMs) && requestTimeoutMs >= 1 && requestTimeoutMs <= 60000,
  'configuration_invalid');
  let keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
  const exported = await crypto.subtle.exportKey('jwk', keys.publicKey);
  const jwk = Object.freeze({ kty: 'EC', crv: 'P-256', x: exported.x, y: exported.y });
  const thumbprint = await hash(JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y }));
  let state = 'new', pairing, challenge, session, nextPoll = 0, busy = false;
  const lifetime = new AbortController();
  function clear(next) { state = next; pairing = challenge = session = keys = undefined; lifetime.abort(); }
  function signal(input) { return input ? AbortSignal.any([lifetime.signal, input]) : lifetime.signal; }
  function live(input) { if (input?.aborted) fail('aborted'); check(!['closed', 'unknown'].includes(state), 'client_unavailable'); }
  async function exclusive(input, run) {
    live(input); check(!busy, 'operation_in_progress'); busy = true;
    try { return await run(signal(input)); }
    catch (error) { if (error instanceof MachineDeviceError) throw error; throw new MachineDeviceError('client_failed'); }
    finally { busy = false; }
  }
  async function signed(typ, payload, enrollment = false) {
    const data = encode(enrollment ? { alg: 'ES256', typ } : { alg: 'ES256', typ, jwk }) + '.' + encode(payload);
    const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keys.privateKey, encoder.encode(data));
    return data + '.' + b64(signature);
  }
  const claims = (purpose, path) => ({ purpose, client_id: clientId, environment,
    jti: b64(crypto.getRandomValues(new Uint8Array(24))), iat: Math.floor(Date.now() / 1000), htm: 'POST', htu: origin + paths[path] });
  async function request(path, body, headers, status, input) {
    const deadline = AbortSignal.timeout(requestTimeoutMs), combined = AbortSignal.any([input, deadline]);
    let reader;
    let onAbort;
    const aborted = new Promise((_, reject) => {
      onAbort = () => reject(new MachineDeviceError('aborted'));
      if (combined.aborted) reject(new MachineDeviceError('aborted'));
      else combined.addEventListener('abort', onAbort, { once: true });
    });
    try {
      const response = await Promise.race([fetchPort(origin + paths[path], { method: body === undefined ? 'GET' : 'POST',
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), redirect: 'error', credentials: 'omit', cache: 'no-store', signal: combined }), aborted]);
      check(response instanceof Response && !response.redirected && response.status >= 200 && response.status < 600
        && (response.url === '' || response.url === origin + paths[path]));
      check(/^application\/(?:problem\+)?json(?:\s*;\s*charset=utf-8)?$/i.test(response.headers.get('Content-Type') ?? ''));
      // Native Fetch decodes compressed bytes but retains the wire headers.
      // Bound decoded bytes below; only identity bodies can be compared with
      // Content-Length. Unknown codings must not be guessed or decoded twice.
      const encoding = response.headers.get('Content-Encoding');
      const codings = encoding === null ? [] : encoding.toLowerCase().split(',').map(value => value.trim());
      check(codings.length <= 3 && codings.every(value => ['identity', 'gzip', 'deflate', 'br'].includes(value)));
      const compressed = codings.some(value => value !== 'identity');
      const length = response.headers.get('Content-Length');
      check(length === null || /^\d+$/.test(length) && Number.isSafeInteger(Number(length))
        && (compressed || Number(length) <= 32768));
      check(response.body !== null); reader = response.body.getReader();
      let total = 0, count = 0; const chunks = [];
      while (true) {
        const { done, value } = await Promise.race([reader.read(), aborted]); if (done) break;
        total += value.byteLength; check(total <= 32768 && ++count <= 128); chunks.push(value);
      }
      check(compressed || length === null || Number(length) === total);
      const bytes = new Uint8Array(total); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      check(!(bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191));
      let value;
      try { value = parseJson(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
      catch { fail('response_invalid'); }
      live(combined);
      if (response.status !== status) throw new MachineDeviceError('http_rejected', response.status);
      return value;
    } catch (error) {
      if (error instanceof MachineDeviceError) throw error;
      throw new MachineDeviceError(combined.aborted ? 'aborted' : 'transport_failed');
    } finally { combined.removeEventListener('abort', onAbort); if (reader) void reader.cancel().catch(() => {}); }
  }
  function validateChallenge(value) {
    check(shape(value, { profile: literal('freedom.runtime-enrollment/v1'), purpose: literal('runtime_enrollment'),
      challenge_id: id, owner_member_id: id, owner_principal_id: id, scope_id: id, runtime_device_id: id,
      environment: literal(environment), key_thumbprint: literal(thumbprint), nonce: bytes, issued_at: isTime, expires_at: isTime,
      operational_authority: noAuthority, payload: v => typeof v === 'string' && encoder.encode(v).length <= 2048 }));
    const expected = { profile: value.profile, purpose: value.purpose, challenge_id: value.challenge_id,
      owner_member_id: value.owner_member_id, owner_principal_id: value.owner_principal_id, scope_id: value.scope_id,
      runtime_device_id: value.runtime_device_id, environment: value.environment, key_thumbprint: value.key_thumbprint,
      nonce: value.nonce, issued_at: value.issued_at, expires_at: value.expires_at, operational_authority: false };
    check(value.payload === JSON.stringify(expected) && Date.parse(value.expires_at) - Date.parse(value.issued_at) === 300000
      && Date.parse(value.expires_at) > Date.now());
  }
  async function poll(input) {
    check(state === 'pairing', 'pairing_required');
    if (Date.now() >= Date.parse(pairing.expiresAt)) { clear('closed'); fail('pairing_expired'); }
    check(Date.now() >= nextPoll, 'poll_too_early');
    const proof = await signed('freedom-device-pairing+jwt', { ...claims('device_pairing_poll', 'token'),
      runtime_kind: 'agent-kit', scope: 'bootstrap.status.read', authorization_id: pairing.authorizationId,
      nonce: pairing.nonce, request_digest: pairing.requestDigest, device_code_hash: await hash(pairing.deviceCode) });
    const enrollmentProof = challenge ? await signed('freedom-runtime-enrollment+jws', challenge.payload, true) : undefined;
    live(input);
    // From this point an enrollment submission may have committed. No response,
    // including 503, proves that it is safe to submit this enrollment again.
    if (enrollmentProof) state = 'exchanging';
    try {
      const value = await request('token', { grantType: 'device_code', authorizationId: pairing.authorizationId,
        deviceCode: pairing.deviceCode, ...(enrollmentProof ? { enrollmentProof } : {}) }, { DPoP: proof }, 200, input);
      check(value !== null && typeof value === 'object');
      if (value.status === 'issued') {
        check(Boolean(enrollmentProof) && shape(value, { status: literal('issued'), ...sessionFields,
          nonce: nonceShape, refreshSupported: literal(true) }) && value.refresh.generation === '1'
          && value.runtimeDeviceId === challenge.runtime_device_id && value.nonce.connectionId === value.connectionId
          && Date.parse(value.expiresAt) > Date.now() && Date.parse(value.refresh.expiresAt) >= Date.parse(value.expiresAt));
        session = value; pairing = challenge = undefined; state = 'ready'; return publicSession(session);
      }
      check(!enrollmentProof);
      if (['authorization_pending', 'slow_down'].includes(value.status)) {
        check(shape(value, { status: literal(value.status), interval, operational_authority: noAuthority }));
      } else if (value.status === 'proof_required') {
        check(shape(value, { status: literal('proof_required'), challenge: v => !!v, interval, operational_authority: noAuthority }));
        validateChallenge(value.challenge); challenge = value.challenge;
      } else if (['access_denied', 'expired_token'].includes(value.status)) {
        check(shape(value, { status: literal(value.status), operational_authority: noAuthority })); clear('closed');
        return Object.freeze({ status: value.status, operational_authority: false });
      } else fail('response_invalid');
      nextPoll = Date.now() + value.interval * 1000;
      return Object.freeze({ status: value.status, interval: value.interval, operational_authority: false });
    } catch (error) {
      if (enrollmentProof) { clear('unknown'); throw new MachineDeviceError('exchange_outcome_unknown'); }
      clear('closed'); throw error;
    }
  }
  return Object.freeze({
    async begin({ signal: input } = {}) { return exclusive(input, async active => {
      check(state === 'new', 'already_started');
      const proof = await signed('freedom-device-pairing+jwt', { ...claims('device_pairing_begin', 'begin'),
        runtime_kind: 'agent-kit', scope: 'bootstrap.status.read' }); live(active); state = 'beginning';
      try {
        const value = await request('begin', { publicJwk: jwk, runtimeKind: 'agent-kit' }, { DPoP: proof }, 201, active);
        check(shape(value, { authorizationId: id, deviceCode: bytes, userCode: v => isString(v, /^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/),
          nonce: bytes, requestDigest: bytes, verificationUri: v => verificationUri(v, origin),
          issuedAt: isTime, expiresAt: isTime, expiresIn: literal(300), interval: literal(5), operational_authority: noAuthority })
          && Date.parse(value.expiresAt) - Date.parse(value.issuedAt) === 300000 && Date.parse(value.expiresAt) > Date.now());
        pairing = value; state = 'pairing';
        return Object.freeze({ userCode: value.userCode, verificationUri: value.verificationUri,
          expiresAt: value.expiresAt, operational_authority: false });
      } catch (error) { clear('closed'); throw error; }
    }); },
    async poll({ signal: input } = {}) { return exclusive(input, poll); },
    async pair({ signal: input } = {}) { return exclusive(input, async active => {
      check(state === 'pairing', 'pairing_required');
      while (state === 'pairing') {
        live(active);
        const wait = Math.min(nextPoll, Date.parse(pairing.expiresAt)) - Date.now();
        if (wait > 0) {
          await new Promise((resolve, reject) => {
          const abort = () => { clearTimeout(timer); reject(new MachineDeviceError('aborted')); };
          const timer = setTimeout(() => { active.removeEventListener('abort', abort); resolve(); }, wait);
          active.addEventListener('abort', abort, { once: true }); if (active.aborted) abort();
          });
          // Timers can wake before the wall-clock deadline. Recompute it before
          // entering poll; never bypass its rate gate or repeat an exchange.
          continue;
        }
        live(active); const value = await poll(active); if (state !== 'pairing') return value;
      }
    }); },
    async refresh({ signal: input } = {}) { return exclusive(input, async active => {
      check(state === 'ready', 'session_required');
      const previous = session;
      const proof = await signed('freedom-bootstrap-refresh+jwt', { ...claims('bootstrap_refresh', 'token'),
        connection_id: previous.connectionId, family_id: previous.refresh.familyId, generation: previous.refresh.generation,
        refresh_handle_hash: await hash(previous.refresh.handle) });
      live(active); state = 'refreshing';
      try {
        const value = await request('token', { grantType: 'refresh_token', familyId: previous.refresh.familyId,
          refreshHandle: previous.refresh.handle }, { DPoP: proof }, 200, active);
        check(shape(value, sessionFields) && value.connectionId === previous.connectionId && value.runtimeDeviceId === previous.runtimeDeviceId
          && value.refresh.familyId === previous.refresh.familyId && BigInt(value.refresh.generation) === BigInt(previous.refresh.generation) + 1n
          && value.refresh.handle !== previous.refresh.handle && value.refresh.expiresAt === previous.refresh.expiresAt
          && Date.parse(value.expiresAt) > Date.now() && Date.parse(value.expiresAt) <= Date.parse(value.refresh.expiresAt));
        session = value; state = 'ready'; return publicSession(session);
      } catch { clear('unknown'); throw new MachineDeviceError('refresh_outcome_unknown'); }
    }); },
    async readStatus({ signal: input } = {}) { return exclusive(input, async active => {
      check(state === 'ready', 'session_required');
      const current = session, authorization = 'DPoP ' + current.accessToken, ath = await hash(current.accessToken);
      const nonceProof = await signed('freedom-bootstrap-nonce+jwt', { ...claims('bootstrap_nonce', 'nonce'), connection_id: current.connectionId, ath });
      const nonce = await request('nonce', { connectionId: current.connectionId }, { Authorization: authorization, DPoP: nonceProof }, 201, active);
      check(nonceShape(nonce) && nonce.connectionId === current.connectionId && Date.parse(nonce.expiresAt) > Date.now());
      const proof = await signed('dpop+jwt', { jti: b64(crypto.getRandomValues(new Uint8Array(24))),
        iat: Math.floor(Date.now() / 1000), htm: 'GET', htu: origin + paths.status, ath, nonce: nonce.nonce });
      const value = await request('status', undefined, { Authorization: authorization, DPoP: proof,
        'X-Freedom-Connection': current.connectionId, 'X-Freedom-Nonce': nonce.nonceId }, 200, active);
      check(shape(value, { connectionId: literal(current.connectionId), runtimeDeviceId: literal(current.runtimeDeviceId),
        clientId: literal(clientId), environment: literal(environment), connectionVersion: isVersion, expiresAt: isTime,
        state: literal('active'), operation: literal('bootstrap.status.read'), operational_authority: noAuthority }));
      return Object.freeze(value);
    }); },
    close() { clear('closed'); },
  });
}
