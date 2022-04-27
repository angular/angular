/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '../core.js';
import {HtmlParser} from '../ml_parser/html_parser.js';
import {DEFAULT_INTERPOLATION_CONFIG} from '../ml_parser/interpolation_config.js';
import {TokenizeOptions} from '../ml_parser/lexer.js';
import {ParseTreeResult} from '../ml_parser/parser.js';
import {Console} from '../util.js';

import {digest} from './digest.js';
import {mergeTranslations} from './extractor_merger.js';
import {Serializer} from './serializers/serializer.js';
import {Xliff} from './serializers/xliff.js';
import {Xliff2} from './serializers/xliff2.js';
import {Xmb} from './serializers/xmb.js';
import {Xtb} from './serializers/xtb.js';
import {TranslationBundle} from './translation_bundle.js';

export class I18NHtmlParser implements HtmlParser {
  // @override
  getTagDefinition: any;

  private _translationBundle: TranslationBundle;

  constructor(
      private _htmlParser: HtmlParser, translations?: string, translationsFormat?: string,
      missingTranslation: MissingTranslationStrategy = MissingTranslationStrategy.Warning,
      console?: Console) {
    if (translations) {
      const serializer = createSerializer(translationsFormat);
      this._translationBundle =
          TranslationBundle.load(translations, 'i18n', serializer, missingTranslation, console);
    } else {
      this._translationBundle =
          new TranslationBundle({}, null, digest, undefined, missingTranslation, console);
    }
  }

  parse(source: string, url: string, options: TokenizeOptions = {}): ParseTreeResult {
    const interpolationConfig = options.interpolationConfig || DEFAULT_INTERPOLATION_CONFIG;
    const parseResult = this._htmlParser.parse(source, url, {interpolationConfig, ...options});

    if (parseResult.errors.length) {
      return new ParseTreeResult(parseResult.rootNodes, parseResult.errors);
    }

    return mergeTranslations(
        parseResult.rootNodes, this._translationBundle, interpolationConfig, [], {});
  }
}

function createSerializer(format?: string): Serializer {
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
