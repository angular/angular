/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {I18nVersion, MissingTranslationStrategy, ɵConsole as Console} from '@angular/core';
import {HtmlParser} from '../ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../ml_parser/interpolation_config';
import {ParseTreeResult} from '../ml_parser/parser';
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
      private _htmlParser: HtmlParser, translations?: string, translationsFormat?: string,
      missingTranslation: MissingTranslationStrategy = MissingTranslationStrategy.Warning,
      console?: Console, version: I18nVersion = I18nVersion.Version0) {
    if (translations) {
      const serializer = createSerializer(translationsFormat, version);
      this._translationBundle =
          TranslationBundle.load(translations, 'i18n', serializer, missingTranslation, console);
    }
  }

  parse(
      source: string, url: string, parseExpansionForms: boolean = false,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ParseTreeResult {
    const parseResult =
        this._htmlParser.parse(source, url, parseExpansionForms, interpolationConfig);

    if (!this._translationBundle) {
      // Do not enable i18n when no translation bundle is provided
      return parseResult;
    }

    if (parseResult.errors.length) {
      return new ParseTreeResult(parseResult.rootNodes, parseResult.errors);
    }

    return mergeTranslations(
        parseResult.rootNodes, this._translationBundle, interpolationConfig, [], {});
  }
}

export function createSerializer(
    format?: string, version: I18nVersion = I18nVersion.Version0): Serializer {
  format = (format || 'xlf').toLowerCase();

  switch (format) {
    case 'xmb':
      return new Xmb(version);
    case 'xtb':
      return new Xtb(version);
    case 'xliff2':
    case 'xlf2':
      return new Xliff2(version);
    case 'xliff':
    case 'xlf':
    default:
      return new Xliff(version);
  }
}
