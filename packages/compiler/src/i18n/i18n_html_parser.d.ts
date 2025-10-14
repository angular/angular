/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MissingTranslationStrategy } from '../core';
import { HtmlParser } from '../ml_parser/html_parser';
import { TokenizeOptions } from '../ml_parser/lexer';
import { ParseTreeResult } from '../ml_parser/parser';
import { Console } from '../util';
export declare class I18NHtmlParser implements HtmlParser {
    private _htmlParser;
    getTagDefinition: any;
    private _translationBundle;
    constructor(_htmlParser: HtmlParser, translations?: string, translationsFormat?: string, missingTranslation?: MissingTranslationStrategy, console?: Console);
    parse(source: string, url: string, options?: TokenizeOptions): ParseTreeResult;
}
