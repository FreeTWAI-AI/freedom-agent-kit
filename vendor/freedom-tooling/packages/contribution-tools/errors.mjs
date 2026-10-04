// Error messages are codes, never candidate JSON, filenames, URLs or provider errors.
export class VerificationError extends Error {
  constructor(code, unavailable = false) {
    super(code);
    this.name = 'VerificationError';
    this.code = code;
    this.unavailable = unavailable;
  }
}

export function requireCondition(condition, code) {
  if (!condition) throw new VerificationError(code);
}

export function safeFailure(error) {
  return {
    status: error instanceof VerificationError && error.unavailable ? 'unavailable' : 'failed',
    code: error instanceof VerificationError ? error.code : 'verification_failed',
  };
}
