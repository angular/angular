/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  addDiagnosticDetails,
  ErrorCode,
  ERROR_DETAILS_PAGE_BASE_URL,
  formatCompilerErrorCode,
  ngErrorCode,
} from '../index';

describe('compiler error formatting', () => {
  it('formats compiler error codes using the absolute enum value', () => {
    expect(formatCompilerErrorCode(ErrorCode.DECORATOR_ARG_NOT_LITERAL)).toBe('NG1001');
    expect(formatCompilerErrorCode(ErrorCode.DECORATOR_ARITY_WRONG)).toBe('NG1002');
  });

  it('keeps diagnostic codes stable for error codes with guide markers', () => {
    expect(ngErrorCode(ErrorCode.DECORATOR_ARG_NOT_LITERAL)).toBe(-991001);
    expect(ngErrorCode(ErrorCode.DECORATOR_ARITY_WRONG)).toBe(-991002);
  });

  it('adds error guide details to diagnostic message chains', () => {
    const messageText: ts.DiagnosticMessageChain = {
      category: ts.DiagnosticCategory.Message,
      code: 0,
      messageText: 'message',
      next: [
        {
          category: ts.DiagnosticCategory.Message,
          code: 0,
          messageText: 'related message',
        },
      ],
    };

    expect(addDiagnosticDetails(ErrorCode.DECORATOR_ARG_NOT_LITERAL, messageText)).toEqual({
      ...messageText,
      messageText: `message. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG1001`,
    });
  });
});
