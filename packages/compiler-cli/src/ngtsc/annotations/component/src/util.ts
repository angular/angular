/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationTriggerNames} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../../imports';
import {ForeignFunctionResolver, ResolvedValue} from '../../../partial_evaluator';
import {ClassDeclaration, isNamedClassDeclaration} from '../../../reflection';
import {createValueHasWrongTypeError} from '../../common';

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

export const animationTriggerResolver: ForeignFunctionResolver = (ref, args) => {
  const animationTriggerMethodName = 'trigger';
  if (!isAngularAnimationsReference(ref, animationTriggerMethodName)) {
    return null;
  }
  const triggerNameExpression = args[0];
  if (!triggerNameExpression) {
    return null;
  }
  const factory = ts.factory;
  return factory.createObjectLiteralExpression(
      [
        factory.createPropertyAssignment(factory.createIdentifier('name'), triggerNameExpression),
      ],
      true);
};

export function validateAndFlattenComponentImports(imports: ResolvedValue, expr: ts.Expression): {
  imports: Reference<ClassDeclaration>[],
  diagnostics: ts.Diagnostic[],
} {
  const flattened: Reference<ClassDeclaration>[] = [];

  if (!Array.isArray(imports)) {
    const error = createValueHasWrongTypeError(
                      expr, imports,
                      `'imports' must be an array of components, directives, pipes, or NgModules`)
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
                `'imports' must be an array of components, directives, pipes, or NgModules`)
                .toDiagnostic());
      }
    } else {
      diagnostics.push(
          createValueHasWrongTypeError(
              expr, imports,
              `'imports' must be an array of components, directives, pipes, or NgModules`)
              .toDiagnostic());
    }
  }

  return {imports: flattened, diagnostics};
}
