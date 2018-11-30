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
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../../../ml_parser/interpolation_config';
import {ParseTreeResult} from '../../../ml_parser/parser';

import {I18N_ATTR, I18N_ATTR_PREFIX, I18nMeta, hasI18nAttrs, icuFromI18nMessage, metaFromI18nMessage, parseI18nMeta} from './util';

function setI18nRefs(html: html.Node & {i18n: i18n.AST}, i18n: i18n.Node) {
  html.i18n = i18n;
}

/**
 * This visitor walks over HTML parse tree and converts information stored in
 * i18n-related attributes ("i18n" and "i18n-*") into i18n meta object that is
 * stored with other element's and attribute's information.
 */
export class I18nMetaVisitor implements html.Visitor {
  private _createI18nMessage: any;

  constructor(
      private interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
      private keepI18nAttrs: boolean = false) {
    // i18n message generation factory
    this._createI18nMessage = createI18nMessageFactory(interpolationConfig);
  }

  private _generateI18nMessage(
      nodes: html.Node[], meta: string|i18n.AST = '',
      visitNodeFn?: (html: html.Node, i18n: i18n.Node) => void): i18n.Message {
    const parsed: I18nMeta =
        typeof meta === 'string' ? parseI18nMeta(meta) : metaFromI18nMessage(meta as i18n.Message);
    const message = this._createI18nMessage(
        nodes, parsed.meaning || '', parsed.description || '', parsed.id || '', visitNodeFn);
    if (!message.id) {
      // generate (or restore) message id if not specified in template
      message.id = typeof meta !== 'string' && (meta as i18n.Message).id || decimalDigest(message);
    }
    return message;
  }

  visitElement(element: html.Element, context: any): any {
    if (hasI18nAttrs(element)) {
      const attrs: html.Attribute[] = [];
      const attrsMeta: {[key: string]: string} = {};

      for (const attr of element.attrs) {
        if (attr.name === I18N_ATTR) {
          // root 'i18n' node attribute
          const i18n = element.i18n || attr.value;
          const message = this._generateI18nMessage(element.children, i18n, setI18nRefs);
          // do not assign empty i18n meta
          if (message.nodes.length) {
            element.i18n = message;
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
          // do not create translation for empty attributes
          if (meta !== undefined && attr.value) {
            attr.i18n = this._generateI18nMessage([attr], attr.i18n || meta);
          }
        }
      }

      if (!this.keepI18nAttrs) {
        // update element's attributes,
        // keeping only non-i18n related ones
        element.attrs = attrs;
      }
    }
    html.visitAll(this, element.children);
    return element;
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    let message;
    const meta = expansion.i18n;
    if (meta instanceof i18n.IcuPlaceholder) {
      // set ICU placeholder name (e.g. "ICU_1"),
      // generated while processing root element contents,
      // so we can reference it when we output translation
      const name = meta.name;
      message = this._generateI18nMessage([expansion], meta);
      const icu = icuFromI18nMessage(message);
      icu.name = name;
    } else {
      // when ICU is a root level translation
      message = this._generateI18nMessage([expansion], meta);
    }
    expansion.i18n = message;
    return expansion;
  }

  visitText(text: html.Text, context: any): any { return text; }
  visitAttribute(attribute: html.Attribute, context: any): any { return attribute; }
  visitComment(comment: html.Comment, context: any): any { return comment; }
  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any { return expansionCase; }
}

export function processI18nMeta(
    htmlAstWithErrors: ParseTreeResult,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ParseTreeResult {
  return new ParseTreeResult(
      html.visitAll(
          new I18nMetaVisitor(interpolationConfig, /* keepI18nAttrs */ false),
          htmlAstWithErrors.rootNodes),
      htmlAstWithErrors.errors);
}