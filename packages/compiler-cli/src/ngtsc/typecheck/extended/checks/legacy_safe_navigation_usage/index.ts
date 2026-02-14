/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, SafeCall, SafeKeyedRead, SafePropertyRead, TmplAstNode} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerOptions} from '../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * Warns when safe navigation (`?.`) is used in a template that still uses legacy
 * semantics (returning `null` on short-circuit instead of `undefined`).
 *
 * This diagnostic helps developers identify `?.` usage that will behave differently
 * after enabling `nativeOptionalChainingSemantics: true`. It is off by default and
 * must be explicitly enabled via `extendedDiagnostics` configuration:
 *
 * ```json
 * {
 *   "angularCompilerOptions": {
 *     "extendedDiagnostics": {
 *       "checks": {
 *         "legacySafeNavigationUsage": "warning"
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * Once all flagged expressions have been reviewed and the migration applied,
 * the developer can enable `nativeOptionalChainingSemantics: true` and remove
 * this diagnostic.
 */
class LegacySafeNavigationUsageCheck extends TemplateCheckWithVisitor<ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE> {
  override code = ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE>[] {
    if (
      !(node instanceof SafeCall) &&
      !(node instanceof SafePropertyRead) &&
      !(node instanceof SafeKeyedRead)
    ) {
      return [];
    }

    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
    if (symbol === null) {
      return [];
    }

    if (!('tcbLocation' in symbol)) {
      return [];
    }

    const templateMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
      symbol.tcbLocation,
    );
    if (templateMapping === null) {
      return [];
    }

    const diagnostic = ctx.makeTemplateDiagnostic(
      templateMapping.span,
      `This safe navigation expression uses legacy Angular semantics (returns 'null' on short-circuit). ` +
        `With 'nativeOptionalChainingSemantics' enabled, it would return 'undefined' instead, ` +
        `matching native ECMAScript optional chaining behavior. ` +
        `Run the optional chaining migration to auto-convert simple property chains, ` +
        `or manually verify this expression before enabling native semantics.`,
    );
    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE,
  ExtendedTemplateDiagnosticName.LEGACY_SAFE_NAVIGATION_USAGE
> = {
  code: ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE,
  name: ExtendedTemplateDiagnosticName.LEGACY_SAFE_NAVIGATION_USAGE,
  create: (options: NgCompilerOptions) => {
    // Only report when the project is NOT yet using native semantics.
    // If nativeOptionalChainingSemantics is already enabled, the diagnostic is not needed.
    if (options.nativeOptionalChainingSemantics) {
      return null;
    }
    return new LegacySafeNavigationUsageCheck();
  },
};
