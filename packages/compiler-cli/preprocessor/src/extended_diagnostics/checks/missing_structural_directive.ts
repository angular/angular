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
 * The list of known control flow directives present in the `CommonModule`.
 *
 * If these control flow directives are missing they will be reported by a separate diagnostic.
 */
export const KNOWN_CONTROL_FLOW_DIRECTIVES = new Set([
  'ngIf',
  'ngFor',
  'ngForOf',
  'ngForTrackBy',
  'ngSwitchCase',
  'ngSwitchDefault',
  'ngIfThen',
  'ngIfElse',
]);

/**
 * Ensures that there are no structural directives (something like *select or *featureFlag)
 * used in a template of a *standalone* component without importing the directive.
 *
 * Mirrors `MissingStructuralDirectiveCheck` in
 * `ngtsc/typecheck/extended/checks/missing_structural_directive/index.ts`.
 */
class MissingStructuralDirectiveCheck extends TemplateCheckWithVisitor<8116> {
  override code = 8116 as const;

  override run(
    ctx: TemplateContext<8116>,
    component: TcbTargetInput,
    template: TmplAstNode[],
  ): Diagnostic[] {
    if (!component.isStandalone) {
      return [];
    }
    return super.run(ctx, component, template);
  }

  override visitNode(
    ctx: TemplateContext<8116>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstTemplate)) return [];

    // Return nothing if all nested control flow directives are imported, as any missing values in the
    // KNOWN_CONTROL_FLOW_DIRECTIVES set will be caught by the missing_control_flow_directive check.
    const customStructuralDirective = node.templateAttrs.find(
      (attr) => !KNOWN_CONTROL_FLOW_DIRECTIVES.has(attr.name),
    );
    if (!customStructuralDirective) return [];

    // Filter out the directives that aren't structural ones. For example if someone writes `<div *customDir class="foo">`
    // and defines a directive with selector `.foo`, the directive will still be added to the node's directives list.
    const matchingDirs = ctx.boundTarget.getDirectivesOfNode(node);
    const hasStructuralDirective = matchingDirs?.some((dir) =>
      dir.selector?.includes(`[${customStructuralDirective.name}]`),
    );
    if (hasStructuralDirective) return [];

    const sourceSpan = customStructuralDirective.keySpan || customStructuralDirective.sourceSpan;
    const errorMessage = formatExtendedError(
      8116,
      `A structural directive \`${customStructuralDirective.name}\` was used in the template ` +
        `without a corresponding import in the component. ` +
        `Make sure that the directive is included in the \`@Component.imports\` array of this component.`,
    );

    return [ctx.makeTemplateDiagnostic(sourceSpan, errorMessage)];
  }
}

export const factory: TemplateCheckFactory<8116, 'missingStructuralDirective'> = {
  code: 8116,
  name: 'missingStructuralDirective',
  create: () => new MissingStructuralDirectiveCheck(),
};
