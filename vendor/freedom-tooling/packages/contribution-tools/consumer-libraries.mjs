import { execFileSync } from 'node:child_process';
import { readBounded, parseJson, sha256, readRemoteBounded } from './io.mjs';
import { requireCondition as check } from './errors.mjs';
import { verificationEnvironment } from './process-env.mjs';

// This is a source distribution map. It is not ReleaseSet approval or usage evidence.
export const CONSUMER_LIBRARIES = Object.freeze({
  'FreeTWAI-AI/freedom-agent-kit': ['packages/sdk/member-workspace.mjs'],
  'FreeTWAI-AI/freedom-storefront': [
    'packages/client-connections/read-client.mjs',
    'packages/client-connections/storefront-workspace.mjs',
  ],
  'FreeTWAI-AI/freedom-supplier-client': [
    'packages/client-connections/read-client.mjs',
    'packages/client-connections/supplier-workspace.mjs',
  ],
});
export const LIBRARY_LOCK = 'consumer-libraries.lock.json';
export const LIBRARY_PREFIX = 'vendor/freedom-libraries/';
export const LEGACY_LIBRARY_PROFILE = 'legacy-v1';
export const AGENT_KIT_DEVICE_LIBRARY_PROFILE = 'agent-kit-device-v1';
const deviceLibraries = Object.freeze([
  'packages/sdk/member-workspace.mjs',
  'packages/sdk/machine-device-client.mjs',
]);

/** The host/operator selects a fixed profile; a candidate lock never selects it. */
export function consumerLibraryProfile(repository, expectedLibraryProfile = LEGACY_LIBRARY_PROFILE) {
  check(Object.hasOwn(CONSUMER_LIBRARIES, repository), 'unsupported_library_consumer');
  if (expectedLibraryProfile === LEGACY_LIBRARY_PROFILE) {
    return { id: LEGACY_LIBRARY_PROFILE, format: 'freedom.consumer-libraries/v1', paths: CONSUMER_LIBRARIES[repository] };
  }
  check(repository === 'FreeTWAI-AI/freedom-agent-kit'
    && expectedLibraryProfile === AGENT_KIT_DEVICE_LIBRARY_PROFILE, 'unsupported_library_profile');
  return { id: AGENT_KIT_DEVICE_LIBRARY_PROFILE, format: 'freedom.consumer-libraries/v2', paths: deviceLibraries };
}

export function sourceGit(root, args) {
  return execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args], {
    cwd: root, env: verificationEnvironment(), encoding: 'buffer', maxBuffer: 4_000_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** Verify with a host-selected expected commit; self-declared lock digests are insufficient. */
export async function verifyConsumerLibraries(root, { expectedSourceCommit, expectedLibraryProfile, repository, sourceRoot, remote = false, fetcher } = {}) {
  check(/^[a-f0-9]{40}$/.test(expectedSourceCommit ?? ''), 'expected_library_source_required');
  const profile = consumerLibraryProfile(repository, expectedLibraryProfile);
  check(Boolean(sourceRoot) !== remote, 'one_library_source_required');
  const lock = parseJson(await readBounded(root, LIBRARY_LOCK));
  check(lock.source_repository === 'FreeTWAI-AI/freedom-platform'
    && lock.source_commit === expectedSourceCommit && lock.repository === repository, 'library_source_mismatch');
  check(lock.format === profile.format && (profile.id === LEGACY_LIBRARY_PROFILE
    ? !Object.hasOwn(lock, 'profile') : lock.profile === profile.id), 'library_profile_mismatch');
  const expected = profile.paths;
  check(Array.isArray(lock.files)
    && lock.files.length === expected.length, 'library_profile_mismatch');
  for (const [index, path] of expected.entries()) {
    const file = lock.files[index];
    check(file?.source_path === path && file.path === LIBRARY_PREFIX + path
      && /^[a-f0-9]{64}$/.test(file.sha256 ?? '') && Number.isSafeInteger(file.bytes) && file.bytes > 0,
    'library_profile_mismatch');
    const bytes = await readBounded(root, file.path);
    check(bytes.length === file.bytes && sha256(bytes) === file.sha256, 'library_bytes_mismatch');
    const source = sourceRoot
      ? sourceGit(sourceRoot, ['show', `${expectedSourceCommit}:${path}`])
      : await readRemoteBounded(`https://raw.githubusercontent.com/${lock.source_repository}/${expectedSourceCommit}/${path}`, fetcher);
    check(source.equals(bytes), 'library_source_bytes_mismatch');
  }
  return { repository: lock.repository, source_commit: expectedSourceCommit, library_profile: profile.id, files_verified: expected.length,
    verification: 'source_bytes_only', library_usage: 'not_checked', publisher_trust: 'unverified' };
}
