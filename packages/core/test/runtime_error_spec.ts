/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../src/errors';

describe('RuntimeError utils', () => {
  it('should format the error message correctly', () => {
    // Error with a guide, but without an error message.
    let errorInstance = new RuntimeError<RuntimeErrorCode>(RuntimeErrorCode.EXPORT_NOT_FOUND, '');
    expect(errorInstance.toString())
        .toBe('Error: NG0301. Find more at https://angular.io/errors/NG0301');

    // Error without a guide and an error message.
    errorInstance = new RuntimeError(RuntimeErrorCode.TEMPLATE_STRUCTURE_ERROR, '');
    expect(errorInstance.toString()).toBe('Error: NG0305');

    // Error without a guide, but with an error message.
    errorInstance =
        new RuntimeError(RuntimeErrorCode.TEMPLATE_STRUCTURE_ERROR, 'Some error message');
    expect(errorInstance.toString()).toBe('Error: NG0305: Some error message');

    // Error with both a guide and an error message.
    errorInstance = new RuntimeError(RuntimeErrorCode.EXPORT_NOT_FOUND, 'Some error message');
    expect(errorInstance.toString())
        .toBe('Error: NG0301: Some error message. Find more at https://angular.io/errors/NG0301');
  });

  it('should trim the provided error message', () => {
    const error = new RuntimeError(RuntimeErrorCode.EXPORT_NOT_FOUND, '   Some error message ');
    expect(error.toString())
        .toBe('Error: NG0301: Some error message. Find more at https://angular.io/errors/NG0301');
  });

  ['.', ',', ';', '!', '?'].forEach(
      character => it(
          `should not add a period between the error message and the aio guide suffix if the message ends with '${
              character}'`,
          () => {
            const errorMessage = `Pipe not found${character}`;
            const error =
                new RuntimeError<RuntimeErrorCode>(RuntimeErrorCode.PIPE_NOT_FOUND, errorMessage);
            expect(error.toString())
                .toBe(`Error: NG0302: Pipe not found${
                    character} Find more at https://angular.io/errors/NG0302`);
          }));

  it('should trim the error message before applying the period check', () => {
    const errorMessage = `Pipe not found?  `;
    const error = new RuntimeError<RuntimeErrorCode>(RuntimeErrorCode.PIPE_NOT_FOUND, errorMessage);
    expect(error.toString())
        .toBe(`Error: NG0302: Pipe not found? Find more at https://angular.io/errors/NG0302`);
  });
});
