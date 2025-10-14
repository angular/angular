/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MissingTranslationStrategy} from '../core';
import {DEFAULT_INTERPOLATION_CONFIG} from '../ml_parser/defaults';
import {ParseTreeResult} from '../ml_parser/parser';
import {digest} from './digest';
import {mergeTranslations} from './extractor_merger';
import {Xliff} from './serializers/xliff';
import {Xliff2} from './serializers/xliff2';
import {Xmb} from './serializers/xmb';
import {Xtb} from './serializers/xtb';
import {TranslationBundle} from './translation_bundle';
export class I18NHtmlParser {
  _htmlParser;
  // @override
  getTagDefinition;
  _translationBundle;
  constructor(
    _htmlParser,
    translations,
    translationsFormat,
    missingTranslation = MissingTranslationStrategy.Warning,
    console,
  ) {
    this._htmlParser = _htmlParser;
    if (translations) {
      const serializer = createSerializer(translationsFormat);
      this._translationBundle = TranslationBundle.load(
        translations,
        'i18n',
        serializer,
        missingTranslation,
        console,
      );
    } else {
      this._translationBundle = new TranslationBundle(
        {},
        null,
        digest,
        undefined,
        missingTranslation,
        console,
      );
    }
  }
  parse(source, url, options = {}) {
    const interpolationConfig = options.interpolationConfig || DEFAULT_INTERPOLATION_CONFIG;
    const parseResult = this._htmlParser.parse(source, url, {interpolationConfig, ...options});
    if (parseResult.errors.length) {
      return new ParseTreeResult(parseResult.rootNodes, parseResult.errors);
    }
    return mergeTranslations(
      parseResult.rootNodes,
      this._translationBundle,
      interpolationConfig,
      [],
      {},
    );
  }
}
function createSerializer(format) {
  format = (format || 'xlf').toLowerCase();
  switch (format) {
    case 'xmb':
      return new Xmb();
    case 'xtb':
      return new Xtb();
    case 'xliff2':
    case 'xlf2':
      return new Xliff2();
    case 'xliff':
    case 'xlf':
    default:
      return new Xliff();
  }
}
//# sourceMappingURL=i18n_html_parser.js.map
