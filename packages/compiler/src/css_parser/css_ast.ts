/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseLocation, ParseSourceSpan} from '../parse_util';

import {CssToken, CssTokenType} from './css_lexer';

export enum BlockType {
  Import,
  Charset,
  Namespace,
  Supports,
  Keyframes,
  MediaQuery,
  Selector,
  FontFace,
  Page,
  Document,
  Viewport,
  Unsupported
}

export interface CssAstVisitor {
  visitCssValue(ast: CssStyleValueAst, context?: any): any;
  visitCssInlineRule(ast: CssInlineRuleAst, context?: any): any;
  visitCssAtRulePredicate(ast: CssAtRulePredicateAst, context?: any): any;
  visitCssKeyframeRule(ast: CssKeyframeRuleAst, context?: any): any;
  visitCssKeyframeDefinition(ast: CssKeyframeDefinitionAst, context?: any): any;
  visitCssMediaQueryRule(ast: CssMediaQueryRuleAst, context?: any): any;
  visitCssSelectorRule(ast: CssSelectorRuleAst, context?: any): any;
  visitCssSelector(ast: CssSelectorAst, context?: any): any;
  visitCssSimpleSelector(ast: CssSimpleSelectorAst, context?: any): any;
  visitCssPseudoSelector(ast: CssPseudoSelectorAst, context?: any): any;
  visitCssDefinition(ast: CssDefinitionAst, context?: any): any;
  visitCssBlock(ast: CssBlockAst, context?: any): any;
  visitCssStylesBlock(ast: CssStylesBlockAst, context?: any): any;
  visitCssStyleSheet(ast: CssStyleSheetAst, context?: any): any;
  visitCssUnknownRule(ast: CssUnknownRuleAst, context?: any): any;
  visitCssUnknownTokenList(ast: CssUnknownTokenListAst, context?: any): any;
}

export abstract class CssAst {
  constructor(public location: ParseSourceSpan) {}
  get start(): ParseLocation { return this.location.start; }
  get end(): ParseLocation { return this.location.end; }
  abstract visit(visitor: CssAstVisitor, context?: any): any;
}

export class CssStyleValueAst extends CssAst {
  constructor(location: ParseSourceSpan, public tokens: CssToken[], public strValue: string) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any { return visitor.visitCssValue(this); }
}

export abstract class CssRuleAst extends CssAst {
  constructor(location: ParseSourceSpan) { super(location); }
}

export class CssBlockRuleAst extends CssRuleAst {
  constructor(
      public location: ParseSourceSpan, public type: BlockType, public block: CssBlockAst,
      public name: CssToken|null = null) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssBlock(this.block, context);
  }
}

export class CssKeyframeRuleAst extends CssBlockRuleAst {
  constructor(location: ParseSourceSpan, name: CssToken, block: CssBlockAst) {
    super(location, BlockType.Keyframes, block, name);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssKeyframeRule(this, context);
  }
}

export class CssKeyframeDefinitionAst extends CssBlockRuleAst {
  constructor(location: ParseSourceSpan, public steps: CssToken[], block: CssBlockAst) {
    super(location, BlockType.Keyframes, block, mergeTokens(steps, ','));
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssKeyframeDefinition(this, context);
  }
}

export class CssBlockDefinitionRuleAst extends CssBlockRuleAst {
  constructor(
      location: ParseSourceSpan, public strValue: string, type: BlockType,
      public query: CssAtRulePredicateAst, block: CssBlockAst) {
    super(location, type, block);
    const firstCssToken: CssToken = query.tokens[0];
    this.name = new CssToken(
        firstCssToken.index, firstCssToken.column, firstCssToken.line, CssTokenType.Identifier,
        this.strValue);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssBlock(this.block, context);
  }
}

export class CssMediaQueryRuleAst extends CssBlockDefinitionRuleAst {
  constructor(
      location: ParseSourceSpan, strValue: string, query: CssAtRulePredicateAst,
      block: CssBlockAst) {
    super(location, strValue, BlockType.MediaQuery, query, block);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssMediaQueryRule(this, context);
  }
}

export class CssAtRulePredicateAst extends CssAst {
  constructor(location: ParseSourceSpan, public strValue: string, public tokens: CssToken[]) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssAtRulePredicate(this, context);
  }
}

export class CssInlineRuleAst extends CssRuleAst {
  constructor(location: ParseSourceSpan, public type: BlockType, public value: CssStyleValueAst) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssInlineRule(this, context);
  }
}

export class CssSelectorRuleAst extends CssBlockRuleAst {
  public strValue: string;

  constructor(location: ParseSourceSpan, public selectors: CssSelectorAst[], block: CssBlockAst) {
    super(location, BlockType.Selector, block);
    this.strValue = selectors.map(selector => selector.strValue).join(',');
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssSelectorRule(this, context);
  }
}

export class CssDefinitionAst extends CssAst {
  constructor(
      location: ParseSourceSpan, public property: CssToken, public value: CssStyleValueAst) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssDefinition(this, context);
  }
}

export abstract class CssSelectorPartAst extends CssAst {
  constructor(location: ParseSourceSpan) { super(location); }
}

export class CssSelectorAst extends CssSelectorPartAst {
  public strValue: string;
  constructor(location: ParseSourceSpan, public selectorParts: CssSimpleSelectorAst[]) {
    super(location);
    this.strValue = selectorParts.map(part => part.strValue).join('');
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssSelector(this, context);
  }
}

export class CssSimpleSelectorAst extends CssSelectorPartAst {
  constructor(
      location: ParseSourceSpan, public tokens: CssToken[], public strValue: string,
      public pseudoSelectors: CssPseudoSelectorAst[], public operator: CssToken) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssSimpleSelector(this, context);
  }
}

export class CssPseudoSelectorAst extends CssSelectorPartAst {
  constructor(
      location: ParseSourceSpan, public strValue: string, public name: string,
      public tokens: CssToken[], public innerSelectors: CssSelectorAst[]) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssPseudoSelector(this, context);
  }
}

export class CssBlockAst extends CssAst {
  constructor(location: ParseSourceSpan, public entries: CssAst[]) { super(location); }
  visit(visitor: CssAstVisitor, context?: any): any { return visitor.visitCssBlock(this, context); }
}

/*
 a style block is different from a standard block because it contains
 css prop:value definitions. A regular block can contain a list of Ast entries.
 */
export class CssStylesBlockAst extends CssBlockAst {
  constructor(location: ParseSourceSpan, public definitions: CssDefinitionAst[]) {
    super(location, definitions);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssStylesBlock(this, context);
  }
}

export class CssStyleSheetAst extends CssAst {
  constructor(location: ParseSourceSpan, public rules: CssAst[]) { super(location); }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssStyleSheet(this, context);
  }
}

export class CssUnknownRuleAst extends CssRuleAst {
  constructor(location: ParseSourceSpan, public ruleName: string, public tokens: CssToken[]) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssUnknownRule(this, context);
  }
}

export class CssUnknownTokenListAst extends CssRuleAst {
  constructor(location: ParseSourceSpan, public name: string, public tokens: CssToken[]) {
    super(location);
  }
  visit(visitor: CssAstVisitor, context?: any): any {
    return visitor.visitCssUnknownTokenList(this, context);
  }
}

export function mergeTokens(tokens: CssToken[], separator: string = ''): CssToken {
  const mainToken = tokens[0];
  let str = mainToken.strValue;
  for (let i = 1; i < tokens.length; i++) {
    str += separator + tokens[i].strValue;
  }

  return new CssToken(mainToken.index, mainToken.column, mainToken.line, mainToken.type, str);
}
