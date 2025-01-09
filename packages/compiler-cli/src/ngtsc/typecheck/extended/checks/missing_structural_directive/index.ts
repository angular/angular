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
 * The list of known control flow directives present in the `CommonModule`.
 *
 * If these control flow directives are missing they will be reported by a separate diagnostic.
 */
export const KNOWN_CONTROL_FLOW_DIRECTIVES = new Set([
  'ngIf',
  'ngFor',
  'ngSwitch',
  'ngSwitchCase',
  'ngSwitchDefault',
]);

/**
 * Ensures that there are no structural directives (something like *select or *featureFlag)
 * used in a template of a *standalone* component without importing the directive. Returns
 * diagnostics in case such a directive is detected.
 *
 * Note: this check only handles the cases when structural directive syntax is used (e.g. `*featureFlag`).
 * Regular binding syntax (e.g. `[featureFlag]`) is handled separately in type checker and treated as a
 * hard error instead of a warning.
 */
class MissingStructuralDirectiveCheck extends TemplateCheckWithVisitor<ErrorCode.MISSING_STRUCTURAL_DIRECTIVE> {
  override code = ErrorCode.MISSING_STRUCTURAL_DIRECTIVE as const;

  override run(
    ctx: TemplateContext<ErrorCode.MISSING_STRUCTURAL_DIRECTIVE>,
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
    ctx: TemplateContext<ErrorCode.MISSING_STRUCTURAL_DIRECTIVE>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.MISSING_STRUCTURAL_DIRECTIVE>[] {
    if (!(node instanceof TmplAstTemplate)) return [];

    const customStructuralDirective = node.templateAttrs.find(
      (attr) => !KNOWN_CONTROL_FLOW_DIRECTIVES.has(attr.name),
    );
    if (!customStructuralDirective) return [];

    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
    if (symbol === null || symbol.directives.length > 0) {
      return [];
    }

    const sourceSpan = customStructuralDirective.keySpan || customStructuralDirective.sourceSpan;
    const errorMessage =
      `An unknown structural directive \`${customStructuralDirective.name}\` was used in the template, ` +
      `without a corresponding import in the component. ` +
      `Make sure that the directive is included in the \`@Component.imports\` array of this component.`;
    const diagnostic = ctx.makeTemplateDiagnostic(sourceSpan, errorMessage);
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.MISSING_STRUCTURAL_DIRECTIVE,
  ExtendedTemplateDiagnosticName.MISSING_STRUCTURAL_DIRECTIVE
> = {
  code: ErrorCode.MISSING_STRUCTURAL_DIRECTIVE,
  name: ExtendedTemplateDiagnosticName.MISSING_STRUCTURAL_DIRECTIVE,
  create: (options: NgCompilerOptions) => {
    return new MissingStructuralDirectiveCheck();
  },
};
