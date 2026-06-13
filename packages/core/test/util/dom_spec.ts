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

      // A standalone `>` or `->` is escaped regardless of position so that a delimiter which
      // overlaps an earlier match (e.g. the `-->` in `<!-->`) can't survive a single pass.
      expect(escapeCommentText('.>')).toEqual('.\u200b>\u200b');
      expect(escapeCommentText('.->')).toEqual('.-\u200b>\u200b');
      expect(escapeCommentText('<!-.')).toEqual('<!-.');
    });

    it('should escape delimiters that overlap an earlier match', () => {
      // `<!-->` contains both `<!--` and a `-->` that shares its `--`; both must be neutralized.
      expect(escapeCommentText('<!-->')).toEqual('\u200b<\u200b!--\u200b>\u200b');
      expect(escapeCommentText('<!--!>')).toEqual('\u200b<\u200b!--!\u200b>\u200b');
      expect(escapeCommentText('a<!-->b')).toEqual('a\u200b<\u200b!--\u200b>\u200bb');
    });

    it('should keep an injected payload inside a programmatically created comment', () => {
      // `<!-->` closes a comment immediately (the `-->` overlaps the `<!--`), so without escaping
      // the trailing markup leaks out of the comment and runs. Round-trip a comment node through
      // serialization + re-parsing to confirm the payload stays inert comment text.
      const host = document.createElement('div');
      host.appendChild(
        document.createComment(escapeCommentText('<!--><img src=x onerror="alert(1)">')),
      );

      const reparsed = document.createElement('div');
      reparsed.innerHTML = host.innerHTML;

      expect(reparsed.childNodes.length).toBe(1);
      expect(reparsed.firstChild!.nodeType).toBe(Node.COMMENT_NODE);
      expect(reparsed.getElementsByTagName('img').length).toBe(0);
    });
  });
});
