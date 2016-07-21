/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HtmlAst, HtmlAstVisitor, HtmlAttrAst, HtmlCommentAst, HtmlElementAst, HtmlExpansionAst, HtmlExpansionCaseAst, HtmlTextAst} from '../html_parser/html_ast';
import {I18nError, I18N_ATTR_PREFIX, getI18nAttr, meaning, description, isOpeningComment, isClosingComment,} from './shared';
import {htmlVisitAll} from '../html_parser/html_ast';

export function extractAstMessages(
    sourceAst: HtmlAst[], implicitTags: string[],
    implicitAttrs: {[k: string]: string[]}): ExtractionResult {
  const visitor = new _ExtractVisitor(implicitTags, implicitAttrs);
  return visitor.extract(sourceAst);
}

export class ExtractionResult {
  constructor(public messages: AstMessage[], public errors: I18nError[]) {}
}

class _ExtractVisitor implements HtmlAstVisitor {
  // <el i18n>...</el>
  private _inI18nNode = false;
  private _depth: number = 0;

  // <!--i18n-->...<!--/i18n-->
  private _blockMeaningAndDesc: string;
  private _blockChildren: HtmlAst[];
  private _blockStartDepth: number;
  private _inI18nBlock: boolean;

  // {<icu message>}
  private _inIcu = false;

  private _sectionStartIndex: number;
  private _errors: I18nError[];

  constructor(private _implicitTags: string[], private _implicitAttrs: {[k: string]: string[]}) {}

  extract(source: HtmlAst[]): ExtractionResult {
    const messages: AstMessage[] = [];
    this._inI18nBlock = false;
    this._inI18nNode = false;
    this._depth = 0;
    this._inIcu = false;
    this._sectionStartIndex = void 0;
    this._errors = [];

    source.forEach(node => node.visit(this, messages));

    if (this._inI18nBlock) {
      this._reportError(source[source.length - 1], 'Unclosed block');
    }

    return new ExtractionResult(messages, this._errors);
  }

  visitExpansionCase(part: HtmlExpansionCaseAst, messages: AstMessage[]): any {
    htmlVisitAll(this, part.expression, messages);
  }

  visitExpansion(icu: HtmlExpansionAst, messages: AstMessage[]): any {
    this._mayBeAddBlockChildren(icu);

    const wasInIcu = this._inIcu;

    if (!this._inIcu) {
      if (this._inI18nNode || this._inI18nBlock) {
        this._addMessage(messages, [icu]);
      }
      this._inIcu = true;
    }

    htmlVisitAll(this, icu.cases, messages);

    this._inIcu = wasInIcu;
  }

  visitComment(comment: HtmlCommentAst, messages: AstMessage[]): any {
    const isOpening = isOpeningComment(comment);

    if (isOpening && (this._inI18nBlock || this._inI18nNode)) {
      this._reportError(comment, 'Could not start a block inside a translatable section');
      return;
    }

    const isClosing = isClosingComment(comment);

    if (isClosing && !this._inI18nBlock) {
      this._reportError(comment, 'Trying to close an unopened block');
      return;
    }

    if (!(this._inI18nNode || this._inIcu)) {
      if (!this._inI18nBlock) {
        if (isOpening) {
          this._inI18nBlock = true;
          this._blockStartDepth = this._depth;
          this._blockChildren = [];
          this._blockMeaningAndDesc = comment.value.replace(/^i18n:?/, '').trim();
          this._startSection(messages);
        }
      } else {
        if (isClosing) {
          if (this._depth == this._blockStartDepth) {
            this._endSection(messages, this._blockChildren);
            this._inI18nBlock = false;
            this._addMessage(messages, this._blockChildren, this._blockMeaningAndDesc);
          } else {
            this._reportError(comment, 'I18N blocks should not cross element boundaries');
            return;
          }
        }
      }
    }
  }

  visitText(text: HtmlTextAst, messages: AstMessage[]): any { this._mayBeAddBlockChildren(text); }

  visitElement(el: HtmlElementAst, messages: AstMessage[]): any {
    this._mayBeAddBlockChildren(el);
    this._depth++;
    const wasInI18nNode = this._inI18nNode;
    let useSection = false;

    // Extract only top level nodes with the (implicit) "i18n" attribute if not in a block or an ICU
    // message
    const i18nAttr = getI18nAttr(el);
    const isImplicitI18n =
        this._implicitTags.some((tagName: string): boolean => el.name === tagName);
    if (!(this._inI18nNode || this._inIcu || this._inI18nBlock)) {
      if (i18nAttr) {
        this._inI18nNode = true;
        this._addMessage(messages, el.children, i18nAttr.value);
        useSection = true;
      } else if (isImplicitI18n) {
        this._inI18nNode = true;
        this._addMessage(messages, el.children);
      }
    } else {
      if (i18nAttr || isImplicitI18n) {
        // TODO(vicb): we should probably allow nested implicit element (ie <div>)
        this._reportError(
            el, 'Could not mark an element as translatable inside a translatable section');
      }
    }

    this._extractFromAttributes(el, messages);

    if (useSection) {
      this._startSection(messages);
      htmlVisitAll(this, el.children, messages);
      this._endSection(messages, el.children);
    } else {
      htmlVisitAll(this, el.children, messages);
    }

    this._depth--;
    this._inI18nNode = wasInI18nNode;
  }

  visitAttr(ast: HtmlAttrAst, messages: AstMessage[]): any { throw new Error('unreachable code'); }

  private _extractFromAttributes(el: HtmlElementAst, messages: AstMessage[]): void {
    const explicitAttrNameToValue: Map<string, string> = new Map();
    const implicitAttrNames: string[] = this._implicitAttrs[el.name] || [];

    el.attrs.filter(attr => attr.name.startsWith(I18N_ATTR_PREFIX))
        .forEach(
            attr => explicitAttrNameToValue.set(
                attr.name.substring(I18N_ATTR_PREFIX.length), attr.value));

    el.attrs.forEach(attr => {
      if (explicitAttrNameToValue.has(attr.name)) {
        this._addMessage(messages, [attr], explicitAttrNameToValue.get(attr.name));
      } else if (implicitAttrNames.some(name => attr.name === name)) {
        this._addMessage(messages, [attr]);
      }
    });
  }

  private _addMessage(messages: AstMessage[], ast: HtmlAst[], meaningAndDesc?: string): void {
    if (ast.length == 0 ||
        ast.length == 1 && ast[0] instanceof HtmlAttrAst && !(<HtmlAttrAst>ast[0]).value) {
      // Do not create empty messages
      return;
    }
    messages.push(new AstMessage(ast, meaning(meaningAndDesc), description(meaningAndDesc)));
  }

  /**
   * Add the node as a child of the block when:
   * - we are in a block,
   * - we are not inside a ICU message (those are handled separately),
   * - the node is a "direct child" of the block
   */
  private _mayBeAddBlockChildren(ast: HtmlAst): void {
    if (this._inI18nBlock && !this._inIcu && this._depth == this._blockStartDepth) {
      this._blockChildren.push(ast);
    }
  }

  /**
   * Marks the start of a section, see `_endSection`
   */
  private _startSection(messages: AstMessage[]): void {
    if (this._sectionStartIndex !== void 0) {
      throw new Error('Unexpected section start');
    }

    this._sectionStartIndex = messages.length;
  }

  /**
   * Terminates a section.
   *
   * If a section has only one significant children (comments not significant) then we should not
   * keep the message
   * from this children:
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
  private _endSection(messages: AstMessage[], directChildren: HtmlAst[]): void {
    if (this._sectionStartIndex === void 0) {
      throw new Error('Unexpected section end');
    }

    const startIndex = this._sectionStartIndex;
    const significantChildren: number = directChildren.reduce(
        (count: number, node: HtmlAst): number => count + (node instanceof HtmlCommentAst ? 0 : 1),
        0);

    if (significantChildren == 1) {
      for (let i = startIndex; i < messages.length; i++) {
        let ast = messages[i].nodes;
        if (!(ast.length == 1 && ast[0] instanceof HtmlAttrAst)) {
          messages.splice(i, 1);
          break;
        }
      }
    }

    this._sectionStartIndex = void 0;
  }

  private _reportError(astNode: HtmlAst, msg: string): void {
    this._errors.push(new I18nError(astNode.sourceSpan, msg));
  }
}

export class AstMessage {
  constructor(public nodes: HtmlAst[], public meaning: string, public description: string) {}
}
