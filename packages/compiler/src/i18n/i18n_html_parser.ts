/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MissingTranslationStrategy} from '../core';
import {DEFAULT_INTERPOLATION_CONFIG} from '../ml_parser/defaults';
import {HtmlParser} from '../ml_parser/html_parser';
import {TokenizeOptions} from '../ml_parser/lexer';
import {ParseTreeResult} from '../ml_parser/parser';
import {Console} from '../util';

import {digest} from './digest';
import {mergeTranslations} from './extractor_merger';
import {Serializer} from './serializers/serializer';
import {Xliff} from './serializers/xliff';
import {Xliff2} from './serializers/xliff2';
import {Xmb} from './serializers/xmb';
import {Xtb} from './serializers/xtb';
import {TranslationBundle} from './translation_bundle';

export class I18NHtmlParser implements HtmlParser {
  // @override
  getTagDefinition: any;

  private _translationBundle: TranslationBundle;

  constructor(
    private _htmlParser: HtmlParser,
    translations?: string,
    translationsFormat?: string,
    missingTranslation: MissingTranslationStrategy = MissingTranslationStrategy.Warning,
    console?: Console,
  ) {
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

  parse(source: string, url: string, options: TokenizeOptions = {}): ParseTreeResult {
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
