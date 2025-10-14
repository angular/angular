/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TokenizeOptions } from './lexer';
import { Parser, ParseTreeResult } from './parser';
export declare class HtmlParser extends Parser {
    constructor();
    parse(source: string, url: string, options?: TokenizeOptions): ParseTreeResult;
}
