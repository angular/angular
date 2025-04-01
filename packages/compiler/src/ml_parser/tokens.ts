/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceSpan} from '../parse_util';

export const enum TokenType {
  TAG_OPEN_START,
  TAG_OPEN_END,
  TAG_OPEN_END_VOID,
  TAG_CLOSE,
  INCOMPLETE_TAG_OPEN,
  TEXT,
  ESCAPABLE_RAW_TEXT,
  RAW_TEXT,
  INTERPOLATION,
  ENCODED_ENTITY,
  COMMENT_START,
  COMMENT_END,
  CDATA_START,
  CDATA_END,
  ATTR_NAME,
  ATTR_QUOTE,
  ATTR_VALUE_TEXT,
  ATTR_VALUE_INTERPOLATION,
  DOC_TYPE,
  EXPANSION_FORM_START,
  EXPANSION_CASE_VALUE,
  EXPANSION_CASE_EXP_START,
  EXPANSION_CASE_EXP_END,
  EXPANSION_FORM_END,
  BLOCK_OPEN_START,
  BLOCK_OPEN_END,
  BLOCK_CLOSE,
  BLOCK_PARAMETER,
  INCOMPLETE_BLOCK_OPEN,
  LET_START,
  LET_VALUE,
  LET_END,
  INCOMPLETE_LET,
  COMPONENT_OPEN_START,
  COMPONENT_OPEN_END,
  COMPONENT_OPEN_END_VOID,
  COMPONENT_CLOSE,
  INCOMPLETE_COMPONENT_OPEN,
  DIRECTIVE_NAME,
  DIRECTIVE_OPEN,
  DIRECTIVE_CLOSE,
  EOF,
}

export type Token =
  | TagOpenStartToken
  | TagOpenEndToken
  | TagOpenEndVoidToken
  | TagCloseToken
  | IncompleteTagOpenToken
  | TextToken
  | InterpolationToken
  | EncodedEntityToken
  | CommentStartToken
  | CommentEndToken
  | CdataStartToken
  | CdataEndToken
  | AttributeNameToken
  | AttributeQuoteToken
  | AttributeValueTextToken
  | AttributeValueInterpolationToken
  | DocTypeToken
  | ExpansionFormStartToken
  | ExpansionCaseValueToken
  | ExpansionCaseExpressionStartToken
  | ExpansionCaseExpressionEndToken
  | ExpansionFormEndToken
  | EndOfFileToken
  | BlockParameterToken
  | BlockOpenStartToken
  | BlockOpenEndToken
  | BlockCloseToken
  | IncompleteBlockOpenToken
  | LetStartToken
  | LetValueToken
  | LetEndToken
  | IncompleteLetToken
  | ComponentOpenStartToken
  | ComponentOpenEndToken
  | ComponentOpenEndVoidToken
  | ComponentCloseToken
  | IncompleteComponentOpenToken
  | DirectiveNameToken
  | DirectiveOpenToken
  | DirectiveCloseToken;

export type InterpolatedTextToken = TextToken | InterpolationToken | EncodedEntityToken;

export type InterpolatedAttributeToken =
  | AttributeValueTextToken
  | AttributeValueInterpolationToken
  | EncodedEntityToken;

export interface TokenBase {
  type: TokenType;
  parts: string[];
  sourceSpan: ParseSourceSpan;
}

export interface TagOpenStartToken extends TokenBase {
  type: TokenType.TAG_OPEN_START;
  parts: [prefix: string, name: string];
}

export interface TagOpenEndToken extends TokenBase {
  type: TokenType.TAG_OPEN_END;
  parts: [];
}

export interface TagOpenEndVoidToken extends TokenBase {
  type: TokenType.TAG_OPEN_END_VOID;
  parts: [];
}

export interface TagCloseToken extends TokenBase {
  type: TokenType.TAG_CLOSE;
  parts: [prefix: string, name: string];
}

export interface IncompleteTagOpenToken extends TokenBase {
  type: TokenType.INCOMPLETE_TAG_OPEN;
  parts: [prefix: string, name: string];
}

export interface TextToken extends TokenBase {
  type: TokenType.TEXT | TokenType.ESCAPABLE_RAW_TEXT | TokenType.RAW_TEXT;
  parts: [text: string];
}

export interface InterpolationToken extends TokenBase {
  type: TokenType.INTERPOLATION;
  parts:
    | [startMarker: string, expression: string, endMarker: string]
    | [startMarker: string, expression: string];
}

export interface EncodedEntityToken extends TokenBase {
  type: TokenType.ENCODED_ENTITY;
  parts: [decoded: string, encoded: string];
}

export interface CommentStartToken extends TokenBase {
  type: TokenType.COMMENT_START;
  parts: [];
}

export interface CommentEndToken extends TokenBase {
  type: TokenType.COMMENT_END;
  parts: [];
}

export interface CdataStartToken extends TokenBase {
  type: TokenType.CDATA_START;
  parts: [];
}

export interface CdataEndToken extends TokenBase {
  type: TokenType.CDATA_END;
  parts: [];
}

export interface AttributeNameToken extends TokenBase {
  type: TokenType.ATTR_NAME;
  parts: [prefix: string, name: string];
}

export interface AttributeQuoteToken extends TokenBase {
  type: TokenType.ATTR_QUOTE;
  parts: [quote: "'" | '"'];
}

export interface AttributeValueTextToken extends TokenBase {
  type: TokenType.ATTR_VALUE_TEXT;
  parts: [value: string];
}

export interface AttributeValueInterpolationToken extends TokenBase {
  type: TokenType.ATTR_VALUE_INTERPOLATION;
  parts:
    | [startMarker: string, expression: string, endMarker: string]
    | [startMarker: string, expression: string];
}

export interface DocTypeToken extends TokenBase {
  type: TokenType.DOC_TYPE;
  parts: [content: string];
}

export interface ExpansionFormStartToken extends TokenBase {
  type: TokenType.EXPANSION_FORM_START;
  parts: [];
}

export interface ExpansionCaseValueToken extends TokenBase {
  type: TokenType.EXPANSION_CASE_VALUE;
  parts: [value: string];
}

export interface ExpansionCaseExpressionStartToken extends TokenBase {
  type: TokenType.EXPANSION_CASE_EXP_START;
  parts: [];
}

export interface ExpansionCaseExpressionEndToken extends TokenBase {
  type: TokenType.EXPANSION_CASE_EXP_END;
  parts: [];
}

export interface ExpansionFormEndToken extends TokenBase {
  type: TokenType.EXPANSION_FORM_END;
  parts: [];
}

export interface EndOfFileToken extends TokenBase {
  type: TokenType.EOF;
  parts: [];
}

export interface BlockParameterToken extends TokenBase {
  type: TokenType.BLOCK_PARAMETER;
  parts: [expression: string];
}

export interface BlockOpenStartToken extends TokenBase {
  type: TokenType.BLOCK_OPEN_START;
  parts: [name: string];
}

export interface BlockOpenEndToken extends TokenBase {
  type: TokenType.BLOCK_OPEN_END;
  parts: [];
}

export interface BlockCloseToken extends TokenBase {
  type: TokenType.BLOCK_CLOSE;
  parts: [];
}

export interface IncompleteBlockOpenToken extends TokenBase {
  type: TokenType.INCOMPLETE_BLOCK_OPEN;
  parts: [name: string];
}

export interface LetStartToken extends TokenBase {
  type: TokenType.LET_START;
  parts: [name: string];
}

export interface LetValueToken extends TokenBase {
  type: TokenType.LET_VALUE;
  parts: [value: string];
}

export interface LetEndToken extends TokenBase {
  type: TokenType.LET_END;
  parts: [];
}

export interface IncompleteLetToken extends TokenBase {
  type: TokenType.INCOMPLETE_LET;
  parts: [name: string];
}

export interface ComponentOpenStartToken extends TokenBase {
  type: TokenType.COMPONENT_OPEN_START;
  parts: [componentName: string, prefix: string, tagName: string];
}

export interface ComponentOpenEndToken extends TokenBase {
  type: TokenType.COMPONENT_OPEN_END;
  parts: [];
}

export interface ComponentOpenEndVoidToken extends TokenBase {
  type: TokenType.COMPONENT_OPEN_END_VOID;
  parts: [];
}

export interface ComponentCloseToken extends TokenBase {
  type: TokenType.COMPONENT_CLOSE;
  parts: [componentName: string, prefix: string, tagName: string];
}

export interface IncompleteComponentOpenToken extends TokenBase {
  type: TokenType.INCOMPLETE_COMPONENT_OPEN;
  parts: [componentName: string, prefix: string, tagName: string];
}

export interface DirectiveNameToken extends TokenBase {
  type: TokenType.DIRECTIVE_NAME;
  parts: [name: string];
}

export interface DirectiveOpenToken extends TokenBase {
  type: TokenType.DIRECTIVE_OPEN;
  parts: [];
}

export interface DirectiveCloseToken extends TokenBase {
  type: TokenType.DIRECTIVE_CLOSE;
  parts: [];
}
