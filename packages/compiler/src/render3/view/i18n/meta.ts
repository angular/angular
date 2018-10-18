/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {decimalDigest} from '../../../i18n/digest';
import * as i18n from '../../../i18n/i18n_ast';
import {createI18nMessageFactory} from '../../../i18n/i18n_parser';
import * as html from '../../../ml_parser/ast';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../ml_parser/interpolation_config';
import {ParseTreeResult} from '../../../ml_parser/parser';

import {I18N_ATTR, I18N_ATTR_PREFIX, hasI18nAttrs, parseI18nMeta} from './util';


export type I18nMeta = {
  id?: string,
  description?: string,
  meaning?: string,
  ast?: any,
};

/**
 * This visitor walks over HTML parse tree and converts information stored in
 * i18n-related attributes ("i18n" and "i18n-*") into i18n meta object that is
 * stored with other element's and atrribute's information.
 */
export class I18nMetaVisitor implements html.Visitor {
  // i18n message generation factory
  private _createI18nMessage = createI18nMessageFactory(DEFAULT_INTERPOLATION_CONFIG);

  constructor(private config: {keepI18nAttrs: boolean}) {}

  private _setI18nRefs(html: any, i18n: i18n.Node) {
    html.i18n = html.i18n || {};
    html.i18n.ast = i18n;
  }

  private _generateI18nMeta(nodes: html.Node[], meta: string|I18nMeta = '', visitNodeFn?: any) {
    const parsed = typeof meta !== 'string' ? meta : parseI18nMeta(meta);
    parsed.ast = this._createI18nMessage(
        nodes, parsed.meaning || '', parsed.description || '', '', visitNodeFn);
    if (!parsed.id) {
      // generate (or restore) message id if not specified in template
      parsed.id = typeof meta !== 'string' && meta.id || decimalDigest(parsed.ast);
    }
    return parsed;
  }

  visitElement(element: html.Element, context: any): any {
    if (hasI18nAttrs(element)) {
      const attrs: html.Attribute[] = [];
      const attrsMeta: {[key: string]: string} = {};

      for (const attr of element.attrs) {
        if (attr.name === I18N_ATTR) {
          // root 'i18n' node attribute
          const i18n = element.i18n || attr.value;
          const meta = this._generateI18nMeta(element.children, i18n, this._setI18nRefs);
          // do not assign empty i18n meta
          if (meta.ast.nodes.length) {
            element.i18n = meta;
          }

        } else if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
          // 'i18n-*' attributes
          const key = attr.name.slice(I18N_ATTR_PREFIX.length);
          attrsMeta[key] = attr.value;

        } else {
          // non-i18n attributes
          attrs.push(attr);
        }
      }

      // set i18n meta for attributes
      if (Object.keys(attrsMeta).length) {
        for (const attr of attrs) {
          const meta = attrsMeta[attr.name];
          if (meta !== undefined && attr.value) {
            attr.i18n = this._generateI18nMeta([attr], attr.i18n || meta);
          }
        }
      }

      if (!this.config.keepI18nAttrs) {
        // update element's attributes,
        // keeping only non-i18n related ones
        element.attrs = attrs;
      }
    }
    html.visitAll(this, element.children);
    return element;
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    const i18n = expansion.i18n !;
    const name = i18n.ast.name;
    const meta = this._generateI18nMeta([expansion], i18n);
    // restore ICU placeholder name (e.g. "ICU_1"),
    // generated while processing root element contents
    meta.ast.name = name;
    expansion.i18n = meta;
    return expansion;
  }

  visitText(text: html.Text, context: any): any { return text; }
  visitAttribute(attribute: html.Attribute, context: any): any { return attribute; }
  visitComment(comment: html.Comment, context: any): any { return comment; }
  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any { return expansionCase; }
}

export function processI18nMeta(htmlAstWithErrors: ParseTreeResult): ParseTreeResult {
  return new ParseTreeResult(
      html.visitAll(new I18nMetaVisitor({keepI18nAttrs: false}), htmlAstWithErrors.rootNodes),
      htmlAstWithErrors.errors);
}