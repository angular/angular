/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as html from './ast';
import { ParseTreeResult } from './parser';
export declare const PRESERVE_WS_ATTR_NAME = "ngPreserveWhitespaces";
/**
 * &ngsp; is a placeholder for non-removable space
 * &ngsp; is converted to the 0xE500 PUA (Private Use Areas) unicode character
 * and later on replaced by a space.
 */
export declare function replaceNgsp(value: string): string;
/**
 * This visitor can walk HTML parse tree and remove / trim text nodes using the following rules:
 * - consider spaces, tabs and new lines as whitespace characters;
 * - drop text nodes consisting of whitespace characters only;
 * - for all other text nodes replace consecutive whitespace characters with one space;
 * - convert &ngsp; pseudo-entity to a single space;
 *
 * Removal and trimming of whitespaces have positive performance impact (less code to generate
 * while compiling templates, faster view creation). At the same time it can be "destructive"
 * in some cases (whitespaces can influence layout). Because of the potential of breaking layout
 * this visitor is not activated by default in Angular 5 and people need to explicitly opt-in for
 * whitespace removal. The default option for whitespace removal will be revisited in Angular 6
 * and might be changed to "on" by default.
 *
 * If `originalNodeMap` is provided, the transformed nodes will be mapped back to their original
 * inputs. Any output nodes not in the map were not transformed. This supports correlating and
 * porting information between the trimmed nodes and original nodes (such as `i18n` properties)
 * such that trimming whitespace does not does not drop required information from the node.
 */
export declare class WhitespaceVisitor implements html.Visitor {
    private readonly preserveSignificantWhitespace;
    private readonly originalNodeMap?;
    private readonly requireContext;
    private icuExpansionDepth;
    constructor(preserveSignificantWhitespace: boolean, originalNodeMap?: Map<html.Node, html.Node> | undefined, requireContext?: boolean);
    visitElement(element: html.Element, context: any): any;
    visitAttribute(attribute: html.Attribute, context: any): any;
    visitText(text: html.Text, context: SiblingVisitorContext | null): any;
    visitComment(comment: html.Comment, context: any): any;
    visitExpansion(expansion: html.Expansion, context: any): any;
    visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any;
    visitBlock(block: html.Block, context: any): any;
    visitBlockParameter(parameter: html.BlockParameter, context: any): html.BlockParameter;
    visitLetDeclaration(decl: html.LetDeclaration, context: any): html.LetDeclaration;
    visitComponent(node: html.Component, context: any): any;
    visitDirective(directive: html.Directive, context: any): html.Directive;
    visit(_node: html.Node, context: any): boolean;
}
export declare function removeWhitespaces(htmlAstWithErrors: ParseTreeResult, preserveSignificantWhitespace: boolean): ParseTreeResult;
interface SiblingVisitorContext {
    prev: html.Node | undefined;
    next: html.Node | undefined;
}
export declare function visitAllWithSiblings(visitor: WhitespaceVisitor, nodes: html.Node[]): any[];
export {};
