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
import * as o from '../../../output/output_ast';

import {I18N_ATTR, I18N_ATTR_PREFIX, hasI18nAttrs, icuFromI18nMessage} from './util';

export type I18nMeta = {
  id?: string,
  customId?: string,
  description?: string,
  meaning?: string
};

function setI18nRefs(html: html.Node & {i18n?: i18n.AST}, i18n: i18n.Node) {
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
        nodes, parsed.meaning || '', parsed.description || '', parsed.customId || '', visitNodeFn);
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

export function metaFromI18nMessage(message: i18n.Message, id: string | null = null): I18nMeta {
  return {
    id: typeof id === 'string' ? id : message.id || '',
    customId: message.customId,
    meaning: message.meaning || '',
    description: message.description || ''
  };
}

/** I18n separators for metadata **/
const I18N_MEANING_SEPARATOR = '|';
const I18N_ID_SEPARATOR = '@@';

/**
 * Parses i18n metas like:
 *  - "@@id",
 *  - "description[@@id]",
 *  - "meaning|description[@@id]"
 * and returns an object with parsed output.
 *
 * @param meta String that represents i18n meta
 * @returns Object with id, meaning and description fields
 */
export function parseI18nMeta(meta?: string): I18nMeta {
  let customId: string|undefined;
  let meaning: string|undefined;
  let description: string|undefined;

  if (meta) {
    const idIndex = meta.indexOf(I18N_ID_SEPARATOR);
    const descIndex = meta.indexOf(I18N_MEANING_SEPARATOR);
    let meaningAndDesc: string;
    [meaningAndDesc, customId] =
        (idIndex > -1) ? [meta.slice(0, idIndex), meta.slice(idIndex + 2)] : [meta, ''];
    [meaning, description] = (descIndex > -1) ?
        [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
        ['', meaningAndDesc];
  }

  return {customId, meaning, description};
}

/**
 * Serialize the given `meta` and `messagePart` a string that can be used in a `$localize`
 * tagged string. The format of the metadata is the same as that parsed by `parseI18nMeta()`.
 *
 * @param meta The metadata to serialize
 * @param messagePart The first part of the tagged string
 */
export function serializeI18nHead(meta: I18nMeta, messagePart: string): string {
  let metaBlock = meta.description || '';
  if (meta.meaning) {
    metaBlock = `${meta.meaning}|${metaBlock}`;
  }
  if (meta.customId) {
    metaBlock = `${metaBlock}@@${meta.customId}`;
  }
  if (metaBlock === '') {
    // There is no metaBlock, so we must ensure that any starting colon is escaped.
    return escapeStartingColon(messagePart);
  } else {
    return `:${escapeColons(metaBlock)}:${messagePart}`;
  }
}

/**
 * Serialize the given `placeholderName` and `messagePart` into strings that can be used in a
 * `$localize` tagged string.
 *
 * @param placeholderName The placeholder name to serialize
 * @param messagePart The following message string after this placeholder
 */
export function serializeI18nTemplatePart(placeholderName: string, messagePart: string): string {
  if (placeholderName === '') {
    // There is no placeholder name block, so we must ensure that any starting colon is escaped.
    return escapeStartingColon(messagePart);
  } else {
    return `:${placeholderName}:${messagePart}`;
  }
}

// Converts i18n meta information for a message (id, description, meaning)
// to a JsDoc statement formatted as expected by the Closure compiler.
export function i18nMetaToDocStmt(meta: I18nMeta): o.JSDocCommentStmt|null {
  const tags: o.JSDocTag[] = [];
  if (meta.description) {
    tags.push({tagName: o.JSDocTagName.Desc, text: meta.description});
  }
  if (meta.meaning) {
    tags.push({tagName: o.JSDocTagName.Meaning, text: meta.meaning});
  }
  return tags.length == 0 ? null : new o.JSDocCommentStmt(tags);
}

export function escapeStartingColon(str: string): string {
  return str.replace(/^:/, '\\:');
}

export function escapeColons(str: string): string {
  return str.replace(/:/g, '\\:');
}