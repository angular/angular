/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RegExpPathMapper} from '../../../src/translate/mapped_files/regexp_path_mapper';

describe('RegExpPathMapper', () => {
  describe('mapPath()', () => {
    it('should map the source string using the regex and replacer string', () => {
      const mapper = new RegExpPathMapper(/src\/(.+\.jpg$)/, 'translations/{{LOCALE}}/$1');
      expect(mapper.mapPath('src/aaa/bbb/ccc.jpg'))
          .toEqual('translations/{{LOCALE}}/aaa/bbb/ccc.jpg');
    });
  });
});
