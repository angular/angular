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
/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `defer` block.
 */
export declare function isConnectedDeferLoopBlock(name: string): boolean;
/** Creates a deferred block from an HTML AST node. */
export declare function createDeferredBlock(ast: html.Block, connectedBlocks: html.Block[], visitor: html.Visitor, bindingParser: BindingParser): {
    node: t.DeferredBlock;
    errors: ParseError[];
};
