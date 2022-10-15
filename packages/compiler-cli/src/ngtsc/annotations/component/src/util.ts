/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationTriggerNames} from '@angular/compiler';
import {isResolvedModuleWithProviders, ResolvedModuleWithProviders,} from '@angular/compiler-cli/src/ngtsc/annotations/ng_module';
import {ErrorCode, makeDiagnostic} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import ts from 'typescript';

import {Reference} from '../../../imports';
import {ForeignFunctionResolver, ResolvedValue, ResolvedValueMap, SyntheticValue} from '../../../partial_evaluator';
import {ClassDeclaration, isNamedClassDeclaration} from '../../../reflection';
import {createValueHasWrongTypeError, getOriginNodeForDiagnostics} from '../../common';

/**
 * Collect the animation names from the static evaluation result.
 * @param value the static evaluation result of the animations
 * @param animationTriggerNames the animation names collected and whether some names could not be
 *     statically evaluated.
 */
export function collectAnimationNames(
    value: ResolvedValue, animationTriggerNames: AnimationTriggerNames) {
  if (value instanceof Map) {
    const name = value.get('name');
    if (typeof name === 'string') {
      animationTriggerNames.staticTriggerNames.push(name);
    } else {
      animationTriggerNames.includesDynamicAnimations = true;
    }
  } else if (Array.isArray(value)) {
    for (const resolvedValue of value) {
      collectAnimationNames(resolvedValue, animationTriggerNames);
    }
  } else {
    animationTriggerNames.includesDynamicAnimations = true;
  }
}

export function isAngularAnimationsReference(reference: Reference, symbolName: string): boolean {
  return reference.ownedByModuleGuess === '@angular/animations' &&
      reference.debugName === symbolName;
}

export const animationTriggerResolver: ForeignFunctionResolver =
    (fn, node, resolve, unresolvable) => {
      const animationTriggerMethodName = 'trigger';
      if (!isAngularAnimationsReference(fn, animationTriggerMethodName)) {
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

export function validateAndFlattenComponentImports(imports: ResolvedValue, expr: ts.Expression): {
  imports: Reference<ClassDeclaration>[],
  diagnostics: ts.Diagnostic[],
} {
  const flattened: Reference<ClassDeclaration>[] = [];

  if (!Array.isArray(imports)) {
    const error = createValueHasWrongTypeError(
                      expr, imports,
                      `'imports' must be an array of components, directives, pipes, or NgModules.`)
                      .toDiagnostic();
    return {
      imports: [],
      diagnostics: [error],
    };
  }
  const diagnostics: ts.Diagnostic[] = [];

  for (const ref of imports) {
    if (Array.isArray(ref)) {
      const {imports: childImports, diagnostics: childDiagnostics} =
          validateAndFlattenComponentImports(ref, expr);
      flattened.push(...childImports);
      diagnostics.push(...childDiagnostics);
    } else if (ref instanceof Reference) {
      if (isNamedClassDeclaration(ref.node)) {
        flattened.push(ref as Reference<ClassDeclaration>);
      } else {
        diagnostics.push(
            createValueHasWrongTypeError(
                ref.getOriginForDiagnostics(expr), ref,
                `'imports' must be an array of components, directives, pipes, or NgModules.`)
                .toDiagnostic());
      }
    } else if (isLikelyModuleWithProviders(ref)) {
      let origin = expr;
      if (ref instanceof SyntheticValue) {
        // The `ModuleWithProviders` type originated from a foreign function declaration, in which
        // case the original foreign call is available which is used to get a more accurate origin
        // node that points at the specific call expression.
        origin = getOriginNodeForDiagnostics(ref.value.mwpCall, expr);
      }
      diagnostics.push(makeDiagnostic(
          ErrorCode.COMPONENT_UNKNOWN_IMPORT, origin,
          `'imports' contains a ModuleWithProviders value, likely the result of a 'Module.forRoot()'-style call. ` +
              `These calls are not used to configure components and are not valid in standalone component imports - ` +
              `consider importing them in the application bootstrap instead.`));
    } else {
      diagnostics.push(
          createValueHasWrongTypeError(
              expr, imports,
              `'imports' must be an array of components, directives, pipes, or NgModules.`)
              .toDiagnostic());
    }
  }

  return {imports: flattened, diagnostics};
}

/**
 * Inspects `value` to determine if it resembles a `ModuleWithProviders` value. This is an
 * approximation only suitable for error reporting as any resolved object with an `ngModule`
 * key is considered a `ModuleWithProviders`.
 */
function isLikelyModuleWithProviders(value: ResolvedValue):
    value is SyntheticValue<ResolvedModuleWithProviders>|ResolvedValueMap {
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
