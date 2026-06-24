/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerOptions} from '../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * The list of known control flow directives present in the `CommonModule`,
 * and their corresponding imports.
 *
 * Note: there is no `ngSwitch` here since it's typically used as a regular
 * binding (e.g. `[ngSwitch]`), however the `ngSwitchCase` and `ngSwitchDefault`
 * are used as structural directives and a warning would be generated. Once the
 * `CommonModule` is included, the `ngSwitch` would also be covered.
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
 * Note: this check only handles the cases when structural directive syntax is used (e.g. `*ngIf`).
 * Regular binding syntax (e.g. `[ngIf]`) is handled separately in type checker and treated as a
 * hard error instead of a warning.
 */
class MissingControlFlowDirectiveCheck extends TemplateCheckWithVisitor<ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE> {
  override code = ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE as const;

  override run(
    ctx: TemplateContext<ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE>,
    component: ts.ClassDeclaration,
    template: TmplAstNode[],
  ) {
    const componentMetadata = ctx.templateTypeChecker.getDirectiveMetadata(component);
    // Avoid running this check for non-standalone components.
    if (!componentMetadata || !componentMetadata.isStandalone) {
      return [];
    }
    return super.run(ctx, component, template);
  }

  override visitNode(
    ctx: TemplateContext<ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE>[] {
    if (!(node instanceof TmplAstTemplate)) return [];

    const controlFlowAttr = node.templateAttrs.find((attr) =>
      KNOWN_CONTROL_FLOW_DIRECTIVES.has(attr.name),
    );
    if (!controlFlowAttr) return [];

    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
    if (symbol === null || symbol.directives.length > 0) {
      return [];
    }

    const sourceSpan = controlFlowAttr.keySpan || controlFlowAttr.sourceSpan;
    const directiveAndBuiltIn = KNOWN_CONTROL_FLOW_DIRECTIVES.get(controlFlowAttr.name);
    const errorMessage =
      `The \`*${controlFlowAttr.name}\` directive was used in the template, ` +
      `but neither the \`${directiveAndBuiltIn?.directive}\` directive nor the \`CommonModule\` was imported. ` +
      `Use Angular's built-in control flow ${directiveAndBuiltIn?.builtIn} or ` +
      `make sure that either the \`${directiveAndBuiltIn?.directive}\` directive or the \`CommonModule\` ` +
      `is included in the \`@Component.imports\` array of this component.`;
    const diagnostic = ctx.makeTemplateDiagnostic(sourceSpan, errorMessage);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE,
  ExtendedTemplateDiagnosticName.MISSING_CONTROL_FLOW_DIRECTIVE
> = {
  code: ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE,
  name: ExtendedTemplateDiagnosticName.MISSING_CONTROL_FLOW_DIRECTIVE,
  create: (options: NgCompilerOptions) => {
    return new MissingControlFlowDirectiveCheck();
  },
};
