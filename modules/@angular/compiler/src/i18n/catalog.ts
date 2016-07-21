/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HtmlParser} from '../html_parser/html_parser';
import {InterpolationConfig} from '../html_parser/interpolation_config';

import * as i18nAst from './i18n_ast';
import {extractI18nMessages} from './i18n_parser';
import {Serializer} from './serializers/serializer';

export class Catalog {
  private _messageMap: {[k: string]: i18nAst.Message} = {};

  constructor(
      private _htmlParser: HtmlParser, private _implicitTags: string[],
      private _implicitAttrs: {[k: string]: string[]}) {}

  public updateFromTemplate(html: string, url: string, interpolationConfig: InterpolationConfig):
      void {
    const htmlParserResult = this._htmlParser.parse(html, url, true, interpolationConfig);

    if (htmlParserResult.errors.length) {
      throw new Error();
    }

    const messages = extractI18nMessages(
        htmlParserResult.rootNodes, interpolationConfig, this._implicitTags, this._implicitAttrs);

    messages.forEach((message) => {
      const id = strHash(serializeAst(message.nodes).join('') + `[${message.meaning}]`);
      this._messageMap[id] = message;
    });
  }

  public load(content: string, serializer: Serializer): void {
    const nodeMap = serializer.load(content);
    this._messageMap = {};

    Object.getOwnPropertyNames(nodeMap).forEach(
        (id) => { this._messageMap[id] = new i18nAst.Message(nodeMap[id], '', ''); });
  }

  public write(serializer: Serializer): string { return serializer.write(this._messageMap); }
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
class _SerializerVisitor implements i18nAst.Visitor {
  visitText(text: i18nAst.Text, context: any): any { return text.value; }

  visitContainer(container: i18nAst.Container, context: any): any {
    return `[${container.children.map(child => child.visit(this)).join(', ')}]`;
  }

  visitIcu(icu: i18nAst.Icu, context: any): any {
    let strCases = Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expression}, ${icu.type}, ${strCases.join(', ')}}`;
  }

  visitTagPlaceholder(ph: i18nAst.TagPlaceholder, context: any): any {
    return ph.isVoid ?
        `<ph tag name="${ph.startName}"/>` :
        `<ph tag name="${ph.startName}">${ph.children.map(child => child.visit(this)).join(', ')}</ph name="${ph.closeName}">`;
  }

  visitPlaceholder(ph: i18nAst.Placeholder, context: any): any {
    return `<ph name="${ph.name}">${ph.value}</ph>`;
  }

  visitIcuPlaceholder(ph: i18nAst.IcuPlaceholder, context?: any): any {
    return `<ph icu name="${ph.name}">${ph.value.visit(this)}</ph>`;
  }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeAst(ast: i18nAst.Node[]): string[] {
  return ast.map(a => a.visit(serializerVisitor, null));
}
