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
 * a specific name cam be connected to a `for` block.
 */
export declare function isConnectedForLoopBlock(name: string): boolean;
/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to an `if` block.
 */
export declare function isConnectedIfLoopBlock(name: string): boolean;
/** Creates an `if` loop block from an HTML AST node. */
export declare function createIfBlock(ast: html.Block, connectedBlocks: html.Block[], visitor: html.Visitor, bindingParser: BindingParser): {
    node: t.IfBlock | null;
    errors: ParseError[];
};
/** Creates a `for` loop block from an HTML AST node. */
export declare function createForLoop(ast: html.Block, connectedBlocks: html.Block[], visitor: html.Visitor, bindingParser: BindingParser): {
    node: t.ForLoopBlock | null;
    errors: ParseError[];
};
/** Creates a switch block from an HTML AST node. */
export declare function createSwitchBlock(ast: html.Block, visitor: html.Visitor, bindingParser: BindingParser): {
    node: t.SwitchBlock | null;
    errors: ParseError[];
};
