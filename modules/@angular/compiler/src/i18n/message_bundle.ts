/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HtmlParser} from '../ml_parser/html_parser';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {ParseError} from '../parse_util';

import {digestMessage} from './digest';
import {extractMessages} from './extractor_merger';
import {Message} from './i18n_ast';
import {Serializer} from './serializers/serializer';

/**
 * A container for message extracted from the templates.
 */
export class MessageBundle {
  private _messageMap: {[id: string]: Message} = {};

  constructor(
      private _htmlParser: HtmlParser, private _implicitTags: string[],
      private _implicitAttrs: {[k: string]: string[]}) {}

  updateFromTemplate(html: string, url: string, interpolationConfig: InterpolationConfig):
      ParseError[] {
    const htmlParserResult = this._htmlParser.parse(html, url, true, interpolationConfig);

    if (htmlParserResult.errors.length) {
      return htmlParserResult.errors;
    }

    const i18nParserResult = extractMessages(
        htmlParserResult.rootNodes, interpolationConfig, this._implicitTags, this._implicitAttrs);

    if (i18nParserResult.errors.length) {
      return i18nParserResult.errors;
    }

    i18nParserResult.messages.forEach(
        (message) => { this._messageMap[digestMessage(message)] = message; });
  }

  getMessageMap(): {[id: string]: Message} { return this._messageMap; }

  write(serializer: Serializer): string { return serializer.write(this._messageMap); }
}
