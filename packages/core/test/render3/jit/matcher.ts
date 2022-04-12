/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Jasmine matcher to verify that a function contains the provided code fragments.
 */
export function functionContaining(expectedFragments: Array<string|RegExp>):
    jasmine.AsymmetricMatcher<Function> {
  let _actual: Function|null = null;

  const matches = (code: string, fragment: string|RegExp): boolean => {
    if (typeof fragment === 'string') {
      return code.includes(fragment);
    } else {
      return fragment.test(code);
    }
  };

  return {
    asymmetricMatch(actual: Function): boolean {
      _actual = actual;

      if (typeof actual !== 'function') {
        return false;
      }
      const code = actual.toString();
      for (const fragment of expectedFragments) {
        if (!matches(code, fragment)) {
          return false;
        }
      }
      return true;
    },
    jasmineToString(pp: (value: any) => string): string {
      if (typeof _actual !== 'function') {
        return `Expected function to contain code fragments ${pp(expectedFragments)} but got ${
            pp(_actual)}`;
      }
      const errors: string[] = [];
      const code = _actual.toString();
      errors.push(
          `The actual function with code:\n${code}\n\ndid not contain the following fragments:`);
      for (const fragment of expectedFragments) {
        if (!matches(code, fragment)) {
          errors.push(`- ${fragment}`);
        }
      }
      return errors.join('\n');
    }
  };
}
