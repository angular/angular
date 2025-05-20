/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../ml_parser/ast';
import {DEFAULT_CONTAINER_BLOCKS, InterpolationConfig} from '../ml_parser/defaults';
import {ParseTreeResult} from '../ml_parser/parser';
import {TokenType} from '../ml_parser/tokens';

import * as i18n from './i18n_ast';
import {createI18nMessageFactory, I18nMessageFactory} from './i18n_parser';
import {I18nError} from './parse_util';
import {TranslationBundle} from './translation_bundle';

const _I18N_ATTR = 'i18n';
const _I18N_ATTR_PREFIX = 'i18n-';
const _I18N_COMMENT_PREFIX_REGEXP = /^i18n:?/;
const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';
let i18nCommentsWarned = false;

/**
 * Extract translatable messages from an html AST
 */
export function extractMessages(
  nodes: html.Node[],
  interpolationConfig: InterpolationConfig,
  implicitTags: string[],
  implicitAttrs: {[k: string]: string[]},
  preserveSignificantWhitespace: boolean,
): ExtractionResult {
  const visitor = new _Visitor(implicitTags, implicitAttrs, preserveSignificantWhitespace);
  return visitor.extract(nodes, interpolationConfig);
}

export function mergeTranslations(
  nodes: html.Node[],
  translations: TranslationBundle,
  interpolationConfig: InterpolationConfig,
  implicitTags: string[],
  implicitAttrs: {[k: string]: string[]},
): ParseTreeResult {
  const visitor = new _Visitor(implicitTags, implicitAttrs);
  return visitor.merge(nodes, translations, interpolationConfig);
}

export class ExtractionResult {
  constructor(
    public messages: i18n.Message[],
    public errors: I18nError[],
  ) {}
}

enum _VisitorMode {
  Extract,
  Merge,
}

/**
 * This Visitor is used:
 * 1. to extract all the translatable strings from an html AST (see `extract()`),
 * 2. to replace the translatable strings with the actual translations (see `merge()`)
 *
 * @internal
 */
class _Visitor implements html.Visitor {
  // Using non-null assertions because all variables are (re)set in init()

  private _depth!: number;

  // <el i18n>...</el>
  private _inI18nNode!: boolean;
  private _inImplicitNode!: boolean;

  // <!--i18n-->...<!--/i18n-->
  private _inI18nBlock!: boolean;
  private _blockMeaningAndDesc!: string;
  private _blockChildren!: html.Node[];
  private _blockStartDepth!: number;

  // {<icu message>}
  private _inIcu!: boolean;

  // set to void 0 when not in a section
  private _msgCountAtSectionStart: number | undefined;
  private _errors!: I18nError[];
  private _mode!: _VisitorMode;

  // _VisitorMode.Extract only
  private _messages!: i18n.Message[];

  // _VisitorMode.Merge only
  private _translations!: TranslationBundle;
  private _createI18nMessage!: I18nMessageFactory;

  constructor(
    private _implicitTags: string[],
    private _implicitAttrs: {[k: string]: string[]},
    private readonly _preserveSignificantWhitespace: boolean = true,
  ) {}

  /**
   * Extracts the messages from the tree
   */
  extract(nodes: html.Node[], interpolationConfig: InterpolationConfig): ExtractionResult {
    this._init(_VisitorMode.Extract, interpolationConfig);

    nodes.forEach((node) => node.visit(this, null));

    if (this._inI18nBlock) {
      this._reportError(nodes[nodes.length - 1], 'Unclosed block');
    }

    return new ExtractionResult(this._messages, this._errors);
  }

  /**
   * Returns a tree where all translatable nodes are translated
   */
  merge(
    nodes: html.Node[],
    translations: TranslationBundle,
    interpolationConfig: InterpolationConfig,
  ): ParseTreeResult {
    this._init(_VisitorMode.Merge, interpolationConfig);
    this._translations = translations;

    // Construct a single fake root element
    const wrapper = new html.Element(
      'wrapper',
      [],
      [],
      nodes,
      false,
      undefined!,
      undefined!,
      undefined,
    );

    const translatedNode = wrapper.visit(this, null);

    if (this._inI18nBlock) {
      this._reportError(nodes[nodes.length - 1], 'Unclosed block');
    }

    return new ParseTreeResult(translatedNode.children, this._errors);
  }

  visitExpansionCase(icuCase: html.ExpansionCase, context: any): any {
    // Parse cases for translatable html attributes
    const expression = html.visitAll(this, icuCase.expression, context);

    if (this._mode === _VisitorMode.Merge) {
      return new html.ExpansionCase(
        icuCase.value,
        expression,
        icuCase.sourceSpan,
        icuCase.valueSourceSpan,
        icuCase.expSourceSpan,
      );
    }
  }

  visitExpansion(icu: html.Expansion, context: any): html.Expansion {
    this._mayBeAddBlockChildren(icu);

    const wasInIcu = this._inIcu;

    if (!this._inIcu) {
      // nested ICU messages should not be extracted but top-level translated as a whole
      if (this._isInTranslatableSection) {
        this._addMessage([icu]);
      }
      this._inIcu = true;
    }

    const cases = html.visitAll(this, icu.cases, context);

    if (this._mode === _VisitorMode.Merge) {
      icu = new html.Expansion(
        icu.switchValue,
        icu.type,
        cases,
        icu.sourceSpan,
        icu.switchValueSourceSpan,
      );
    }

    this._inIcu = wasInIcu;

    return icu;
  }

  visitComment(comment: html.Comment, context: any): any {
    const isOpening = _isOpeningComment(comment);

    if (isOpening && this._isInTranslatableSection) {
      this._reportError(comment, 'Could not start a block inside a translatable section');
      return;
    }

    const isClosing = _isClosingComment(comment);

    if (isClosing && !this._inI18nBlock) {
      this._reportError(comment, 'Trying to close an unopened block');
      return;
    }

    if (!this._inI18nNode && !this._inIcu) {
      if (!this._inI18nBlock) {
        if (isOpening) {
          // deprecated from v5 you should use <ng-container i18n> instead of i18n comments
          if (!i18nCommentsWarned && <any>console && <any>console.warn) {
            i18nCommentsWarned = true;
            const details = comment.sourceSpan.details ? `, ${comment.sourceSpan.details}` : '';
            // TODO(ocombe): use a log service once there is a public one available
            console.warn(
              `I18n comments are deprecated, use an <ng-container> element instead (${comment.sourceSpan.start}${details})`,
            );
          }
          this._inI18nBlock = true;
          this._blockStartDepth = this._depth;
          this._blockChildren = [];
          this._blockMeaningAndDesc = comment
            .value!.replace(_I18N_COMMENT_PREFIX_REGEXP, '')
            .trim();
          this._openTranslatableSection(comment);
        }
      } else {
        if (isClosing) {
          if (this._depth == this._blockStartDepth) {
            this._closeTranslatableSection(comment, this._blockChildren);
            this._inI18nBlock = false;
            const message = this._addMessage(this._blockChildren, this._blockMeaningAndDesc)!;
            // merge attributes in sections
            const nodes = this._translateMessage(comment, message);
            return html.visitAll(this, nodes);
          } else {
            this._reportError(comment, 'I18N blocks should not cross element boundaries');
            return;
          }
        }
      }
    }
  }

  visitText(text: html.Text, context: any): html.Text {
    if (this._isInTranslatableSection) {
      this._mayBeAddBlockChildren(text);
    }
    return text;
  }

  visitElement(el: html.Element, context: any): html.Element | null {
    return this._visitElementLike(el, context);
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    throw new Error('unreachable code');
  }

  visitBlock(block: html.Block, context: any) {
    html.visitAll(this, block.children, context);
  }

  visitBlockParameter(parameter: html.BlockParameter, context: any) {}

  visitLetDeclaration(decl: html.LetDeclaration, context: any) {}

  visitComponent(component: html.Component, context: any): html.Component | null {
    return this._visitElementLike(component, context);
  }

  visitDirective(directive: html.Directive, context: any) {
    throw new Error('unreachable code');
  }

  private _init(mode: _VisitorMode, interpolationConfig: InterpolationConfig): void {
    this._mode = mode;
    this._inI18nBlock = false;
    this._inI18nNode = false;
    this._depth = 0;
    this._inIcu = false;
    this._msgCountAtSectionStart = undefined;
    this._errors = [];
    this._messages = [];
    this._inImplicitNode = false;
    this._createI18nMessage = createI18nMessageFactory(
      interpolationConfig,
      DEFAULT_CONTAINER_BLOCKS,
      // When dropping significant whitespace we need to retain whitespace tokens or
      // else we won't be able to reuse source spans because empty tokens would be
      // removed and cause a mismatch.
      /* retainEmptyTokens */ !this._preserveSignificantWhitespace,
      /* preserveExpressionWhitespace */ this._preserveSignificantWhitespace,
    );
  }

  private _visitElementLike<T extends html.Element | html.Component>(
    node: T,
    context: any,
  ): T | null {
    this._mayBeAddBlockChildren(node);
    this._depth++;
    const wasInI18nNode = this._inI18nNode;
    const wasInImplicitNode = this._inImplicitNode;
    let childNodes: html.Node[] = [];
    let translatedChildNodes: html.Node[] = undefined!;

    // Extract:
    // - top level nodes with the (implicit) "i18n" attribute if not already in a section
    // - ICU messages
    const nodeName = node instanceof html.Component ? node.tagName : node.name;
    const i18nAttr = _getI18nAttr(node);
    const i18nMeta = i18nAttr ? i18nAttr.value : '';
    const isImplicit =
      this._implicitTags.some((tag) => nodeName === tag) &&
      !this._inIcu &&
      !this._isInTranslatableSection;
    const isTopLevelImplicit = !wasInImplicitNode && isImplicit;
    this._inImplicitNode = wasInImplicitNode || isImplicit;

    if (!this._isInTranslatableSection && !this._inIcu) {
      if (i18nAttr || isTopLevelImplicit) {
        this._inI18nNode = true;
        const message = this._addMessage(node.children, i18nMeta)!;
        translatedChildNodes = this._translateMessage(node, message);
      }

      if (this._mode == _VisitorMode.Extract) {
        const isTranslatable = i18nAttr || isTopLevelImplicit;
        if (isTranslatable) this._openTranslatableSection(node);
        html.visitAll(this, node.children);
        if (isTranslatable) this._closeTranslatableSection(node, node.children);
      }
    } else {
      if (i18nAttr || isTopLevelImplicit) {
        this._reportError(
          node,
          'Could not mark an element as translatable inside a translatable section',
        );
      }

      if (this._mode == _VisitorMode.Extract) {
        // Descend into child nodes for extraction
        html.visitAll(this, node.children);
      }
    }

    if (this._mode === _VisitorMode.Merge) {
      const visitNodes = translatedChildNodes || node.children;
      visitNodes.forEach((child) => {
        const visited = child.visit(this, context);
        if (visited && !this._isInTranslatableSection) {
          // Do not add the children from translatable sections (= i18n blocks here)
          // They will be added later in this loop when the block closes (i.e. on `<!-- /i18n -->`)
          childNodes = childNodes.concat(visited);
        }
      });
    }

    this._visitAttributesOf(node);

    this._depth--;
    this._inI18nNode = wasInI18nNode;
    this._inImplicitNode = wasInImplicitNode;

    if (this._mode === _VisitorMode.Merge) {
      if (node instanceof html.Element) {
        return new html.Element(
          node.name,
          this._translateAttributes(node),
          this._translateDirectives(node),
          childNodes,
          node.isSelfClosing,
          node.sourceSpan,
          node.startSourceSpan,
          node.endSourceSpan,
        ) as T;
      } else {
        return new html.Component(
          node.componentName,
          node.tagName,
          node.fullName,
          this._translateAttributes(node),
          this._translateDirectives(node),
          childNodes,
          node.isSelfClosing,
          node.sourceSpan,
          node.startSourceSpan,
          node.endSourceSpan,
        ) as T;
      }
    }
    return null;
  }

  // looks for translatable attributes
  private _visitAttributesOf(el: html.Element | html.Component): void {
    const explicitAttrNameToValue: {[k: string]: string} = {};
    const implicitAttrNames: string[] =
      this._implicitAttrs[el instanceof html.Component ? el.tagName || '' : el.name] || [];

    el.attrs
      .filter((attr) => attr instanceof html.Attribute && attr.name.startsWith(_I18N_ATTR_PREFIX))
      .forEach((attr) => {
        explicitAttrNameToValue[attr.name.slice(_I18N_ATTR_PREFIX.length)] = (
          attr as html.Attribute
        ).value;
      });

    el.attrs.forEach((attr) => {
      if (attr.name in explicitAttrNameToValue) {
        this._addMessage([attr], explicitAttrNameToValue[attr.name]);
      } else if (implicitAttrNames.some((name) => attr.name === name)) {
        this._addMessage([attr]);
      }
    });
  }

  // add a translatable message
  private _addMessage(ast: html.Node[], msgMeta?: string): i18n.Message | null {
    if (
      ast.length == 0 ||
      this._isEmptyAttributeValue(ast) ||
      this._isPlaceholderOnlyAttributeValue(ast) ||
      this._isPlaceholderOnlyMessage(ast)
    ) {
      // Do not create empty messages
      return null;
    }

    const {meaning, description, id} = _parseMessageMeta(msgMeta);
    const message = this._createI18nMessage(ast, meaning, description, id);
    this._messages.push(message);
    return message;
  }

  // Check for cases like `<div i18n-title title="">`.
  private _isEmptyAttributeValue(ast: html.Node[]): boolean {
    if (!isAttrNode(ast)) return false;
    const node = ast[0];

    return node.value.trim() === '';
  }

  // Check for cases like `<div i18n-title title="{{ name }}">`.
  private _isPlaceholderOnlyAttributeValue(ast: html.Node[]): boolean {
    if (!isAttrNode(ast)) return false;
    const tokens = ast[0].valueTokens ?? [];

    const interpolations = tokens.filter(
      (token) => token.type === TokenType.ATTR_VALUE_INTERPOLATION,
    );
    const plainText = tokens
      .filter((token) => token.type === TokenType.ATTR_VALUE_TEXT)
      // `AttributeValueTextToken` always has exactly one part per its type.
      .map((token) => token.parts[0].trim())
      .join('');

    // Check if there is a single interpolation and all text around it is empty.
    return interpolations.length === 1 && plainText === '';
  }

  // Check for cases like `<div i18n>{{ name }}</div>`.
  private _isPlaceholderOnlyMessage(ast: html.Node[]): boolean {
    if (!isTextNode(ast)) return false;
    const tokens = ast[0].tokens;

    const interpolations = tokens.filter((token) => token.type === TokenType.INTERPOLATION);
    const plainText = tokens
      .filter((token) => token.type === TokenType.TEXT)
      // `TextToken` always has exactly one part per its type.
      .map((token) => token.parts[0].trim())
      .join('');

    // Check if there is a single interpolation and all text around it is empty.
    return interpolations.length === 1 && plainText === '';
  }

  // Translates the given message given the `TranslationBundle`
  // This is used for translating elements / blocks - see `_translateAttributes` for attributes
  // no-op when called in extraction mode (returns [])
  private _translateMessage(el: html.Node, message: i18n.Message): html.Node[] {
    if (message && this._mode === _VisitorMode.Merge) {
      const nodes = this._translations.get(message);

      if (nodes) {
        return nodes;
      }

      this._reportError(
        el,
        `Translation unavailable for message id="${this._translations.digest(message)}"`,
      );
    }

    return [];
  }

  // translate the attributes of an element and remove i18n specific attributes
  private _translateAttributes(
    node: html.Element | html.Component | html.Directive,
  ): html.Attribute[] {
    const i18nParsedMessageMeta: {
      [name: string]: {meaning: string; description: string; id: string};
    } = {};
    const translatedAttributes: html.Attribute[] = [];

    node.attrs.forEach((attr) => {
      if (attr.name.startsWith(_I18N_ATTR_PREFIX)) {
        i18nParsedMessageMeta[attr.name.slice(_I18N_ATTR_PREFIX.length)] = _parseMessageMeta(
          attr.value,
        );
      }
    });

    node.attrs.forEach((attr) => {
      if (attr.name === _I18N_ATTR || attr.name.startsWith(_I18N_ATTR_PREFIX)) {
        // strip i18n specific attributes
        return;
      }

      if (attr.value && attr.value != '' && i18nParsedMessageMeta.hasOwnProperty(attr.name)) {
        const {meaning, description, id} = i18nParsedMessageMeta[attr.name];
        const message: i18n.Message = this._createI18nMessage([attr], meaning, description, id);
        const nodes = this._translations.get(message);
        if (nodes) {
          if (nodes.length == 0) {
            translatedAttributes.push(
              new html.Attribute(
                attr.name,
                '',
                attr.sourceSpan,
                undefined /* keySpan */,
                undefined /* valueSpan */,
                undefined /* valueTokens */,
                undefined /* i18n */,
              ),
            );
          } else if (nodes[0] instanceof html.Text) {
            const value = (nodes[0] as html.Text).value;
            translatedAttributes.push(
              new html.Attribute(
                attr.name,
                value,
                attr.sourceSpan,
                undefined /* keySpan */,
                undefined /* valueSpan */,
                undefined /* valueTokens */,
                undefined /* i18n */,
              ),
            );
          } else {
            this._reportError(
              node,
              `Unexpected translation for attribute "${attr.name}" (id="${
                id || this._translations.digest(message)
              }")`,
            );
          }
        } else {
          this._reportError(
            node,
            `Translation unavailable for attribute "${attr.name}" (id="${
              id || this._translations.digest(message)
            }")`,
          );
        }
      } else {
        translatedAttributes.push(attr);
      }
    });

    return translatedAttributes;
  }

  private _translateDirectives(node: html.Element | html.Component): html.Directive[] {
    return node.directives.map(
      (dir) =>
        new html.Directive(
          dir.name,
          this._translateAttributes(dir),
          dir.sourceSpan,
          dir.startSourceSpan,
          dir.endSourceSpan,
        ),
    );
  }

  /**
   * Add the node as a child of the block when:
   * - we are in a block,
   * - we are not inside a ICU message (those are handled separately),
   * - the node is a "direct child" of the block
   */
  private _mayBeAddBlockChildren(node: html.Node): void {
    if (this._inI18nBlock && !this._inIcu && this._depth == this._blockStartDepth) {
      this._blockChildren.push(node);
    }
  }

  /**
   * Marks the start of a section, see `_closeTranslatableSection`
   */
  private _openTranslatableSection(node: html.Node): void {
    if (this._isInTranslatableSection) {
      this._reportError(node, 'Unexpected section start');
    } else {
      this._msgCountAtSectionStart = this._messages.length;
    }
  }

  /**
   * A translatable section could be:
   * - the content of translatable element,
   * - nodes between `<!-- i18n -->` and `<!-- /i18n -->` comments
   */
  private get _isInTranslatableSection(): boolean {
    return this._msgCountAtSectionStart !== void 0;
  }

  /**
   * Terminates a section.
   *
   * If a section has only one significant children (comments not significant) then we should not
   * keep the message from this children:
   *
   * `<p i18n="meaning|description">{ICU message}</p>` would produce two messages:
   * - one for the <p> content with meaning and description,
   * - another one for the ICU message.
   *
   * In this case the last message is discarded as it contains less information (the AST is
   * otherwise identical).
   *
   * Note that we should still keep messages extracted from attributes inside the section (ie in the
   * ICU message here)
   */
  private _closeTranslatableSection(node: html.Node, directChildren: html.Node[]): void {
    if (!this._isInTranslatableSection) {
      this._reportError(node, 'Unexpected section end');
      return;
    }

    const startIndex = this._msgCountAtSectionStart;
    const significantChildren: number = directChildren.reduce(
      (count: number, node: html.Node): number => count + (node instanceof html.Comment ? 0 : 1),
      0,
    );

    if (significantChildren == 1) {
      for (let i = this._messages.length - 1; i >= startIndex!; i--) {
        const ast = this._messages[i].nodes;
        if (!(ast.length == 1 && ast[0] instanceof i18n.Text)) {
          this._messages.splice(i, 1);
          break;
        }
      }
    }

    this._msgCountAtSectionStart = undefined;
  }

  private _reportError(node: html.Node, msg: string): void {
    this._errors.push(new I18nError(node.sourceSpan, msg));
  }
}

function _isOpeningComment(n: html.Node): boolean {
  return !!(n instanceof html.Comment && n.value && n.value.startsWith('i18n'));
}

function _isClosingComment(n: html.Node): boolean {
  return !!(n instanceof html.Comment && n.value && n.value === '/i18n');
}

function _getI18nAttr(p: html.Element | html.Component): html.Attribute | null {
  return (
    (p.attrs.find((attr) => attr instanceof html.Attribute && attr.name === _I18N_ATTR) as
      | html.Attribute
      | undefined) || null
  );
}

function _parseMessageMeta(i18n?: string): {meaning: string; description: string; id: string} {
  if (!i18n) return {meaning: '', description: '', id: ''};

  const idIndex = i18n.indexOf(ID_SEPARATOR);
  const descIndex = i18n.indexOf(MEANING_SEPARATOR);
  const [meaningAndDesc, id] =
    idIndex > -1 ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''];
  const [meaning, description] =
    descIndex > -1
      ? [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)]
      : ['', meaningAndDesc];

  return {meaning, description, id: id.trim()};
}

function isTextNode(ast: html.Node[]): ast is [html.Text] {
  return ast.length === 1 && ast[0] instanceof html.Text;
}

function isAttrNode(ast: html.Node[]): ast is [html.Attribute] {
  return ast.length === 1 && ast[0] instanceof html.Attribute;
}
