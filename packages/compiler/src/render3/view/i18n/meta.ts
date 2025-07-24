/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WhitespaceVisitor, visitAllWithSiblings} from '../../../ml_parser/html_whitespaces';
import {computeDecimalDigest, computeDigest, decimalDigest} from '../../../i18n/digest';
import * as i18n from '../../../i18n/i18n_ast';
import {createI18nMessageFactory, VisitNodeFn} from '../../../i18n/i18n_parser';
import * as html from '../../../ml_parser/ast';
import {
  DEFAULT_CONTAINER_BLOCKS,
  DEFAULT_INTERPOLATION_CONFIG,
  InterpolationConfig,
} from '../../../ml_parser/defaults';
import {ParseTreeResult} from '../../../ml_parser/parser';
import * as o from '../../../output/output_ast';
import {isTrustedTypesSink} from '../../../schema/trusted_types_sinks';

import {hasI18nAttrs, I18N_ATTR, I18N_ATTR_PREFIX, icuFromI18nMessage} from './util';
import {ParseError} from '../../../parse_util';

export type I18nMeta = {
  id?: string;
  customId?: string;
  legacyIds?: string[];
  description?: string;
  meaning?: string;
};

const setI18nRefs = (originalNodeMap: Map<html.Node, html.Node>): VisitNodeFn => {
  return (trimmedNode, i18nNode) => {
    // We need to set i18n properties on the original, untrimmed AST nodes. The i18n nodes needs to
    // use the trimmed content for message IDs to make messages more stable to whitespace changes.
    // But we don't want to actually trim the content, so we can't use the trimmed HTML AST for
    // general code gen. Instead we map the trimmed HTML AST back to the original AST and then
    // attach the i18n nodes so we get trimmed i18n nodes on the original (untrimmed) HTML AST.
    const originalNode = originalNodeMap.get(trimmedNode) ?? trimmedNode;

    if (originalNode instanceof html.NodeWithI18n) {
      if (i18nNode instanceof i18n.IcuPlaceholder && originalNode.i18n instanceof i18n.Message) {
        // This html node represents an ICU but this is a second processing pass, and the legacy id
        // was computed in the previous pass and stored in the `i18n` property as a message.
        // We are about to wipe out that property so capture the previous message to be reused when
        // generating the message for this ICU later. See `_generateI18nMessage()`.
        i18nNode.previousMessage = originalNode.i18n;
      }
      originalNode.i18n = i18nNode;
    }
    return i18nNode;
  };
};

/**
 * This visitor walks over HTML parse tree and converts information stored in
 * i18n-related attributes ("i18n" and "i18n-*") into i18n meta object that is
 * stored with other element's and attribute's information.
 */
export class I18nMetaVisitor implements html.Visitor {
  // whether visited nodes contain i18n information
  public hasI18nMeta: boolean = false;
  private _errors: ParseError[] = [];

  constructor(
    private interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
    private keepI18nAttrs = false,
    private enableI18nLegacyMessageIdFormat = false,
    private containerBlocks: Set<string> = DEFAULT_CONTAINER_BLOCKS,
    private readonly preserveSignificantWhitespace: boolean = true,

    // When dropping significant whitespace we need to retain empty tokens or
    // else we won't be able to reuse source spans because empty tokens would be
    // removed and cause a mismatch. Unfortunately this still needs to be
    // configurable and sometimes needs to be set independently in order to make
    // sure the number of nodes don't change between parses, even when
    // `preserveSignificantWhitespace` changes.
    private readonly retainEmptyTokens: boolean = !preserveSignificantWhitespace,
  ) {}

  private _generateI18nMessage(
    nodes: html.Node[],
    meta: string | i18n.I18nMeta = '',
    visitNodeFn?: VisitNodeFn,
  ): i18n.Message {
    const {meaning, description, customId} = this._parseMetadata(meta);
    const createI18nMessage = createI18nMessageFactory(
      this.interpolationConfig,
      this.containerBlocks,
      this.retainEmptyTokens,
      /* preserveExpressionWhitespace */ this.preserveSignificantWhitespace,
    );
    const message = createI18nMessage(nodes, meaning, description, customId, visitNodeFn);
    this._setMessageId(message, meta);
    this._setLegacyIds(message, meta);
    return message;
  }

  visitAllWithErrors(nodes: html.Node[]): ParseTreeResult {
    const result = nodes.map((node) => node.visit(this, null));
    return new ParseTreeResult(result, this._errors);
  }

  visitElement(element: html.Element): any {
    this._visitElementLike(element);
    return element;
  }

  visitComponent(component: html.Component, context: any) {
    this._visitElementLike(component);
    return component;
  }

  visitExpansion(expansion: html.Expansion, currentMessage: i18n.Message | null): any {
    let message;
    const meta = expansion.i18n;
    this.hasI18nMeta = true;
    if (meta instanceof i18n.IcuPlaceholder) {
      // set ICU placeholder name (e.g. "ICU_1"),
      // generated while processing root element contents,
      // so we can reference it when we output translation
      const name = meta.name;
      message = this._generateI18nMessage([expansion], meta);
      const icu = icuFromI18nMessage(message);
      icu.name = name;
      if (currentMessage !== null) {
        // Also update the placeholderToMessage map with this new message
        currentMessage.placeholderToMessage[name] = message;
      }
    } else {
      // ICU is a top level message, try to use metadata from container element if provided via
      // `context` argument. Note: context may not be available for standalone ICUs (without
      // wrapping element), so fallback to ICU metadata in this case.
      message = this._generateI18nMessage([expansion], currentMessage || meta);
    }
    expansion.i18n = message;
    return expansion;
  }

  visitText(text: html.Text): any {
    return text;
  }
  visitAttribute(attribute: html.Attribute): any {
    return attribute;
  }
  visitComment(comment: html.Comment): any {
    return comment;
  }
  visitExpansionCase(expansionCase: html.ExpansionCase): any {
    return expansionCase;
  }

  visitBlock(block: html.Block, context: any) {
    html.visitAll(this, block.children, context);
    return block;
  }

  visitBlockParameter(parameter: html.BlockParameter, context: any) {
    return parameter;
  }

  visitLetDeclaration(decl: html.LetDeclaration, context: any) {
    return decl;
  }

  visitDirective(directive: html.Directive, context: any) {
    return directive;
  }

  private _visitElementLike(node: html.Element | html.Component): void {
    let message: i18n.Message | undefined = undefined;

    if (hasI18nAttrs(node)) {
      this.hasI18nMeta = true;
      const attrs: html.Attribute[] = [];
      const attrsMeta: {[key: string]: string} = {};

      for (const attr of node.attrs) {
        if (attr.name === I18N_ATTR) {
          // root 'i18n' node attribute
          const i18n = node.i18n || attr.value;

          // Generate a new AST with whitespace trimmed, but also generate a map
          // to correlate each new node to its original so we can apply i18n
          // information to the original node based on the trimmed content.
          //
          // `WhitespaceVisitor` removes *insignificant* whitespace as well as
          // significant whitespace. Enabling this visitor should be conditional
          // on `preserveWhitespace` rather than `preserveSignificantWhitespace`,
          // however this would be a breaking change for existing behavior where
          // `preserveWhitespace` was not respected correctly when generating
          // message IDs. This is really a bug but one we need to keep to maintain
          // backwards compatibility.
          const originalNodeMap = new Map<html.Node, html.Node>();
          const trimmedNodes = this.preserveSignificantWhitespace
            ? node.children
            : visitAllWithSiblings(
                new WhitespaceVisitor(false /* preserveSignificantWhitespace */, originalNodeMap),
                node.children,
              );
          message = this._generateI18nMessage(trimmedNodes, i18n, setI18nRefs(originalNodeMap));
          if (message.nodes.length === 0) {
            // Ignore the message if it is empty.
            message = undefined;
          }
          // Store the message on the element
          node.i18n = message;
        } else if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
          // 'i18n-*' attributes
          const name = attr.name.slice(I18N_ATTR_PREFIX.length);
          let isTrustedType: boolean;
          if (node instanceof html.Component) {
            isTrustedType = node.tagName === null ? false : isTrustedTypesSink(node.tagName, name);
          } else {
            isTrustedType = isTrustedTypesSink(node.name, name);
          }

          if (isTrustedType) {
            this._reportError(
              attr,
              `Translating attribute '${name}' is disallowed for security reasons.`,
            );
          } else {
            attrsMeta[name] = attr.value;
          }
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
        node.attrs = attrs;
      }
    }
    html.visitAll(this, node.children, message);
  }

  /**
   * Parse the general form `meta` passed into extract the explicit metadata needed to create a
   * `Message`.
   *
   * There are three possibilities for the `meta` variable
   * 1) a string from an `i18n` template attribute: parse it to extract the metadata values.
   * 2) a `Message` from a previous processing pass: reuse the metadata values in the message.
   * 4) other: ignore this and just process the message metadata as normal
   *
   * @param meta the bucket that holds information about the message
   * @returns the parsed metadata.
   */
  private _parseMetadata(meta: string | i18n.I18nMeta): I18nMeta {
    return typeof meta === 'string'
      ? parseI18nMeta(meta)
      : meta instanceof i18n.Message
        ? meta
        : {};
  }

  /**
   * Generate (or restore) message id if not specified already.
   */
  private _setMessageId(message: i18n.Message, meta: string | i18n.I18nMeta): void {
    if (!message.id) {
      message.id = (meta instanceof i18n.Message && meta.id) || decimalDigest(message);
    }
  }

  /**
   * Update the `message` with a `legacyId` if necessary.
   *
   * @param message the message whose legacy id should be set
   * @param meta information about the message being processed
   */
  private _setLegacyIds(message: i18n.Message, meta: string | i18n.I18nMeta): void {
    if (this.enableI18nLegacyMessageIdFormat) {
      message.legacyIds = [computeDigest(message), computeDecimalDigest(message)];
    } else if (typeof meta !== 'string') {
      // This occurs if we are doing the 2nd pass after whitespace removal (see `parseTemplate()` in
      // `packages/compiler/src/render3/view/template.ts`).
      // In that case we want to reuse the legacy message generated in the 1st pass (see
      // `setI18nRefs()`).
      const previousMessage =
        meta instanceof i18n.Message
          ? meta
          : meta instanceof i18n.IcuPlaceholder
            ? meta.previousMessage
            : undefined;
      message.legacyIds = previousMessage ? previousMessage.legacyIds : [];
    }
  }

  private _reportError(node: html.Node, msg: string): void {
    this._errors.push(new ParseError(node.sourceSpan, msg));
  }
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
export function parseI18nMeta(meta: string = ''): I18nMeta {
  let customId: string | undefined;
  let meaning: string | undefined;
  let description: string | undefined;

  meta = meta.trim();
  if (meta) {
    const idIndex = meta.indexOf(I18N_ID_SEPARATOR);
    const descIndex = meta.indexOf(I18N_MEANING_SEPARATOR);
    let meaningAndDesc: string;
    [meaningAndDesc, customId] =
      idIndex > -1 ? [meta.slice(0, idIndex), meta.slice(idIndex + 2)] : [meta, ''];
    [meaning, description] =
      descIndex > -1
        ? [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)]
        : ['', meaningAndDesc];
  }

  return {customId, meaning, description};
}

// Converts i18n meta information for a message (id, description, meaning)
// to a JsDoc statement formatted as expected by the Closure compiler.
export function i18nMetaToJSDoc(meta: I18nMeta): o.JSDocComment {
  const tags: o.JSDocTag[] = [];
  if (meta.description) {
    tags.push({tagName: o.JSDocTagName.Desc, text: meta.description});
  } else {
    // Suppress the JSCompiler warning that a `@desc` was not given for this message.
    tags.push({tagName: o.JSDocTagName.Suppress, text: '{msgDescriptions}'});
  }
  if (meta.meaning) {
    tags.push({tagName: o.JSDocTagName.Meaning, text: meta.meaning});
  }
  return o.jsDocComment(tags);
}
