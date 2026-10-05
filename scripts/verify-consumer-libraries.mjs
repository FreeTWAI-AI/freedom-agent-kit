import { verifyConsumerLibraries } from '../vendor/freedom-tooling/packages/contribution-tools/consumer-libraries.mjs';
import { safeFailure } from '../vendor/freedom-tooling/packages/contribution-tools/errors.mjs';

try {
  const [repository, expectedSourceCommit, mode, ...args] = process.argv.slice(2);
  const sourceRoot = mode === '--source-root' ? args.shift() : undefined;
  const [profileOption, expectedLibraryProfile, ...extra] = args;
  if (!['--source-root', '--remote'].includes(mode) || (mode === '--source-root' && (!sourceRoot || sourceRoot.startsWith('--')))
    || (args.length && (profileOption !== '--profile' || !expectedLibraryProfile || extra.length))) {
    throw new TypeError('Usage: node scripts/verify-consumer-libraries.mjs REPOSITORY EXPECTED_SOURCE_COMMIT --source-root PATH|--remote [--profile PROFILE]');
  }
  console.log(JSON.stringify(await verifyConsumerLibraries(process.cwd(), {
    repository, expectedSourceCommit, expectedLibraryProfile, sourceRoot, remote: mode === '--remote',
  }), null, 2));
} catch (error) {
  console.log(JSON.stringify(safeFailure(error)));
  process.exitCode = 1;
}
