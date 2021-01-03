import {PreviewServerError} from '../../lib/preview-server/preview-error';


// Matchers
const toBeRejectedWithPreviewServerError: jasmine.CustomAsyncMatcherFactory = () => {
  return {
    async compare(actualPromise: Promise<never>, expectedStatus: number, expectedMessage?: string | RegExp) {
      if (!(actualPromise instanceof Promise)) {
        throw new Error(`Expected '${toBeRejectedWithPreviewServerError.name}()' to be called on a promise.`);
      }

      try {
        await actualPromise;

        return {
          pass: false,
          message: `Expected a promise to be rejected with a '${PreviewServerError.name}', but it was resolved.`,
        };
      } catch (actualError) {
        const actualPrintValue = stringify(actualError);
        const expectedPrintValue =
            stringify(new PreviewServerError(expectedStatus, expectedMessage && `${expectedMessage}`));

        const pass = errorMatches(actualError, expectedStatus, expectedMessage);
        const message =
            `Expected a promise ${pass ? 'not ' : ''}to be rejected with ${expectedPrintValue}, but is was` +
            `${pass ? '' : ` rejected with ${actualPrintValue}`}.`;

        return {pass, message};
      }
    },
  };

  // Helpers
  function errorMatches(actualErr: unknown, expectedStatus: number, expectedMsg?: string | RegExp): boolean {
    if (!(actualErr instanceof PreviewServerError)) return false;
    if (actualErr.status !== expectedStatus) return false;
    return messageMatches(actualErr.message, expectedMsg);
  }

  function messageMatches(actualMsg: string, expectedMsg?: string | RegExp): boolean {
    if (typeof expectedMsg === 'undefined') return true;
    if (typeof expectedMsg === 'string') return actualMsg === expectedMsg;
    return expectedMsg.test(actualMsg);
  }

  function stringify(value: unknown): string {
    if (value instanceof PreviewServerError) {
      return `${PreviewServerError.name}(${value.status}${value.message ? `, ${value.message}` : ''})`;
    }

    return jasmine.pp(value);
  }
};

// Exports
export const customAsyncMatchers: jasmine.CustomAsyncMatcherFactories = {
  toBeRejectedWithPreviewServerError,
};
