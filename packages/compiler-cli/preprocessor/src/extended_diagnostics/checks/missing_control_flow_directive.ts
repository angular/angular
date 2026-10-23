/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

/**
 * The list of known control flow directives present in the `CommonModule`,
 * and their corresponding imports.
 */
export const KNOWN_CONTROL_FLOW_DIRECTIVES = new Map([
  ['ngIf', {directive: 'NgIf', builtIn: '@if'}],
  ['ngFor', {directive: 'NgFor', builtIn: '@for'}],
  ['ngSwitchCase', {directive: 'NgSwitchCase', builtIn: '@switch with @case'}],
  ['ngSwitchDefault', {directive: 'NgSwitchDefault', builtIn: '@switch with @default'}],
]);

/**
 * Ensures that there are no known control flow directives (such as *ngIf and *ngFor)
 * used in a template of a *standalone* component without importing a `CommonModule`. Returns
 * diagnostics in case such a directive is detected.
 *
 * Mirrors `MissingControlFlowDirectiveCheck` in
 * `ngtsc/typecheck/extended/checks/missing_control_flow_directive/index.ts`.
 */
class MissingControlFlowDirectiveCheck extends TemplateCheckWithVisitor<8103> {
  override code = 8103 as const;

  override run(
    ctx: TemplateContext<8103>,
    component: TcbTargetInput,
    template: TmplAstNode[],
  ): Diagnostic[] {
    if (!component.isStandalone) {
      return [];
    }
    return super.run(ctx, component, template);
  }

  override visitNode(
    ctx: TemplateContext<8103>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstTemplate)) return [];

    const controlFlowAttr = node.templateAttrs.find((attr) =>
      KNOWN_CONTROL_FLOW_DIRECTIVES.has(attr.name),
    );
    if (!controlFlowAttr) return [];

    const matchingDirs = ctx.boundTarget.getDirectivesOfNode(node);
    if (matchingDirs && matchingDirs.length > 0) {
      return [];
    }

    const sourceSpan = controlFlowAttr.keySpan || controlFlowAttr.sourceSpan;
    const directiveAndBuiltIn = KNOWN_CONTROL_FLOW_DIRECTIVES.get(controlFlowAttr.name);
    const errorMessage = formatExtendedError(
      8103,
      `The \`*${controlFlowAttr.name}\` directive was used in the template, ` +
        `but neither the \`${directiveAndBuiltIn?.directive}\` directive nor the \`CommonModule\` was imported. ` +
        `Use Angular's built-in control flow ${directiveAndBuiltIn?.builtIn} or ` +
        `make sure that either the \`${directiveAndBuiltIn?.directive}\` directive or the \`CommonModule\` ` +
        `is included in the \`@Component.imports\` array of this component.`,
    );

    return [ctx.makeTemplateDiagnostic(sourceSpan, errorMessage)];
  }
}

export const factory: TemplateCheckFactory<8103, 'missingControlFlowDirective'> = {
  code: 8103,
  name: 'missingControlFlowDirective',
  create: () => new MissingControlFlowDirectiveCheck(),
};
