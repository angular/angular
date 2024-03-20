/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseError, ParseLocation, ParseSourceSpan} from '../parse_util';

import * as html from './ast';
import {NAMED_ENTITIES} from './entities';
import {tokenize, TokenizeOptions} from './lexer';
import {getNsPrefix, mergeNsAndName, splitNsName, TagDefinition} from './tags';
import {AttributeNameToken, AttributeQuoteToken, BlockCloseToken, BlockOpenStartToken, BlockParameterToken, CdataStartToken, CommentStartToken, ExpansionCaseExpressionEndToken, ExpansionCaseExpressionStartToken, ExpansionCaseValueToken, ExpansionFormStartToken, IncompleteBlockOpenToken, IncompleteTagOpenToken, InterpolatedAttributeToken, InterpolatedTextToken, TagCloseToken, TagOpenStartToken, TextToken, Token, TokenType} from './tokens';

/** Nodes that can contain other nodes. */
type NodeContainer = html.Element|html.Block;

/** Class that can construct a `NodeContainer`. */
interface NodeContainerConstructor extends Function {
  new(...args: any[]): NodeContainer;
}

export class TreeError extends ParseError {
  static create(elementName: string|null, span: ParseSourceSpan, msg: string): TreeError {
    return new TreeError(elementName, span, msg);
  }

  constructor(public elementName: string|null, span: ParseSourceSpan, msg: string) {
    super(span, msg);
  }
}

export class ParseTreeResult {
  constructor(public rootNodes: html.Node[], public errors: ParseError[]) {}
}

export class Parser {
  constructor(public getTagDefinition: (tagName: string) => TagDefinition) {}

  parse(source: string, url: string, options?: TokenizeOptions): ParseTreeResult {
    const tokenizeResult = tokenize(source, url, this.getTagDefinition, options);
    const parser = new _TreeBuilder(tokenizeResult.tokens, this.getTagDefinition);
    parser.build();
    return new ParseTreeResult(
        parser.rootNodes,
        (tokenizeResult.errors as ParseError[]).concat(parser.errors),
    );
  }
}

class _TreeBuilder {
  private _index: number = -1;
  // `_peek` will be initialized by the call to `_advance()` in the constructor.
  private _peek!: Token;
  private _containerStack: NodeContainer[] = [];

  rootNodes: html.Node[] = [];
  errors: TreeError[] = [];

  constructor(
      private tokens: Token[], private getTagDefinition: (tagName: string) => TagDefinition) {
    this._advance();
  }

  build(): void {
    while (this._peek.type !== TokenType.EOF) {
      if (this._peek.type === TokenType.TAG_OPEN_START ||
          this._peek.type === TokenType.INCOMPLETE_TAG_OPEN) {
        this._consumeStartTag(this._advance());
      } else if (this._peek.type === TokenType.TAG_CLOSE) {
        this._consumeEndTag(this._advance());
      } else if (this._peek.type === TokenType.CDATA_START) {
        this._closeVoidElement();
        this._consumeCdata(this._advance());
      } else if (this._peek.type === TokenType.COMMENT_START) {
        this._closeVoidElement();
        this._consumeComment(this._advance());
      } else if (
          this._peek.type === TokenType.TEXT || this._peek.type === TokenType.RAW_TEXT ||
          this._peek.type === TokenType.ESCAPABLE_RAW_TEXT) {
        this._closeVoidElement();
        this._consumeText(this._advance());
      } else if (this._peek.type === TokenType.EXPANSION_FORM_START) {
        this._consumeExpansion(this._advance());
      } else if (this._peek.type === TokenType.BLOCK_OPEN_START) {
        this._closeVoidElement();
        this._consumeBlockOpen(this._advance());
      } else if (this._peek.type === TokenType.BLOCK_CLOSE) {
        this._closeVoidElement();
        this._consumeBlockClose(this._advance());
      } else if (this._peek.type === TokenType.INCOMPLETE_BLOCK_OPEN) {
        this._closeVoidElement();
        this._consumeIncompleteBlock(this._advance());
      } else {
        // Skip all other tokens...
        this._advance();
      }
    }

    for (const leftoverContainer of this._containerStack) {
      // Unlike HTML elements, blocks aren't closed implicitly by the end of the file.
      if (leftoverContainer instanceof html.Block) {
        this.errors.push(TreeError.create(
            leftoverContainer.name, leftoverContainer.sourceSpan,
            `Unclosed block "${leftoverContainer.name}"`));
      }
    }
  }

  private _advance<T extends Token>(): T {
    const prev = this._peek;
    if (this._index < this.tokens.length - 1) {
      // Note: there is always an EOF token at the end
      this._index++;
    }
    this._peek = this.tokens[this._index];
    return prev as T;
  }

  private _advanceIf<T extends TokenType>(type: T): (Token&{type: T})|null {
    if (this._peek.type === type) {
      return this._advance<Token&{type: T}>();
    }
    return null;
  }

  private _consumeCdata(_startToken: CdataStartToken) {
    this._consumeText(this._advance<TextToken>());
    this._advanceIf(TokenType.CDATA_END);
  }

  private _consumeComment(token: CommentStartToken) {
    const text = this._advanceIf(TokenType.RAW_TEXT);
    const endToken = this._advanceIf(TokenType.COMMENT_END);
    const value = text != null ? text.parts[0].trim() : null;
    const sourceSpan = endToken == null ?
        token.sourceSpan :
        new ParseSourceSpan(
            token.sourceSpan.start, endToken.sourceSpan.end, token.sourceSpan.fullStart);
    this._addToParent(new html.Comment(value, sourceSpan));
  }

  private _consumeExpansion(token: ExpansionFormStartToken) {
    const switchValue = this._advance<TextToken>();

    const type = this._advance<TextToken>();
    const cases: html.ExpansionCase[] = [];

    // read =
    while (this._peek.type === TokenType.EXPANSION_CASE_VALUE) {
      const expCase = this._parseExpansionCase();
      if (!expCase) return;  // error
      cases.push(expCase);
    }

    // read the final }
    if (this._peek.type !== TokenType.EXPANSION_FORM_END) {
      this.errors.push(
          TreeError.create(null, this._peek.sourceSpan, `Invalid ICU message. Missing '}'.`));
      return;
    }
    const sourceSpan = new ParseSourceSpan(
        token.sourceSpan.start, this._peek.sourceSpan.end, token.sourceSpan.fullStart);
    this._addToParent(new html.Expansion(
        switchValue.parts[0], type.parts[0], cases, sourceSpan, switchValue.sourceSpan));

    this._advance();
  }

  private _parseExpansionCase(): html.ExpansionCase|null {
    const value = this._advance<ExpansionCaseValueToken>();

    // read {
    if (this._peek.type !== TokenType.EXPANSION_CASE_EXP_START) {
      this.errors.push(
          TreeError.create(null, this._peek.sourceSpan, `Invalid ICU message. Missing '{'.`));
      return null;
    }

    // read until }
    const start = this._advance<ExpansionCaseExpressionStartToken>();

    const exp = this._collectExpansionExpTokens(start);
    if (!exp) return null;

    const end = this._advance<ExpansionCaseExpressionEndToken>();
    exp.push({type: TokenType.EOF, parts: [], sourceSpan: end.sourceSpan});

    // parse everything in between { and }
    const expansionCaseParser = new _TreeBuilder(exp, this.getTagDefinition);
    expansionCaseParser.build();
    if (expansionCaseParser.errors.length > 0) {
      this.errors = this.errors.concat(expansionCaseParser.errors);
      return null;
    }

    const sourceSpan =
        new ParseSourceSpan(value.sourceSpan.start, end.sourceSpan.end, value.sourceSpan.fullStart);
    const expSourceSpan =
        new ParseSourceSpan(start.sourceSpan.start, end.sourceSpan.end, start.sourceSpan.fullStart);
    return new html.ExpansionCase(
        value.parts[0], expansionCaseParser.rootNodes, sourceSpan, value.sourceSpan, expSourceSpan);
  }

  private _collectExpansionExpTokens(start: Token): Token[]|null {
    const exp: Token[] = [];
    const expansionFormStack = [TokenType.EXPANSION_CASE_EXP_START];

    while (true) {
      if (this._peek.type === TokenType.EXPANSION_FORM_START ||
          this._peek.type === TokenType.EXPANSION_CASE_EXP_START) {
        expansionFormStack.push(this._peek.type);
      }

      if (this._peek.type === TokenType.EXPANSION_CASE_EXP_END) {
        if (lastOnStack(expansionFormStack, TokenType.EXPANSION_CASE_EXP_START)) {
          expansionFormStack.pop();
          if (expansionFormStack.length === 0) return exp;

        } else {
          this.errors.push(
              TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
          return null;
        }
      }

      if (this._peek.type === TokenType.EXPANSION_FORM_END) {
        if (lastOnStack(expansionFormStack, TokenType.EXPANSION_FORM_START)) {
          expansionFormStack.pop();
        } else {
          this.errors.push(
              TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
          return null;
        }
      }

      if (this._peek.type === TokenType.EOF) {
        this.errors.push(
            TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
        return null;
      }

      exp.push(this._advance());
    }
  }

  private _consumeText(token: InterpolatedTextToken) {
    const tokens = [token];
    const startSpan = token.sourceSpan;
    let text = token.parts[0];
    if (text.length > 0 && text[0] === '\n') {
      const parent = this._getContainer();

      if (parent != null && parent.children.length === 0 &&
          this.getTagDefinition(parent.name).ignoreFirstLf) {
        text = text.substring(1);
        tokens[0] = {type: token.type, sourceSpan: token.sourceSpan, parts: [text]} as typeof token;
      }
    }

    while (this._peek.type === TokenType.INTERPOLATION || this._peek.type === TokenType.TEXT ||
           this._peek.type === TokenType.ENCODED_ENTITY) {
      token = this._advance();
      tokens.push(token);
      if (token.type === TokenType.INTERPOLATION) {
        // For backward compatibility we decode HTML entities that appear in interpolation
        // expressions. This is arguably a bug, but it could be a considerable breaking change to
        // fix it. It should be addressed in a larger project to refactor the entire parser/lexer
        // chain after View Engine has been removed.
        text += token.parts.join('').replace(/&([^;]+);/g, decodeEntity);
      } else if (token.type === TokenType.ENCODED_ENTITY) {
        text += token.parts[0];
      } else {
        text += token.parts.join('');
      }
    }

    if (text.length > 0) {
      const endSpan = token.sourceSpan;
      this._addToParent(new html.Text(
          text,
          new ParseSourceSpan(startSpan.start, endSpan.end, startSpan.fullStart, startSpan.details),
          tokens));
    }
  }

  private _closeVoidElement(): void {
    const el = this._getContainer();
    if (el instanceof html.Element && this.getTagDefinition(el.name).isVoid) {
      this._containerStack.pop();
    }
  }

  private _consumeStartTag(startTagToken: TagOpenStartToken|IncompleteTagOpenToken) {
    const [prefix, name] = startTagToken.parts;
    const attrs: html.Attribute[] = [];
    while (this._peek.type === TokenType.ATTR_NAME) {
      attrs.push(this._consumeAttr(this._advance<AttributeNameToken>()));
    }
    const fullName = this._getElementFullName(prefix, name, this._getClosestParentElement());
    let selfClosing = false;
    // Note: There could have been a tokenizer error
    // so that we don't get a token for the end tag...
    if (this._peek.type === TokenType.TAG_OPEN_END_VOID) {
      this._advance();
      selfClosing = true;
      const tagDef = this.getTagDefinition(fullName);
      if (!(tagDef.canSelfClose || getNsPrefix(fullName) !== null || tagDef.isVoid)) {
        this.errors.push(TreeError.create(
            fullName, startTagToken.sourceSpan,
            `Only void, custom and foreign elements can be self closed "${
                startTagToken.parts[1]}"`));
      }
    } else if (this._peek.type === TokenType.TAG_OPEN_END) {
      this._advance();
      selfClosing = false;
    }
    const end = this._peek.sourceSpan.fullStart;
    const span = new ParseSourceSpan(
        startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
    // Create a separate `startSpan` because `span` will be modified when there is an `end` span.
    const startSpan = new ParseSourceSpan(
        startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
    const el = new html.Element(fullName, attrs, [], span, startSpan, undefined);
    const parentEl = this._getContainer();
    this._pushContainer(
        el,
        parentEl instanceof html.Element &&
            this.getTagDefinition(parentEl.name).isClosedByChild(el.name));
    if (selfClosing) {
      // Elements that are self-closed have their `endSourceSpan` set to the full span, as the
      // element start tag also represents the end tag.
      this._popContainer(fullName, html.Element, span);
    } else if (startTagToken.type === TokenType.INCOMPLETE_TAG_OPEN) {
      // We already know the opening tag is not complete, so it is unlikely it has a corresponding
      // close tag. Let's optimistically parse it as a full element and emit an error.
      this._popContainer(fullName, html.Element, null);
      this.errors.push(
          TreeError.create(fullName, span, `Opening tag "${fullName}" not terminated.`));
    }
  }

  private _pushContainer(node: NodeContainer, isClosedByChild: boolean) {
    if (isClosedByChild) {
      this._containerStack.pop();
    }

    this._addToParent(node);
    this._containerStack.push(node);
  }

  private _consumeEndTag(endTagToken: TagCloseToken) {
    const fullName = this._getElementFullName(
        endTagToken.parts[0], endTagToken.parts[1], this._getClosestParentElement());

    if (this.getTagDefinition(fullName).isVoid) {
      this.errors.push(TreeError.create(
          fullName, endTagToken.sourceSpan,
          `Void elements do not have end tags "${endTagToken.parts[1]}"`));
    } else if (!this._popContainer(fullName, html.Element, endTagToken.sourceSpan)) {
      const errMsg = `Unexpected closing tag "${
          fullName}". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags`;
      this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, errMsg));
    }
  }

  /**
   * Closes the nearest element with the tag name `fullName` in the parse tree.
   * `endSourceSpan` is the span of the closing tag, or null if the element does
   * not have a closing tag (for example, this happens when an incomplete
   * opening tag is recovered).
   */
  private _popContainer(
      expectedName: string|null, expectedType: NodeContainerConstructor,
      endSourceSpan: ParseSourceSpan|null): boolean {
    let unexpectedCloseTagDetected = false;
    for (let stackIndex = this._containerStack.length - 1; stackIndex >= 0; stackIndex--) {
      const node = this._containerStack[stackIndex];

      if ((node.name === expectedName || expectedName === null) && node instanceof expectedType) {
        // Record the parse span with the element that is being closed. Any elements that are
        // removed from the element stack at this point are closed implicitly, so they won't get
        // an end source span (as there is no explicit closing element).
        node.endSourceSpan = endSourceSpan;
        node.sourceSpan.end = endSourceSpan !== null ? endSourceSpan.end : node.sourceSpan.end;
        this._containerStack.splice(stackIndex, this._containerStack.length - stackIndex);
        return !unexpectedCloseTagDetected;
      }

      // Blocks and most elements are not self closing.
      if (node instanceof html.Block ||
          node instanceof html.Element && !this.getTagDefinition(node.name).closedByParent) {
        // Note that we encountered an unexpected close tag but continue processing the element
        // stack so we can assign an `endSourceSpan` if there is a corresponding start tag for this
        // end tag in the stack.
        unexpectedCloseTagDetected = true;
      }
    }
    return false;
  }

  private _consumeAttr(attrName: AttributeNameToken): html.Attribute {
    const fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
    let attrEnd = attrName.sourceSpan.end;

    // Consume any quote
    if (this._peek.type === TokenType.ATTR_QUOTE) {
      this._advance();
    }

    // Consume the attribute value
    let value = '';
    const valueTokens: InterpolatedAttributeToken[] = [];
    let valueStartSpan: ParseSourceSpan|undefined = undefined;
    let valueEnd: ParseLocation|undefined = undefined;
    // NOTE: We need to use a new variable `nextTokenType` here to hide the actual type of
    // `_peek.type` from TS. Otherwise TS will narrow the type of `_peek.type` preventing it from
    // being able to consider `ATTR_VALUE_INTERPOLATION` as an option. This is because TS is not
    // able to see that `_advance()` will actually mutate `_peek`.
    const nextTokenType = this._peek.type as TokenType;
    if (nextTokenType === TokenType.ATTR_VALUE_TEXT) {
      valueStartSpan = this._peek.sourceSpan;
      valueEnd = this._peek.sourceSpan.end;
      while (this._peek.type === TokenType.ATTR_VALUE_TEXT ||
             this._peek.type === TokenType.ATTR_VALUE_INTERPOLATION ||
             this._peek.type === TokenType.ENCODED_ENTITY) {
        const valueToken = this._advance<InterpolatedAttributeToken>();
        valueTokens.push(valueToken);
        if (valueToken.type === TokenType.ATTR_VALUE_INTERPOLATION) {
          // For backward compatibility we decode HTML entities that appear in interpolation
          // expressions. This is arguably a bug, but it could be a considerable breaking change to
          // fix it. It should be addressed in a larger project to refactor the entire parser/lexer
          // chain after View Engine has been removed.
          value += valueToken.parts.join('').replace(/&([^;]+);/g, decodeEntity);
        } else if (valueToken.type === TokenType.ENCODED_ENTITY) {
          value += valueToken.parts[0];
        } else {
          value += valueToken.parts.join('');
        }
        valueEnd = attrEnd = valueToken.sourceSpan.end;
      }
    }

    // Consume any quote
    if (this._peek.type === TokenType.ATTR_QUOTE) {
      const quoteToken = this._advance<AttributeQuoteToken>();
      attrEnd = quoteToken.sourceSpan.end;
    }

    const valueSpan = valueStartSpan && valueEnd &&
        new ParseSourceSpan(valueStartSpan.start, valueEnd, valueStartSpan.fullStart);
    return new html.Attribute(
        fullName, value,
        new ParseSourceSpan(attrName.sourceSpan.start, attrEnd, attrName.sourceSpan.fullStart),
        attrName.sourceSpan, valueSpan, valueTokens.length > 0 ? valueTokens : undefined,
        undefined);
  }

  private _consumeBlockOpen(token: BlockOpenStartToken) {
    const parameters: html.BlockParameter[] = [];

    while (this._peek.type === TokenType.BLOCK_PARAMETER) {
      const paramToken = this._advance<BlockParameterToken>();
      parameters.push(new html.BlockParameter(paramToken.parts[0], paramToken.sourceSpan));
    }

    if (this._peek.type === TokenType.BLOCK_OPEN_END) {
      this._advance();
    }

    const end = this._peek.sourceSpan.fullStart;
    const span = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
    // Create a separate `startSpan` because `span` will be modified when there is an `end` span.
    const startSpan = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
    const block = new html.Block(token.parts[0], parameters, [], span, token.sourceSpan, startSpan);
    this._pushContainer(block, false);
  }

  private _consumeBlockClose(token: BlockCloseToken) {
    if (!this._popContainer(null, html.Block, token.sourceSpan)) {
      this.errors.push(TreeError.create(
          null, token.sourceSpan,
          `Unexpected closing block. The block may have been closed earlier. ` +
              `If you meant to write the } character, you should use the "&#125;" ` +
              `HTML entity instead.`));
    }
  }

  private _consumeIncompleteBlock(token: IncompleteBlockOpenToken) {
    const parameters: html.BlockParameter[] = [];

    while (this._peek.type === TokenType.BLOCK_PARAMETER) {
      const paramToken = this._advance<BlockParameterToken>();
      parameters.push(new html.BlockParameter(paramToken.parts[0], paramToken.sourceSpan));
    }

    const end = this._peek.sourceSpan.fullStart;
    const span = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
    // Create a separate `startSpan` because `span` will be modified when there is an `end` span.
    const startSpan = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
    const block = new html.Block(token.parts[0], parameters, [], span, token.sourceSpan, startSpan);
    this._pushContainer(block, false);

    // Incomplete blocks don't have children so we close them immediately and report an error.
    this._popContainer(null, html.Block, null);

    this.errors.push(TreeError.create(
        token.parts[0], span,
        `Incomplete block "${token.parts[0]}". If you meant to write the @ character, ` +
            `you should use the "&#64;" HTML entity instead.`));
  }

  private _getContainer(): NodeContainer|null {
    return this._containerStack.length > 0 ? this._containerStack[this._containerStack.length - 1] :
                                             null;
  }

  private _getClosestParentElement(): html.Element|null {
    for (let i = this._containerStack.length - 1; i > -1; i--) {
      if (this._containerStack[i] instanceof html.Element) {
        return this._containerStack[i] as html.Element;
      }
    }

    return null;
  }

  private _addToParent(node: html.Node) {
    const parent = this._getContainer();

    if (parent === null) {
      this.rootNodes.push(node);
    } else {
      parent.children.push(node);
    }
  }

  private _getElementFullName(prefix: string, localName: string, parentElement: html.Element|null):
      string {
    if (prefix === '') {
      prefix = this.getTagDefinition(localName).implicitNamespacePrefix || '';
      if (prefix === '' && parentElement != null) {
        const parentTagName = splitNsName(parentElement.name)[1];
        const parentTagDefinition = this.getTagDefinition(parentTagName);
        if (!parentTagDefinition.preventNamespaceInheritance) {
          prefix = getNsPrefix(parentElement.name);
        }
      }
    }

    return mergeNsAndName(prefix, localName);
  }
}

function lastOnStack(stack: any[], element: any): boolean {
  return stack.length > 0 && stack[stack.length - 1] === element;
}

/**
 * Decode the `entity` string, which we believe is the contents of an HTML entity.
 *
 * If the string is not actually a valid/known entity then just return the original `match` string.
 */
function decodeEntity(match: string, entity: string): string {
  if (NAMED_ENTITIES[entity] !== undefined) {
    return NAMED_ENTITIES[entity] || match;
  }
  if (/^#x[a-f0-9]+$/i.test(entity)) {
    return String.fromCodePoint(parseInt(entity.slice(2), 16));
  }
  if (/^#\d+$/.test(entity)) {
    return String.fromCodePoint(parseInt(entity.slice(1), 10));
  }
  return match;
}
