/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ParseError, ParseSourceSpan } from '../parse_util';
import { InterpolationConfig } from './defaults';
import { TagDefinition } from './tags';
import { Token } from './tokens';
export declare class TokenizeResult {
    tokens: Token[];
    errors: ParseError[];
    nonNormalizedIcuExpressions: Token[];
    constructor(tokens: Token[], errors: ParseError[], nonNormalizedIcuExpressions: Token[]);
}
export interface LexerRange {
    startPos: number;
    startLine: number;
    startCol: number;
    endPos: number;
}
/**
 * Options that modify how the text is tokenized.
 */
export interface TokenizeOptions {
    /** Whether to tokenize ICU messages (considered as text nodes when false). */
    tokenizeExpansionForms?: boolean;
    /** How to tokenize interpolation markers. */
    interpolationConfig?: InterpolationConfig;
    /**
     * The start and end point of the text to parse within the `source` string.
     * The entire `source` string is parsed if this is not provided.
     * */
    range?: LexerRange;
    /**
     * If this text is stored in a JavaScript string, then we have to deal with escape sequences.
     *
     * **Example 1:**
     *
     * ```
     * "abc\"def\nghi"
     * ```
     *
     * - The `\"` must be converted to `"`.
     * - The `\n` must be converted to a new line character in a token,
     *   but it should not increment the current line for source mapping.
     *
     * **Example 2:**
     *
     * ```
     * "abc\
     *  def"
     * ```
     *
     * The line continuation (`\` followed by a newline) should be removed from a token
     * but the new line should increment the current line for source mapping.
     */
    escapedString?: boolean;
    /**
     * If this text is stored in an external template (e.g. via `templateUrl`) then we need to decide
     * whether or not to normalize the line-endings (from `\r\n` to `\n`) when processing ICU
     * expressions.
     *
     * If `true` then we will normalize ICU expression line endings.
     * The default is `false`, but this will be switched in a future major release.
     */
    i18nNormalizeLineEndingsInICUs?: boolean;
    /**
     * An array of characters that should be considered as leading trivia.
     * Leading trivia are characters that are not important to the developer, and so should not be
     * included in source-map segments.  A common example is whitespace.
     */
    leadingTriviaChars?: string[];
    /**
     * If true, do not convert CRLF to LF.
     */
    preserveLineEndings?: boolean;
    /**
     * Whether to tokenize @ block syntax. Otherwise considered text,
     * or ICU tokens if `tokenizeExpansionForms` is enabled.
     */
    tokenizeBlocks?: boolean;
    /**
     * Whether to tokenize the `@let` syntax. Otherwise will be considered either
     * text or an incomplete block, depending on whether `tokenizeBlocks` is enabled.
     */
    tokenizeLet?: boolean;
    /** Whether the selectorless syntax is enabled. */
    selectorlessEnabled?: boolean;
}
export declare function tokenize(source: string, url: string, getTagDefinition: (tagName: string) => TagDefinition, options?: TokenizeOptions): TokenizeResult;
/**
 * The _Tokenizer uses objects of this type to move through the input text,
 * extracting "parsed characters". These could be more than one actual character
 * if the text contains escape sequences.
 */
interface CharacterCursor {
    /** Initialize the cursor. */
    init(): void;
    /** The parsed character at the current cursor position. */
    peek(): number;
    /** Advance the cursor by one parsed character. */
    advance(): void;
    /** Get a span from the marked start point to the current point. */
    getSpan(start?: this, leadingTriviaCodePoints?: number[]): ParseSourceSpan;
    /** Get the parsed characters from the marked start point to the current point. */
    getChars(start: this): string;
    /** The number of characters left before the end of the cursor. */
    charsLeft(): number;
    /** The number of characters between `this` cursor and `other` cursor. */
    diff(other: this): number;
    /** Make a copy of this cursor */
    clone(): CharacterCursor;
}
export declare class CursorError extends Error {
    msg: string;
    cursor: CharacterCursor;
    constructor(msg: string, cursor: CharacterCursor);
}
export {};
