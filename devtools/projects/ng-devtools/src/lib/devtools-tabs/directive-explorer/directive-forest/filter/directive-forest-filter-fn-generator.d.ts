/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FilterFnGenerator } from './filter.component';
type TokenType = 'opening_bracket' | 'closing_bracket' | 'chevron_left' | 'chevron_right' | 'slash' | 'space' | 'text';
interface Token {
    type: TokenType;
    value: string;
    idx: number;
}
interface ParsedValue {
    value: string;
    idx: number;
}
export interface ParsedFilter {
    component?: ParsedValue;
    directives: ParsedValue[];
    element?: ParsedValue;
}
export declare function tokenizeDirectiveForestFilter(text: string): Token[];
export declare function parseDirectiveForestFilter(tokens: Token[]): ParsedFilter;
/** Generates a `FilterFn`, that performs token matching, for the directive-forest filter. */
export declare const directiveForestFilterFnGenerator: FilterFnGenerator;
export {};
