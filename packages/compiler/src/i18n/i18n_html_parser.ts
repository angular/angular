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
import {sha1Digest} from './digest';
import {mergeTranslations} from './extractor_merger';
import {createSerializer} from './serializers/factory';
import {TranslationBundle} from './translation_bundle';

export class I18NHtmlParser implements HtmlParser {
  // @override
  getTagDefinition: any;

  private _translationBundle: TranslationBundle;

  constructor(
      private _htmlParser: HtmlParser, version: I18nVersion, translations?: string,
      translationsFormat?: string,
      missingTranslation: MissingTranslationStrategy = MissingTranslationStrategy.Warning,
      console?: Console) {
    if (translations) {
      if (!translationsFormat) {
        throw new Error('The format of the translations should be provided');
      }
      const serializer = createSerializer(translationsFormat, version);
      this._translationBundle =
          TranslationBundle.load(translations, 'i18n', serializer, missingTranslation, console);
    } else {
      this._translationBundle =
          new TranslationBundle({}, null, sha1Digest, undefined, missingTranslation, console);
    }
  }

  parse(
      source: string, url: string, parseExpansionForms: boolean = false,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ParseTreeResult {
    const parseResult =
        this._htmlParser.parse(source, url, parseExpansionForms, interpolationConfig);

    if (parseResult.errors.length) {
      return new ParseTreeResult(parseResult.rootNodes, parseResult.errors);
    }

    return mergeTranslations(
        parseResult.rootNodes, this._translationBundle, interpolationConfig, [], {});
  }
}
