/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LegacyAnimationTriggerNames} from '@angular/compiler';
import {isResolvedModuleWithProviders, ResolvedModuleWithProviders} from '../../ng_module';
import {ErrorCode, FatalDiagnosticError, makeDiagnostic} from '../../../diagnostics';
import ts from 'typescript';

import {Reference} from '../../../imports';
import {
  DynamicValue,
  ForeignFunctionResolver,
  ResolvedValue,
  ResolvedValueMap,
  SyntheticValue,
} from '../../../partial_evaluator';
import {ClassDeclaration, isNamedClassDeclaration} from '../../../reflection';
import {createValueHasWrongTypeError, getOriginNodeForDiagnostics} from '../../common';

/**
 * Collect the animation names from the static evaluation result.
 * @param value the static evaluation result of the animations
 * @param legacyAnimationTriggerNames the animation names collected and whether some names could not be
 *     statically evaluated.
 */
export function collectLegacyAnimationNames(
  value: ResolvedValue,
  legacyAnimationTriggerNames: LegacyAnimationTriggerNames,
) {
  if (value instanceof Map) {
    const name = value.get('name');
    if (typeof name === 'string') {
      legacyAnimationTriggerNames.staticTriggerNames.push(name);
    } else {
      legacyAnimationTriggerNames.includesDynamicAnimations = true;
    }
  } else if (Array.isArray(value)) {
    for (const resolvedValue of value) {
      collectLegacyAnimationNames(resolvedValue, legacyAnimationTriggerNames);
    }
  } else {
    legacyAnimationTriggerNames.includesDynamicAnimations = true;
  }
}

export function isLegacyAngularAnimationsReference(
  reference: Reference,
  symbolName: string,
): boolean {
  return (
    reference.ownedByModuleGuess === '@angular/animations' && reference.debugName === symbolName
  );
}

export const legacyAnimationTriggerResolver: ForeignFunctionResolver = (
  fn,
  node,
  resolve,
  unresolvable,
) => {
  const animationTriggerMethodName = 'trigger';
  if (!isLegacyAngularAnimationsReference(fn, animationTriggerMethodName)) {
    return unresolvable;
  }
  const triggerNameExpression = node.arguments[0];
  if (!triggerNameExpression) {
    return unresolvable;
  }
  const res = new Map<string, ResolvedValue>();
  res.set('name', resolve(triggerNameExpression));
  return res;
};

export function validateAndFlattenComponentImports(
  imports: ResolvedValue,
  expr: ts.Expression,
  isDeferred: boolean,
): {
  imports: Reference<ClassDeclaration>[];
  diagnostics: ts.Diagnostic[];
} {
  const flattened: Reference<ClassDeclaration>[] = [];
  const errorMessage = isDeferred
    ? `'deferredImports' must be an array of components, directives, or pipes.`
    : `'imports' must be an array of components, directives, pipes, or NgModules.`;
  if (!Array.isArray(imports)) {
    const error = createValueHasWrongTypeError(expr, imports, errorMessage).toDiagnostic();
    return {
      imports: [],
      diagnostics: [error],
    };
  }
  const diagnostics: ts.Diagnostic[] = [];

  for (let i = 0; i < imports.length; i++) {
    const ref = imports[i];
    let refExpr = expr;
    if (
      ts.isArrayLiteralExpression(expr) &&
      expr.elements.length === imports.length &&
      !expr.elements.some(ts.isSpreadAssignment)
    ) {
      refExpr = expr.elements[i];
    }

    if (Array.isArray(ref)) {
      const {imports: childImports, diagnostics: childDiagnostics} =
        validateAndFlattenComponentImports(ref, refExpr, isDeferred);
      flattened.push(...childImports);
      diagnostics.push(...childDiagnostics);
    } else if (ref instanceof Reference) {
      if (isNamedClassDeclaration(ref.node)) {
        flattened.push(ref as Reference<ClassDeclaration>);
      } else {
        diagnostics.push(
          createValueHasWrongTypeError(
            ref.getOriginForDiagnostics(expr),
            ref,
            errorMessage,
          ).toDiagnostic(),
        );
      }
    } else if (isLikelyModuleWithProviders(ref)) {
      let origin = expr;
      if (ref instanceof SyntheticValue) {
        // The `ModuleWithProviders` type originated from a foreign function declaration, in which
        // case the original foreign call is available which is used to get a more accurate origin
        // node that points at the specific call expression.
        origin = getOriginNodeForDiagnostics(ref.value.mwpCall, expr);
      }
      diagnostics.push(
        makeDiagnostic(
          ErrorCode.COMPONENT_UNKNOWN_IMPORT,
          origin,
          `Component imports contains a ModuleWithProviders value, likely the result of a 'Module.forRoot()'-style call. ` +
            `These calls are not used to configure components and are not valid in standalone component imports - ` +
            `consider importing them in the application bootstrap instead.`,
        ),
      );
    } else {
      let diagnosticNode: ts.Node;
      let diagnosticValue: ResolvedValue;

      // Reporting a diagnostic on the entire array can be noisy, especially if the user has a
      // large array. Attempt to determine the most accurate position within the `imports` expression to report the
      // diagnostic on.
      if (ref instanceof DynamicValue && isWithinExpression(ref.node, expr)) {
        // Use the dynamic value position itself if it occurs within the `imports` expression.
        diagnosticNode = ref.node;
        diagnosticValue = ref;
      } else if (refExpr !== expr) {
        // The reference comes from a specific element in `expr`, so use that element to report the diagnostic on.
        diagnosticNode = refExpr;
        diagnosticValue = ref;
      } else {
        diagnosticNode = expr;
        diagnosticValue = imports;
      }

      diagnostics.push(
        createValueHasWrongTypeError(diagnosticNode, diagnosticValue, errorMessage).toDiagnostic(),
      );
    }
  }

  return {imports: flattened, diagnostics};
}

function isWithinExpression(node: ts.Node, expr: ts.Expression): boolean {
  let current: ts.Node | undefined = node;
  while (current !== undefined) {
    if (current === expr) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Inspects `value` to determine if it resembles a `ModuleWithProviders` value. This is an
 * approximation only suitable for error reporting as any resolved object with an `ngModule`
 * key is considered a `ModuleWithProviders`.
 */
function isLikelyModuleWithProviders(
  value: ResolvedValue,
): value is SyntheticValue<ResolvedModuleWithProviders> | ResolvedValueMap {
  if (value instanceof SyntheticValue && isResolvedModuleWithProviders(value)) {
    // This is a `ModuleWithProviders` as extracted from a foreign function call.
    return true;
  }

  if (value instanceof Map && value.has('ngModule')) {
    // A resolved `Map` with `ngModule` property would have been extracted from locally declared
    // functions that return a `ModuleWithProviders` object.
    return true;
  }

  return false;
}
