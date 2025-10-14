/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AST, RecursiveAstVisitor } from './expression_parser/ast';
import * as t from './render3/r3_ast';
/**
 * Visitor that traverses all template and expression AST nodes in a template.
 * Useful for cases where every single node needs to be visited.
 */
export declare class CombinedRecursiveAstVisitor extends RecursiveAstVisitor implements t.RecursiveVisitor {
    visit(node: AST | t.Node): void;
    visitElement(element: t.Element): void;
    visitTemplate(template: t.Template): void;
    visitContent(content: t.Content): void;
    visitBoundAttribute(attribute: t.BoundAttribute): void;
    visitBoundEvent(attribute: t.BoundEvent): void;
    visitBoundText(text: t.BoundText): void;
    visitIcu(icu: t.Icu): void;
    visitDeferredBlock(deferred: t.DeferredBlock): void;
    visitDeferredTrigger(trigger: t.DeferredTrigger): void;
    visitDeferredBlockPlaceholder(block: t.DeferredBlockPlaceholder): void;
    visitDeferredBlockError(block: t.DeferredBlockError): void;
    visitDeferredBlockLoading(block: t.DeferredBlockLoading): void;
    visitSwitchBlock(block: t.SwitchBlock): void;
    visitSwitchBlockCase(block: t.SwitchBlockCase): void;
    visitForLoopBlock(block: t.ForLoopBlock): void;
    visitForLoopBlockEmpty(block: t.ForLoopBlockEmpty): void;
    visitIfBlock(block: t.IfBlock): void;
    visitIfBlockBranch(block: t.IfBlockBranch): void;
    visitLetDeclaration(decl: t.LetDeclaration): void;
    visitComponent(component: t.Component): void;
    visitDirective(directive: t.Directive): void;
    visitVariable(variable: t.Variable): void;
    visitReference(reference: t.Reference): void;
    visitTextAttribute(attribute: t.TextAttribute): void;
    visitText(text: t.Text): void;
    visitUnknownBlock(block: t.UnknownBlock): void;
    protected visitAllTemplateNodes(nodes: t.Node[]): void;
}
