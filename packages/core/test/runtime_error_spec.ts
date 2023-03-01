/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../src/errors';

describe('RuntimeError utils', () => {
  it('should correctly format an error without an error message', () => {
    const error = new RuntimeError<RuntimeErrorCode>(RuntimeErrorCode.EXPORT_NOT_FOUND, '');
    expect(error.toString()).toBe('Error: NG0301. Find more at https://angular.io/errors/NG0301');
  });

  it('should correctly format an error without an error message not aio guide', () => {
    const error = new RuntimeError(RuntimeErrorCode.TEMPLATE_STRUCTURE_ERROR, '');
    expect(error.toString()).toBe('Error: NG0305');
  });

  it('should correctly format an error with an error message but without an aio guide', () => {
    const error = new RuntimeError(RuntimeErrorCode.TEMPLATE_STRUCTURE_ERROR, 'Some error message');
    expect(error.toString()).toBe('Error: NG0305: Some error message');
  });

  it('should correctly format an error with both an error message and an aio guide', () => {
    const error = new RuntimeError(RuntimeErrorCode.EXPORT_NOT_FOUND, 'Some error message');
    expect(error.toString())
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
