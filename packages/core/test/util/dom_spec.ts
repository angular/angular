/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {escapeCommentText} from '../../src/util/dom';

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
      expect(escapeCommentText('before-->inline-->after')).toEqual(
        'before--\u200b>\u200binline--\u200b>\u200bafter',
      );
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

    it('should escape markers which share characters', () => {
      // The `--` belongs to both the `<!--` and the `--!>`/`-->` marker.
      expect(escapeCommentText('<!--!>')).toEqual('\u200b<\u200b!--!\u200b>\u200b');
      expect(escapeCommentText('<!--->')).toEqual('\u200b<\u200b!---\u200b>\u200b');
      expect(escapeCommentText('<!--!><img src="x">')).toEqual(
        '\u200b<\u200b!--!\u200b>\u200b<img src="x">',
      );
    });

    it('should not escape a bare ">" or "->" in the middle of the text', () => {
      // A previous attempt dropped the anchors and escaped these mid-text, which changed the
      // serialized output of any comment containing a plain `>`. They must stay untouched.
      expect(escapeCommentText('a>b')).toEqual('a>b');
      expect(escapeCommentText('a->b')).toEqual('a->b');
      expect(escapeCommentText('.>')).toEqual('.>');
      expect(escapeCommentText('.->')).toEqual('.->');
    });
  });
});
