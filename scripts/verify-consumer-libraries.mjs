import { verifyConsumerLibraries } from '../vendor/freedom-tooling/packages/contribution-tools/consumer-libraries.mjs';
import { safeFailure } from '../vendor/freedom-tooling/packages/contribution-tools/errors.mjs';

try {
  const [repository, expectedSourceCommit, mode, sourceRoot, ...extra] = process.argv.slice(2);
  if (extra.length || !['--source-root', '--remote'].includes(mode) || (mode === '--remote' && sourceRoot)) {
    throw new TypeError('Usage: node scripts/verify-consumer-libraries.mjs REPOSITORY EXPECTED_SOURCE_COMMIT --source-root PATH|--remote');
  }
  console.log(JSON.stringify(await verifyConsumerLibraries(process.cwd(), {
    repository, expectedSourceCommit, sourceRoot, remote: mode === '--remote',
  }), null, 2));
} catch (error) {
  console.log(JSON.stringify(safeFailure(error)));
  process.exitCode = 1;
}
