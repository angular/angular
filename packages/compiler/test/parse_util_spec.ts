/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseError, ParseErrorLevel, ParseLocation, ParseSourceFile, ParseSourceSpan} from '../src/parse_util';

{
  describe('ParseError', () => {
    it('should reflect the level in the message', () => {
      const file = new ParseSourceFile(`foo\nbar\nfoo`, 'url');
      const start = new ParseLocation(file, 4, 1, 0);
      const end = new ParseLocation(file, 6, 1, 2);
      const span = new ParseSourceSpan(start, end);

      const fatal = new ParseError(span, 'fatal', ParseErrorLevel.ERROR);
      expect(fatal.toString()).toEqual('fatal ("foo\n[ERROR ->]bar\nfoo"): url@1:0');

      const warning = new ParseError(span, 'warning', ParseErrorLevel.WARNING);
      expect(warning.toString()).toEqual('warning ("foo\n[WARNING ->]bar\nfoo"): url@1:0');
    });
  });
}
