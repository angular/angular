/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as html from '../ml_parser/ast';
import { ParseError } from '../parse_util';
import { BindingParser } from '../template_parser/binding_parser';
import * as t from './r3_ast';
export interface Render3ParseResult {
    nodes: t.Node[];
    errors: ParseError[];
    styles: string[];
    styleUrls: string[];
    ngContentSelectors: string[];
    commentNodes?: t.Comment[];
}
interface Render3ParseOptions {
    collectCommentNodes: boolean;
}
export declare function htmlAstToRender3Ast(htmlNodes: html.Node[], bindingParser: BindingParser, options: Render3ParseOptions): Render3ParseResult;
export {};
