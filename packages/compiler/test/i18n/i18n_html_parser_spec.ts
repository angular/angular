/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {I18NHtmlParser} from '@angular/compiler/src/i18n/i18n_html_parser';
import {TranslationBundle} from '@angular/compiler/src/i18n/translation_bundle';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {ParseTreeResult} from '@angular/compiler/src/ml_parser/parser';

{
  describe('I18N html parser', () => {
    // https://github.com/angular/angular/issues/14322
    it('should parse the translations only once', () => {
      const transBundle = new TranslationBundle({}, null, () => 'id');
      spyOn(TranslationBundle, 'load').and.returnValue(transBundle);
      const htmlParser = new HtmlParser();
      const i18nHtmlParser = new I18NHtmlParser(htmlParser, 'translations');

      expect(TranslationBundle.load).toHaveBeenCalledTimes(1);

      i18nHtmlParser.parse('source', 'url');
      i18nHtmlParser.parse('source', 'url');
      expect(TranslationBundle.load).toHaveBeenCalledTimes(1);
    });
  });
}
