/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inspect} from 'util';
import {ExpectedError} from './get_compliance_tests';

export function checkErrors(
  testPath: string,
  failureMessage: string,
  expectedErrors: ExpectedError[],
  actualErrors: string[],
): void {
  for (const expectedError of expectedErrors) {
    if (
      !actualErrors.some(
        (actualError) =>
          expectedError.message.test(actualError) && expectedError.location.test(actualError),
      )
    ) {
      throw new Error(
        `When checking expected errors for test case at "${testPath}"\n` +
          failureMessage +
          '\n' +
          `Expected errors: ${inspect(expectedErrors)}\n` +
          `Actual errors: ${inspect(actualErrors)}.`,
      );
    }
  }
}

export function checkNoUnexpectedErrors(testPath: string, actualErrors: string[]): void {
  if (actualErrors.length > 0) {
    throw new Error(
      `Unexpected errors occurred for test case at "${testPath}"\n` +
        `Errors: ${inspect(actualErrors)}.`,
    );
  }
}
