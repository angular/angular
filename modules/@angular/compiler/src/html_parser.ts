/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {isPresent, isBlank,} from '../src/facade/lang';
import {ListWrapper} from '../src/facade/collection';
import {HtmlAst, HtmlAttrAst, HtmlTextAst, HtmlCommentAst, HtmlElementAst, HtmlExpansionAst, HtmlExpansionCaseAst} from './html_ast';
import {HtmlToken, HtmlTokenType, tokenizeHtml} from './html_lexer';
import {ParseError, ParseSourceSpan} from './parse_util';
import {getHtmlTagDefinition, getNsPrefix, mergeNsAndName} from './html_tags';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './interpolation_config';

export class HtmlTreeError extends ParseError {
  static create(elementName: string, span: ParseSourceSpan, msg: string): HtmlTreeError {
    return new HtmlTreeError(elementName, span, msg);
  }

  constructor(public elementName: string, span: ParseSourceSpan, msg: string) { super(span, msg); }
}

export class HtmlParseTreeResult {
  constructor(public rootNodes: HtmlAst[], public errors: ParseError[]) {}
}

@Injectable()
export class HtmlParser {
  parse(
      sourceContent: string, sourceUrl: string, parseExpansionForms: boolean = false,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG):
      HtmlParseTreeResult {
    const tokensAndErrors =
        tokenizeHtml(sourceContent, sourceUrl, parseExpansionForms, interpolationConfig);
    const treeAndErrors = new TreeBuilder(tokensAndErrors.tokens).build();
    return new HtmlParseTreeResult(
        treeAndErrors.rootNodes,
        (<ParseError[]>tokensAndErrors.errors).concat(treeAndErrors.errors));
  }
}

class TreeBuilder {
  private index: number = -1;
  private peek: HtmlToken;

  private rootNodes: HtmlAst[] = [];
  private errors: HtmlTreeError[] = [];

  private elementStack: HtmlElementAst[] = [];

  constructor(private tokens: HtmlToken[]) { this._advance(); }

  build(): HtmlParseTreeResult {
    while (this.peek.type !== HtmlTokenType.EOF) {
      if (this.peek.type === HtmlTokenType.TAG_OPEN_START) {
        this._consumeStartTag(this._advance());
      } else if (this.peek.type === HtmlTokenType.TAG_CLOSE) {
        this._consumeEndTag(this._advance());
      } else if (this.peek.type === HtmlTokenType.CDATA_START) {
        this._closeVoidElement();
        this._consumeCdata(this._advance());
      } else if (this.peek.type === HtmlTokenType.COMMENT_START) {
        this._closeVoidElement();
        this._consumeComment(this._advance());
      } else if (
          this.peek.type === HtmlTokenType.TEXT || this.peek.type === HtmlTokenType.RAW_TEXT ||
          this.peek.type === HtmlTokenType.ESCAPABLE_RAW_TEXT) {
        this._closeVoidElement();
        this._consumeText(this._advance());
      } else if (this.peek.type === HtmlTokenType.EXPANSION_FORM_START) {
        this._consumeExpansion(this._advance());
      } else {
        // Skip all other tokens...
        this._advance();
      }
    }
    return new HtmlParseTreeResult(this.rootNodes, this.errors);
  }

  private _advance(): HtmlToken {
    const prev = this.peek;
    if (this.index < this.tokens.length - 1) {
      // Note: there is always an EOF token at the end
      this.index++;
    }
    this.peek = this.tokens[this.index];
    return prev;
  }

  private _advanceIf(type: HtmlTokenType): HtmlToken {
    if (this.peek.type === type) {
      return this._advance();
    }
    return null;
  }

  private _consumeCdata(startToken: HtmlToken) {
    this._consumeText(this._advance());
    this._advanceIf(HtmlTokenType.CDATA_END);
  }

  private _consumeComment(token: HtmlToken) {
    const text = this._advanceIf(HtmlTokenType.RAW_TEXT);
    this._advanceIf(HtmlTokenType.COMMENT_END);
    const value = isPresent(text) ? text.parts[0].trim() : null;
    this._addToParent(new HtmlCommentAst(value, token.sourceSpan));
  }

  private _consumeExpansion(token: HtmlToken) {
    const switchValue = this._advance();

    const type = this._advance();
    const cases: HtmlExpansionCaseAst[] = [];

    // read =
    while (this.peek.type === HtmlTokenType.EXPANSION_CASE_VALUE) {
      let expCase = this._parseExpansionCase();
      if (isBlank(expCase)) return;  // error
      cases.push(expCase);
    }

    // read the final }
    if (this.peek.type !== HtmlTokenType.EXPANSION_FORM_END) {
      this.errors.push(
          HtmlTreeError.create(null, this.peek.sourceSpan, `Invalid expansion form. Missing '}'.`));
      return;
    }
    this._advance();

    const mainSourceSpan = new ParseSourceSpan(token.sourceSpan.start, this.peek.sourceSpan.end);
    this._addToParent(new HtmlExpansionAst(
        switchValue.parts[0], type.parts[0], cases, mainSourceSpan, switchValue.sourceSpan));
  }

  private _parseExpansionCase(): HtmlExpansionCaseAst {
    const value = this._advance();

    // read {
    if (this.peek.type !== HtmlTokenType.EXPANSION_CASE_EXP_START) {
      this.errors.push(HtmlTreeError.create(
          null, this.peek.sourceSpan, `Invalid expansion form. Missing '{'.,`));
      return null;
    }

    // read until }
    const start = this._advance();

    const exp = this._collectExpansionExpTokens(start);
    if (isBlank(exp)) return null;

    const end = this._advance();
    exp.push(new HtmlToken(HtmlTokenType.EOF, [], end.sourceSpan));

    // parse everything in between { and }
    const parsedExp = new TreeBuilder(exp).build();
    if (parsedExp.errors.length > 0) {
      this.errors = this.errors.concat(<HtmlTreeError[]>parsedExp.errors);
      return null;
    }

    const sourceSpan = new ParseSourceSpan(value.sourceSpan.start, end.sourceSpan.end);
    const expSourceSpan = new ParseSourceSpan(start.sourceSpan.start, end.sourceSpan.end);
    return new HtmlExpansionCaseAst(
        value.parts[0], parsedExp.rootNodes, sourceSpan, value.sourceSpan, expSourceSpan);
  }

  private _collectExpansionExpTokens(start: HtmlToken): HtmlToken[] {
    const exp: HtmlToken[] = [];
    const expansionFormStack = [HtmlTokenType.EXPANSION_CASE_EXP_START];

    while (true) {
      if (this.peek.type === HtmlTokenType.EXPANSION_FORM_START ||
          this.peek.type === HtmlTokenType.EXPANSION_CASE_EXP_START) {
        expansionFormStack.push(this.peek.type);
      }

      if (this.peek.type === HtmlTokenType.EXPANSION_CASE_EXP_END) {
        if (lastOnStack(expansionFormStack, HtmlTokenType.EXPANSION_CASE_EXP_START)) {
          expansionFormStack.pop();
          if (expansionFormStack.length == 0) return exp;

        } else {
          this.errors.push(
              HtmlTreeError.create(null, start.sourceSpan, `Invalid expansion form. Missing '}'.`));
          return null;
        }
      }

      if (this.peek.type === HtmlTokenType.EXPANSION_FORM_END) {
        if (lastOnStack(expansionFormStack, HtmlTokenType.EXPANSION_FORM_START)) {
          expansionFormStack.pop();
        } else {
          this.errors.push(
              HtmlTreeError.create(null, start.sourceSpan, `Invalid expansion form. Missing '}'.`));
          return null;
        }
      }

      if (this.peek.type === HtmlTokenType.EOF) {
        this.errors.push(
            HtmlTreeError.create(null, start.sourceSpan, `Invalid expansion form. Missing '}'.`));
        return null;
      }

      exp.push(this._advance());
    }
  }

  private _consumeText(token: HtmlToken) {
    let text = token.parts[0];
    if (text.length > 0 && text[0] == '\n') {
      const parent = this._getParentElement();
      if (isPresent(parent) && parent.children.length == 0 &&
          getHtmlTagDefinition(parent.name).ignoreFirstLf) {
        text = text.substring(1);
      }
    }

    if (text.length > 0) {
      this._addToParent(new HtmlTextAst(text, token.sourceSpan));
    }
  }

  private _closeVoidElement(): void {
    if (this.elementStack.length > 0) {
      const el = ListWrapper.last(this.elementStack);

      if (getHtmlTagDefinition(el.name).isVoid) {
        this.elementStack.pop();
      }
    }
  }

  private _consumeStartTag(startTagToken: HtmlToken) {
    const prefix = startTagToken.parts[0];
    const name = startTagToken.parts[1];
    const attrs: HtmlAttrAst[] = [];
    while (this.peek.type === HtmlTokenType.ATTR_NAME) {
      attrs.push(this._consumeAttr(this._advance()));
    }
    const fullName = getElementFullName(prefix, name, this._getParentElement());
    let selfClosing = false;
    // Note: There could have been a tokenizer error
    // so that we don't get a token for the end tag...
    if (this.peek.type === HtmlTokenType.TAG_OPEN_END_VOID) {
      this._advance();
      selfClosing = true;
      if (getNsPrefix(fullName) == null && !getHtmlTagDefinition(fullName).isVoid) {
        this.errors.push(HtmlTreeError.create(
            fullName, startTagToken.sourceSpan,
            `Only void and foreign elements can be self closed "${startTagToken.parts[1]}"`));
      }
    } else if (this.peek.type === HtmlTokenType.TAG_OPEN_END) {
      this._advance();
      selfClosing = false;
    }
    const end = this.peek.sourceSpan.start;
    const span = new ParseSourceSpan(startTagToken.sourceSpan.start, end);
    const el = new HtmlElementAst(fullName, attrs, [], span, span, null);
    this._pushElement(el);
    if (selfClosing) {
      this._popElement(fullName);
      el.endSourceSpan = span;
    }
  }

  private _pushElement(el: HtmlElementAst) {
    if (this.elementStack.length > 0) {
      const parentEl = ListWrapper.last(this.elementStack);
      if (getHtmlTagDefinition(parentEl.name).isClosedByChild(el.name)) {
        this.elementStack.pop();
      }
    }

    const tagDef = getHtmlTagDefinition(el.name);
    const {parent, container} = this._getParentElementSkippingContainers();

    if (isPresent(parent) && tagDef.requireExtraParent(parent.name)) {
      const newParent = new HtmlElementAst(
          tagDef.parentToAdd, [], [], el.sourceSpan, el.startSourceSpan, el.endSourceSpan);
      this._insertBeforeContainer(parent, container, newParent);
    }

    this._addToParent(el);
    this.elementStack.push(el);
  }

  private _consumeEndTag(endTagToken: HtmlToken) {
    const fullName =
        getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());

    if (this._getParentElement()) {
      this._getParentElement().endSourceSpan = endTagToken.sourceSpan;
    }

    if (getHtmlTagDefinition(fullName).isVoid) {
      this.errors.push(HtmlTreeError.create(
          fullName, endTagToken.sourceSpan,
          `Void elements do not have end tags "${endTagToken.parts[1]}"`));
    } else if (!this._popElement(fullName)) {
      this.errors.push(HtmlTreeError.create(
          fullName, endTagToken.sourceSpan, `Unexpected closing tag "${endTagToken.parts[1]}"`));
    }
  }

  private _popElement(fullName: string): boolean {
    for (let stackIndex = this.elementStack.length - 1; stackIndex >= 0; stackIndex--) {
      const el = this.elementStack[stackIndex];
      if (el.name == fullName) {
        ListWrapper.splice(this.elementStack, stackIndex, this.elementStack.length - stackIndex);
        return true;
      }

      if (!getHtmlTagDefinition(el.name).closedByParent) {
        return false;
      }
    }
    return false;
  }

  private _consumeAttr(attrName: HtmlToken): HtmlAttrAst {
    const fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
    let end = attrName.sourceSpan.end;
    let value = '';
    if (this.peek.type === HtmlTokenType.ATTR_VALUE) {
      const valueToken = this._advance();
      value = valueToken.parts[0];
      end = valueToken.sourceSpan.end;
    }
    return new HtmlAttrAst(fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, end));
  }

  private _getParentElement(): HtmlElementAst {
    return this.elementStack.length > 0 ? ListWrapper.last(this.elementStack) : null;
  }

  /**
   * Returns the parent in the DOM and the container.
   *
   * `<ng-container>` elements are skipped as they are not rendered as DOM element.
   */
  private _getParentElementSkippingContainers():
      {parent: HtmlElementAst, container: HtmlElementAst} {
    let container: HtmlElementAst = null;

    for (let i = this.elementStack.length - 1; i >= 0; i--) {
      if (this.elementStack[i].name !== 'ng-container') {
        return {parent: this.elementStack[i], container};
      }
      container = this.elementStack[i];
    }

    return {parent: ListWrapper.last(this.elementStack), container};
  }

  private _addToParent(node: HtmlAst) {
    const parent = this._getParentElement();
    if (isPresent(parent)) {
      parent.children.push(node);
    } else {
      this.rootNodes.push(node);
    }
  }

  /**
   * Insert a node between the parent and the container.
   * When no container is given, the node is appended as a child of the parent.
   * Also updates the element stack accordingly.
   *
   * @internal
   */
  private _insertBeforeContainer(
      parent: HtmlElementAst, container: HtmlElementAst, node: HtmlElementAst) {
    if (!container) {
      this._addToParent(node);
      this.elementStack.push(node);
    } else {
      if (parent) {
        // replace the container with the new node in the children
        const index = parent.children.indexOf(container);
        parent.children[index] = node;
      } else {
        this.rootNodes.push(node);
      }
      node.children.push(container);
      this.elementStack.splice(this.elementStack.indexOf(container), 0, node);
    }
  }
}

function getElementFullName(
    prefix: string, localName: string, parentElement: HtmlElementAst): string {
  if (isBlank(prefix)) {
    prefix = getHtmlTagDefinition(localName).implicitNamespacePrefix;
    if (isBlank(prefix) && isPresent(parentElement)) {
      prefix = getNsPrefix(parentElement.name);
    }
  }

  return mergeNsAndName(prefix, localName);
}

function lastOnStack(stack: any[], element: any): boolean {
  return stack.length > 0 && stack[stack.length - 1] === element;
}
