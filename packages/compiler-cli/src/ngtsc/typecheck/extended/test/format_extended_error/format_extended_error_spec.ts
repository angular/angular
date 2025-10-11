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
  it('should format the error code and message', async () => {
    expect(formatExtendedError(ErrorCode.UNINVOKED_TRACK_FUNCTION, 'message')).toBe(
      'NG8115: message. Find more at https://angular.dev/extended-diagnostics/NG8115',
    );

    expect(formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, 'Some text.')).toBe(
      'NG8021: Some text. Find more at https://angular.dev/extended-diagnostics/NG8021',
    );
  });
});
