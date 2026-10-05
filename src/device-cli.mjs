// Generated versioned bootstrap entry. Upgrade through the central exporter.
import { pathToFileURL } from 'node:url';
import { deviceCliMain } from '../vendor/freedom-libraries/packages/sdk/machine-device-cli.mjs';
export { runDeviceCli } from '../vendor/freedom-libraries/packages/sdk/machine-device-cli.mjs';
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  process.exitCode = await deviceCliMain();
}
