import { constants } from 'node:fs';
import { lstat, open, readdir, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { VerificationError, requireCondition as check } from './errors.mjs';

export const MAX_FILE_BYTES = 2_000_000;
export const MAX_ARTIFACTS = 1024;
export const MAX_TOTAL_BYTES = 32_000_000;
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function artifactPath(path) {
  check(typeof path === 'string' && path.length > 0 && path.length <= 240, 'invalid_artifact_path');
  check(!/[^-a-zA-Z0-9_./]/.test(path), 'invalid_artifact_path');
  const parts = path.split('/');
  check(parts.length <= 16 && parts.every(part => part && part !== '.' && part !== '..'
    && !part.endsWith('.') && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)), 'invalid_artifact_path');
  return path;
}

export function uniquePaths(paths) {
  check(Array.isArray(paths) && paths.length <= MAX_ARTIFACTS + 2, 'artifact_limit');
  const seen = new Set(), spellings = new Map();
  for (const path of paths) {
    artifactPath(path);
    check(!seen.has(path), 'duplicate_artifact_path');
    seen.add(path);
    const parts = path.split('/');
    for (let index = 1; index <= parts.length; index++) {
      const prefix = parts.slice(0, index).join('/'), folded = prefix.toLowerCase();
      check(!spellings.has(folded) || spellings.get(folded) === prefix, 'case_collision');
      spellings.set(folded, prefix);
    }
  }
  for (const path of seen) {
    const parts = path.split('/');
    for (let index = 1; index < parts.length; index++) {
      check(!seen.has(parts.slice(0, index).join('/')), 'artifact_parent_collision');
    }
  }
  return seen;
}

// Untrusted JSON must have one interpretation. JSON.parse alone loses duplicate keys.
// Limits are enforced before parsing, including escaped duplicate names and UTF-8.
export function parseJson(bytes, { maxBytes = MAX_FILE_BYTES, maxDepth = 64, maxNodes = 100_000 } = {}) {
  check(typeof bytes === 'string' || bytes instanceof Uint8Array, 'invalid_json');
  check(Buffer.byteLength(bytes) <= maxBytes, 'json_size_limit');
  let text;
  try {
    text = typeof bytes === 'string' ? bytes : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch { throw new VerificationError('invalid_json_encoding'); }
  check(text.isWellFormed(), 'invalid_json_encoding');
  let offset = 0, nodes = 0;
  const space = () => { while (/[\x20\t\n\r]/.test(text[offset] ?? '\0')) offset++; };
  const string = () => {
    const start = offset++;
    while (offset < text.length) {
      const char = text[offset++];
      if (char === '"') {
        let result;
        try { result = JSON.parse(text.slice(start, offset)); } catch { throw new VerificationError('invalid_json'); }
        check(result.isWellFormed(), 'invalid_json_encoding');
        return result;
      }
      if (char === '\\') offset++; // JSON.parse validates the escape and any control characters.
    }
    throw new VerificationError('invalid_json');
  };
  const value = depth => {
    check(depth <= maxDepth && ++nodes <= maxNodes, 'json_complexity_limit');
    space();
    const char = text[offset];
    if (char === '"') return string();
    if (char === '{' || char === '[') {
      offset++;
      const object = char === '{', end = object ? '}' : ']', result = object ? Object.create(null) : [];
      space();
      if (text[offset] === end) { offset++; return result; }
      while (offset < text.length) {
        if (object) {
          check(text[offset] === '"', 'invalid_json');
          const key = string();
          check(!Object.hasOwn(result, key), 'duplicate_json_key');
          space();
          check(text[offset++] === ':', 'invalid_json');
          result[key] = value(depth + 1);
        } else result.push(value(depth + 1));
        space();
        const separator = text[offset++];
        if (separator === end) return result;
        check(separator === ',', 'invalid_json');
        space();
      }
      throw new VerificationError('invalid_json');
    }
    for (const [literal, result] of [['true', true], ['false', false], ['null', null]]) {
      if (text.startsWith(literal, offset)) { offset += literal.length; return result; }
    }
    const match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(text.slice(offset));
    check(match, 'invalid_json');
    const number = Number(match[0]);
    check(Number.isFinite(number) && (!Number.isInteger(number) || Number.isSafeInteger(number)), 'invalid_json_number');
    offset += match[0].length;
    return number;
  };
  const result = value(0);
  space();
  check(offset === text.length, 'invalid_json');
  return result;
}

async function checkedPath(root, path) {
  artifactPath(path);
  const base = resolve(root), rootStat = await lstat(base);
  check(rootStat.isDirectory() && !rootStat.isSymbolicLink(), 'unsafe_artifact_root');
  const realBase = await realpath(base);
  let target = base;
  const parts = path.split('/');
  for (let index = 0; index < parts.length; index++) {
    target = resolve(target, parts[index]);
    const stat = await lstat(target);
    check(!stat.isSymbolicLink(), 'artifact_symlink');
    if (index < parts.length - 1) check(stat.isDirectory(), 'artifact_not_directory');
  }
  const rel = relative(realBase, await realpath(target));
  check(rel && !isAbsolute(rel) && rel !== '..' && !rel.startsWith('../') && !rel.startsWith('..\\'), 'artifact_escape');
  return target;
}

export async function readBounded(root, path, maxBytes = MAX_FILE_BYTES) {
  let handle;
  try {
    const target = await checkedPath(root, path), before = await lstat(target);
    check(before.isFile() && before.nlink === 1, 'artifact_not_regular');
    check(before.size <= maxBytes, 'artifact_size_limit');
    handle = await open(target, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    const opened = await handle.stat();
    check(opened.isFile() && opened.nlink === 1 && opened.dev === before.dev && opened.ino === before.ino, 'artifact_changed');
    // Never allocate/read an unbounded file, including one growing after lstat.
    const chunks = []; let total = 0;
    while (true) {
      const buffer = Buffer.alloc(Math.min(64 * 1024, maxBytes + 1 - total));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (!bytesRead) break;
      total += bytesRead;
      check(total <= maxBytes, 'artifact_size_limit');
      chunks.push(buffer.subarray(0, bytesRead));
    }
    const after = await handle.stat();
    check(after.size === total && after.size === opened.size && after.mtimeMs === opened.mtimeMs
      && after.ctimeMs === opened.ctimeMs, 'artifact_changed');
    await checkedPath(root, path);
    return Buffer.concat(chunks, total);
  } catch (error) {
    if (error instanceof VerificationError) throw error;
    throw new VerificationError(error?.code === 'ENOENT' ? 'artifact_missing' : 'artifact_read_failed');
  } finally { await handle?.close(); }
}

export async function listArtifacts(root) {
  const files = [], prefixes = [];
  let entries = 0;
  async function walk(dir, prefix) {
    const stat = await lstat(dir);
    check(stat.isDirectory() && !stat.isSymbolicLink(), 'artifact_symlink');
    // An isolated, immutable checkout is still required in a privileged verifier.
    for (const item of await readdir(dir, { withFileTypes: true })) {
      check(++entries <= MAX_ARTIFACTS * 4, 'artifact_limit');
      const path = artifactPath(prefix + item.name);
      prefixes.push(path);
      check(!item.isSymbolicLink(), 'artifact_symlink');
      if (item.isDirectory()) await walk(resolve(dir, item.name), path + '/');
      else { check(item.isFile(), 'artifact_not_regular'); files.push(path); }
    }
  }
  try { await walk(resolve(root), ''); }
  catch (error) {
    if (error instanceof VerificationError) throw error;
    throw new VerificationError('artifact_read_failed');
  }
  uniquePaths(files);
  // Include empty directories when detecting alternate case spellings.
  const cases = new Map();
  for (const path of prefixes) {
    check(!cases.has(path.toLowerCase()) || cases.get(path.toLowerCase()) === path, 'case_collision');
    cases.set(path.toLowerCase(), path);
  }
  return files.sort();
}

export async function readRemoteBounded(url, fetcher = globalThis.fetch) {
  let response;
  try { response = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(20_000) }); }
  catch { throw new VerificationError('pinned_source_unavailable', true); }
  if (!response.ok || !response.body) throw new VerificationError('pinned_source_unavailable', true);
  const reader = response.body.getReader(), chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      check(size <= MAX_FILE_BYTES, 'remote_size_limit');
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    if (error instanceof VerificationError) throw error;
    throw new VerificationError('pinned_source_unavailable', true);
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, size);
}
