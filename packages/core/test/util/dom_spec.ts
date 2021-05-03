/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeCommentText} from '@angular/core/src/util/dom';

describe('comment node text escaping', () => {
  describe('escapeCommentText', () => {
    it('should not change anything on basic text', () => {
      expect(escapeCommentText('text')).toEqual('text');
    });

    it('should escape "<" or ">"', () => {
      expect(escapeCommentText('<!--')).toEqual('\u200b<\u200b!--');
      expect(escapeCommentText('<!--<!--')).toEqual('\u200b<\u200b!--\u200b<\u200b!--');
      expect(escapeCommentText('>')).toEqual('\u200b>\u200b');
      expect(escapeCommentText('>-->')).toEqual('\u200b>\u200b--\u200b>\u200b');
    });

    it('should escape end marker', () => {
      expect(escapeCommentText('before-->after')).toEqual('before--\u200b>\u200bafter');
    });

    it('should escape multiple markers', () => {
      expect(escapeCommentText('before-->inline-->after'))
          .toEqual('before--\u200b>\u200binline--\u200b>\u200bafter');
    });

    it('should caver the spec', () => {
      // https://html.spec.whatwg.org/multipage/syntax.html#comments
      expect(escapeCommentText('>')).toEqual('\u200b>\u200b');
      expect(escapeCommentText('->')).toEqual('-\u200b>\u200b');
      expect(escapeCommentText('<!--')).toEqual('\u200b<\u200b!--');
      expect(escapeCommentText('-->')).toEqual('--\u200b>\u200b');
      expect(escapeCommentText('--!>')).toEqual('--!\u200b>\u200b');
      expect(escapeCommentText('<!-')).toEqual('\u200b<\u200b!-');

      // Things which are OK
      expect(escapeCommentText('.>')).toEqual('.>');
      expect(escapeCommentText('.->')).toEqual('.->');
      expect(escapeCommentText('<!-.')).toEqual('<!-.');
    });
  });
});
