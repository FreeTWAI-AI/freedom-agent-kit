import { createMachineDeviceClient } from './machine-device-client.mjs';

// One in-memory process: display pairing instructions, wait for the member's
// separate browser approval, rotate once, then read bootstrap status. This does
// not grant execution, invoke a model, or persist reconnect credentials.
// A future custody port must reserve one-use material durably before sending,
// and atomically settle it. An interrupted reservation must never be retried.
const safeErrors = new Set(['configuration_invalid', 'response_invalid', 'http_rejected', 'aborted', 'transport_failed',
  'client_failed', 'client_unavailable', 'pairing_expired', 'exchange_outcome_unknown', 'refresh_outcome_unknown']);

export async function runDeviceCli(args, { createClient = createMachineDeviceClient, write = line => process.stdout.write(line), signal } = {}) {
  let client;
  const output = value => write(JSON.stringify(value) + '\n');
  try {
    if (args.length !== 3 || args.some(value => typeof value !== 'string') || typeof createClient !== 'function') {
      output({ error: 'usage', usage: 'node src/device-cli.mjs HTTPS_ORIGIN ENVIRONMENT CLIENT_ID', operational_authority: false });
      return 2;
    }
    const [origin, environment, clientId] = args;
    client = await createClient({ origin, environment, clientId });
    const pairing = await client.begin({ signal });
    output({ stage: 'member_approval_required', userCode: pairing.userCode, verificationUri: pairing.verificationUri,
      expiresAt: pairing.expiresAt, operational_authority: false });
    const paired = await client.pair({ signal });
    if (paired.status === 'access_denied' || paired.status === 'expired_token') {
      output({ stage: paired.status, operational_authority: false }); return 1;
    }
    await client.refresh({ signal });
    const status = await client.readStatus({ signal });
    output({ stage: 'bootstrap_status', connectionId: status.connectionId, runtimeDeviceId: status.runtimeDeviceId,
      state: status.state, expiresAt: status.expiresAt, operation: 'bootstrap.status.read', operational_authority: false });
    return 0;
  } catch (error) {
    output({ error: safeErrors.has(error?.code) ? error.code : 'device_client_failed', operational_authority: false });
    return 1;
  } finally { client?.close(); }
}

export async function deviceCliMain(args = process.argv.slice(2)) {
  const abort = new AbortController(), cancel = () => abort.abort();
  process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
  try { return await runDeviceCli(args, { signal: abort.signal }); }
  finally { process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); }
}
