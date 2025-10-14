/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InterpolationConfig } from '../ml_parser/defaults';
import { InterpolatedAttributeToken, InterpolatedTextToken } from '../ml_parser/tokens';
import { ParseError, ParseSourceSpan } from '../parse_util';
import { ASTWithSource, TemplateBinding } from './ast';
import { Lexer } from './lexer';
export interface InterpolationPiece {
    text: string;
    start: number;
    end: number;
}
export declare class SplitInterpolation {
    strings: InterpolationPiece[];
    expressions: InterpolationPiece[];
    offsets: number[];
    constructor(strings: InterpolationPiece[], expressions: InterpolationPiece[], offsets: number[]);
}
export declare class TemplateBindingParseResult {
    templateBindings: TemplateBinding[];
    warnings: string[];
    errors: ParseError[];
    constructor(templateBindings: TemplateBinding[], warnings: string[], errors: ParseError[]);
}
/**
 * Represents the possible parse modes to be used as a bitmask.
 */
export declare const enum ParseFlags {
    None = 0,
    /**
     * Whether an output binding is being parsed.
     */
    Action = 1
}
export declare class Parser {
    private readonly _lexer;
    private readonly _supportsDirectPipeReferences;
    constructor(_lexer: Lexer, _supportsDirectPipeReferences?: boolean);
    parseAction(input: string, parseSourceSpan: ParseSourceSpan, absoluteOffset: number, interpolationConfig?: InterpolationConfig): ASTWithSource;
    parseBinding(input: string, parseSourceSpan: ParseSourceSpan, absoluteOffset: number, interpolationConfig?: InterpolationConfig): ASTWithSource;
    private checkSimpleExpression;
    parseSimpleBinding(input: string, parseSourceSpan: ParseSourceSpan, absoluteOffset: number, interpolationConfig?: InterpolationConfig): ASTWithSource;
    private _parseBindingAst;
    /**
     * Parse microsyntax template expression and return a list of bindings or
     * parsing errors in case the given expression is invalid.
     *
     * For example,
     * ```html
     *   <div *ngFor="let item of items">
     *         ^      ^ absoluteValueOffset for `templateValue`
     *         absoluteKeyOffset for `templateKey`
     * ```
     * contains three bindings:
     * 1. ngFor -> null
     * 2. item -> NgForOfContext.$implicit
     * 3. ngForOf -> items
     *
     * This is apparent from the de-sugared template:
     * ```html
     *   <ng-template ngFor let-item [ngForOf]="items">
     * ```
     *
     * @param templateKey name of directive, without the * prefix. For example: ngIf, ngFor
     * @param templateValue RHS of the microsyntax attribute
     * @param templateUrl template filename if it's external, component filename if it's inline
     * @param absoluteKeyOffset start of the `templateKey`
     * @param absoluteValueOffset start of the `templateValue`
     */
    parseTemplateBindings(templateKey: string, templateValue: string, parseSourceSpan: ParseSourceSpan, absoluteKeyOffset: number, absoluteValueOffset: number): TemplateBindingParseResult;
    parseInterpolation(input: string, parseSourceSpan: ParseSourceSpan, absoluteOffset: number, interpolatedTokens: InterpolatedAttributeToken[] | InterpolatedTextToken[] | null, interpolationConfig?: InterpolationConfig): ASTWithSource | null;
    /**
     * Similar to `parseInterpolation`, but treats the provided string as a single expression
     * element that would normally appear within the interpolation prefix and suffix (`{{` and `}}`).
     * This is used for parsing the switch expression in ICUs.
     */
    parseInterpolationExpression(expression: string, parseSourceSpan: ParseSourceSpan, absoluteOffset: number): ASTWithSource;
    private createInterpolationAst;
    /**
     * Splits a string of text into "raw" text segments and expressions present in interpolations in
     * the string.
     * Returns `null` if there are no interpolations, otherwise a
     * `SplitInterpolation` with splits that look like
     *   <raw text> <expression> <raw text> ... <raw text> <expression> <raw text>
     */
    splitInterpolation(input: string, parseSourceSpan: ParseSourceSpan, errors: ParseError[], interpolatedTokens: InterpolatedAttributeToken[] | InterpolatedTextToken[] | null, interpolationConfig?: InterpolationConfig): SplitInterpolation;
    wrapLiteralPrimitive(input: string | null, sourceSpanOrLocation: ParseSourceSpan | string, absoluteOffset: number): ASTWithSource;
    private _stripComments;
    private _commentStart;
    private _checkNoInterpolation;
    /**
     * Finds the index of the end of an interpolation expression
     * while ignoring comments and quoted content.
     */
    private _getInterpolationEndIndex;
    /**
     * Generator used to iterate over the character indexes of a string that are outside of quotes.
     * @param input String to loop through.
     * @param start Index within the string at which to start.
     */
    private _forEachUnquotedChar;
}
