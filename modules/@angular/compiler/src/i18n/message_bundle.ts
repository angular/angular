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

import * as i18n from './i18n_ast';
import {extractI18nMessages} from './i18n_parser';
import {Serializer} from './serializers/serializer';


/**
 * A container for message extracted from the templates.
 */
export class MessageBundle {
  private _messageMap: {[id: string]: i18n.Message} = {};

  constructor(
      private _htmlParser: HtmlParser, private _implicitTags: string[],
      private _implicitAttrs: {[k: string]: string[]}) {}

  updateFromTemplate(html: string, url: string, interpolationConfig: InterpolationConfig):
      ParseError[] {
    const htmlParserResult = this._htmlParser.parse(html, url, true, interpolationConfig);

    if (htmlParserResult.errors.length) {
      return htmlParserResult.errors;
    }

    const messages = extractI18nMessages(
        htmlParserResult.rootNodes, interpolationConfig, this._implicitTags, this._implicitAttrs);

    messages.forEach((message) => {
      this._messageMap[messageDigest(message.nodes, message.meaning)] = message;
    });
  }

  write(serializer: Serializer): string { return serializer.write(this._messageMap); }
}

export function messageDigest(nodes: i18n.Node[], meaning: string): string {
  return strHash(serializeNodes(nodes).join('') + `[${meaning}]`);
}

/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32 (exclusive).
 *
 * Based on goog.string.hashCode from the Google Closure library
 * https://github.com/google/closure-library/
 *
 * @internal
 */
// TODO(vicb): better algo (less collisions) ?
export function strHash(str: string): string {
  let result: number = 0;
  for (var i = 0; i < str.length; ++i) {
    // Normalize to 4 byte range, 0 ... 2^32.
    result = (31 * result + str.charCodeAt(i)) >>> 0;
  }
  return result.toString(16);
}

/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * The visitor is also used in the i18n parser tests
 *
 * @internal
 */
class _SerializerVisitor implements i18n.Visitor {
  visitText(text: i18n.Text, context: any): any { return text.value; }

  visitContainer(container: i18n.Container, context: any): any {
    return `[${container.children.map(child => child.visit(this)).join(', ')}]`;
  }

  visitIcu(icu: i18n.Icu, context: any): any {
    let strCases = Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expression}, ${icu.type}, ${strCases.join(', ')}}`;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: any): any {
    return ph.isVoid ?
        `<ph tag name="${ph.startName}"/>` :
        `<ph tag name="${ph.startName}">${ph.children.map(child => child.visit(this)).join(', ')}</ph name="${ph.closeName}">`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context: any): any {
    return `<ph name="${ph.name}">${ph.value}</ph>`;
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return `<ph icu name="${ph.name}">${ph.value.visit(this)}</ph>`;
  }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeNodes(nodes: i18n.Node[]): string[] {
  return nodes.map(a => a.visit(serializerVisitor, null));
}
