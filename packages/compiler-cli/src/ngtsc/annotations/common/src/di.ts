/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Expression, LiteralExpr, R3DependencyMetadata, WrappedNodeExpr} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeRelatedInformation} from '../../../diagnostics';
import {
  ClassDeclaration,
  CtorParameter,
  ReflectionHost,
  TypeValueReferenceKind,
  UnavailableValue,
  ValueUnavailableKind,
} from '../../../reflection';

import {isAngularCore, valueReferenceToExpression} from './util';

export type ConstructorDeps =
  | {
      deps: R3DependencyMetadata[];
    }
  | {
      deps: null;
      errors: ConstructorDepError[];
    };

export interface ConstructorDepError {
  index: number;
  param: CtorParameter;
  reason: UnavailableValue;
}

export function getConstructorDependencies(
  clazz: ClassDeclaration,
  reflector: ReflectionHost,
  isCore: boolean,
): ConstructorDeps | null {
  const deps: R3DependencyMetadata[] = [];
  const errors: ConstructorDepError[] = [];
  let ctorParams = reflector.getConstructorParameters(clazz);
  if (ctorParams === null) {
    if (reflector.hasBaseClass(clazz)) {
      return null;
    } else {
      ctorParams = [];
    }
  }
  ctorParams.forEach((param, idx) => {
    let token = valueReferenceToExpression(param.typeValueReference);

    let attributeNameType: Expression | null = null;
    let optional = false,
      self = false,
      skipSelf = false,
      host = false;

    (param.decorators || [])
      .filter((dec) => isCore || isAngularCore(dec))
      .forEach((dec) => {
        const name = isCore || dec.import === null ? dec.name : dec.import!.name;
        if (name === 'Inject') {
          if (dec.args === null || dec.args.length !== 1) {
            throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG,
              dec.node,
              `Unexpected number of arguments to @Inject().`,
            );
          }
          token = new WrappedNodeExpr(dec.args[0]);
        } else if (name === 'Optional') {
          optional = true;
        } else if (name === 'SkipSelf') {
          skipSelf = true;
        } else if (name === 'Self') {
          self = true;
        } else if (name === 'Host') {
          host = true;
        } else if (name === 'Attribute') {
          if (dec.args === null || dec.args.length !== 1) {
            throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG,
              dec.node,
              `Unexpected number of arguments to @Attribute().`,
            );
          }
          const attributeName = dec.args[0];
          token = new WrappedNodeExpr(attributeName);
          if (ts.isStringLiteralLike(attributeName)) {
            attributeNameType = new LiteralExpr(attributeName.text);
          } else {
            attributeNameType = new WrappedNodeExpr(
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            );
          }
        } else {
          throw new FatalDiagnosticError(
            ErrorCode.DECORATOR_UNEXPECTED,
            dec.node,
            `Unexpected decorator ${name} on parameter.`,
          );
        }
      });

    if (token === null) {
      if (param.typeValueReference.kind !== TypeValueReferenceKind.UNAVAILABLE) {
        throw new Error(
          'Illegal state: expected value reference to be unavailable if no token is present',
        );
      }
      errors.push({
        index: idx,
        param,
        reason: param.typeValueReference.reason,
      });
    } else {
      deps.push({token, attributeNameType, optional, self, skipSelf, host});
    }
  });

  if (errors.length === 0) {
    return {deps};
  } else {
    return {deps: null, errors};
  }
}

/**
 * Convert `ConstructorDeps` into the `R3DependencyMetadata` array for those deps if they're valid,
 * or into an `'invalid'` signal if they're not.
 *
 * This is a companion function to `validateConstructorDependencies` which accepts invalid deps.
 */
export function unwrapConstructorDependencies(
  deps: ConstructorDeps | null,
): R3DependencyMetadata[] | 'invalid' | null {
  if (deps === null) {
    return null;
  } else if (deps.deps !== null) {
    // These constructor dependencies are valid.
    return deps.deps;
  } else {
    // These deps are invalid.
    return 'invalid';
  }
}

export function getValidConstructorDependencies(
  clazz: ClassDeclaration,
  reflector: ReflectionHost,
  isCore: boolean,
): R3DependencyMetadata[] | null {
  return validateConstructorDependencies(
    clazz,
    getConstructorDependencies(clazz, reflector, isCore),
  );
}

/**
 * Validate that `ConstructorDeps` does not have any invalid dependencies and convert them into the
 * `R3DependencyMetadata` array if so, or raise a diagnostic if some deps are invalid.
 *
 * This is a companion function to `unwrapConstructorDependencies` which does not accept invalid
 * deps.
 */
export function validateConstructorDependencies(
  clazz: ClassDeclaration,
  deps: ConstructorDeps | null,
): R3DependencyMetadata[] | null {
  if (deps === null) {
    return null;
  } else if (deps.deps !== null) {
    return deps.deps;
  } else {
    // There is at least one error.
    const error = deps.errors[0];
    throw createUnsuitableInjectionTokenError(clazz, error);
  }
}

/**
 * Creates a fatal error with diagnostic for an invalid injection token.
 * @param clazz The class for which the injection token was unavailable.
 * @param error The reason why no valid injection token is available.
 */
function createUnsuitableInjectionTokenError(
  clazz: ClassDeclaration,
  error: ConstructorDepError,
): FatalDiagnosticError {
  const {param, index, reason} = error;
  let chainMessage: string | undefined = undefined;
  let hints: ts.DiagnosticRelatedInformation[] | undefined = undefined;
  switch (reason.kind) {
    case ValueUnavailableKind.UNSUPPORTED:
      chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(reason.typeNode, 'This type is not supported as injection token.'),
      ];
      break;
    case ValueUnavailableKind.NO_VALUE_DECLARATION:
      chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(
          reason.typeNode,
          'This type does not have a value, so it cannot be used as injection token.',
        ),
      ];
      if (reason.decl !== null) {
        hints.push(makeRelatedInformation(reason.decl, 'The type is declared here.'));
      }
      break;
    case ValueUnavailableKind.TYPE_ONLY_IMPORT:
      chainMessage =
        'Consider changing the type-only import to a regular import, or use the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(
          reason.typeNode,
          'This type is imported using a type-only import, which prevents it from being usable as an injection token.',
        ),
        makeRelatedInformation(reason.node, 'The type-only import occurs here.'),
      ];
      break;
    case ValueUnavailableKind.NAMESPACE:
      chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(
          reason.typeNode,
          'This type corresponds with a namespace, which cannot be used as injection token.',
        ),
        makeRelatedInformation(reason.importClause, 'The namespace import occurs here.'),
      ];
      break;
    case ValueUnavailableKind.UNKNOWN_REFERENCE:
      chainMessage = 'The type should reference a known declaration.';
      hints = [makeRelatedInformation(reason.typeNode, 'This type could not be resolved.')];
      break;
    case ValueUnavailableKind.MISSING_TYPE:
      chainMessage =
        'Consider adding a type to the parameter or use the @Inject decorator to specify an injection token.';
      break;
  }

  const chain: ts.DiagnosticMessageChain = {
    messageText: `No suitable injection token for parameter '${param.name || index}' of class '${
      clazz.name.text
    }'.`,
    category: ts.DiagnosticCategory.Error,
    code: 0,
    next: [
      {
        messageText: chainMessage,
        category: ts.DiagnosticCategory.Message,
        code: 0,
      },
    ],
  };

  return new FatalDiagnosticError(ErrorCode.PARAM_MISSING_TOKEN, param.nameNode, chain, hints);
}
