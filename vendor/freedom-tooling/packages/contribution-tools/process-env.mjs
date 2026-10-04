// Local verification subprocesses need tools/temp/locale, not provider tokens,
// DB credentials, NODE_OPTIONS hooks or a parent node:test IPC context.
export function verificationEnvironment(source = process.env) {
  return Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'TMPDIR', 'LANG', 'LC_ALL']
    .filter(key => typeof source[key] === 'string').map(key => [key, source[key]]));
}
