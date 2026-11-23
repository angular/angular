/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ErrorCode} from '../../../../diagnostics';
import {formatExtendedError} from '../../api/format-extended-error';

describe('formatExtendedError', () => {
  it('should format the message without repeating the error code', () => {
    expect(formatExtendedError(ErrorCode.UNINVOKED_TRACK_FUNCTION, 'message')).toBe(
      'message. Find more at https://angular.dev/extended-diagnostics/NG8115',
    );

    expect(formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, 'Some text.')).toBe(
      'Some text. Find more at https://angular.dev/extended-diagnostics/NG8021',
    );
  });

  it('should only return the link when there is no message', () => {
    expect(formatExtendedError(ErrorCode.UNINVOKED_TRACK_FUNCTION, null)).toBe(
      'Find more at https://angular.dev/extended-diagnostics/NG8115',
    );
  });
});
