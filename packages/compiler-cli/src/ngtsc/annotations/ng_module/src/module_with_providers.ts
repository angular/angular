/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {Reference} from '../../../imports';
import {ForeignFunctionResolver, SyntheticValue} from '../../../partial_evaluator';
import {ClassDeclaration, isNamedClassDeclaration, ReflectionHost, typeNodeToValueExpr} from '../../../reflection';

/**
 * Creates a foreign function resolver to detect a `ModuleWithProviders<T>` type in a return type
 * position of a function or method declaration. A `SyntheticValue` is produced if such a return
 * type is recognized.
 *
 * @param reflector The reflection host to use for analyzing the syntax.
 * @param isCore Whether the @angular/core package is being compiled.
 */
export function createModuleWithProvidersResolver(
    reflector: ReflectionHost, isCore: boolean): ForeignFunctionResolver {
  /**
   * Retrieve an `NgModule` identifier (T) from the specified `type`, if it is of the form:
   * `ModuleWithProviders<T>`
   * @param type The type to reflect on.
   * @returns the identifier of the NgModule type if found, or null otherwise.
   */
  function _reflectModuleFromTypeParam(
      type: ts.TypeNode,
      node: ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression): ts.Expression|null {
    // Examine the type of the function to see if it's a ModuleWithProviders reference.
    if (!ts.isTypeReferenceNode(type)) {
      return null;
    }

    const typeName = type &&
            (ts.isIdentifier(type.typeName) && type.typeName ||
             ts.isQualifiedName(type.typeName) && type.typeName.right) ||
        null;
    if (typeName === null) {
      return null;
    }

    // Look at the type itself to see where it comes from.
    const id = reflector.getImportOfIdentifier(typeName);

    // If it's not named ModuleWithProviders, bail.
    if (id === null || id.name !== 'ModuleWithProviders') {
      return null;
    }

    // If it's not from @angular/core, bail.
    if (!isCore && id.from !== '@angular/core') {
      return null;
    }

    // If there's no type parameter specified, bail.
    if (type.typeArguments === undefined || type.typeArguments.length !== 1) {
      const parent =
          ts.isMethodDeclaration(node) && ts.isClassDeclaration(node.parent) ? node.parent : null;
      const symbolName = (parent && parent.name ? parent.name.getText() + '.' : '') +
          (node.name ? node.name.getText() : 'anonymous');
      throw new FatalDiagnosticError(
          ErrorCode.NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC, type,
          `${symbolName} returns a ModuleWithProviders type without a generic type argument. ` +
              `Please add a generic type argument to the ModuleWithProviders type. If this ` +
              `occurrence is in library code you don't control, please contact the library authors.`);
    }

    const arg = type.typeArguments[0];

    return typeNodeToValueExpr(arg);
  }

  /**
   * Retrieve an `NgModule` identifier (T) from the specified `type`, if it is of the form:
   * `A|B|{ngModule: T}|C`.
   * @param type The type to reflect on.
   * @returns the identifier of the NgModule type if found, or null otherwise.
   */
  function _reflectModuleFromLiteralType(type: ts.TypeNode): ts.Expression|null {
    if (!ts.isIntersectionTypeNode(type)) {
      return null;
    }
    for (const t of type.types) {
      if (ts.isTypeLiteralNode(t)) {
        for (const m of t.members) {
          const ngModuleType = ts.isPropertySignature(m) && ts.isIdentifier(m.name) &&
                  m.name.text === 'ngModule' && m.type ||
              null;
          const ngModuleExpression = ngModuleType && typeNodeToValueExpr(ngModuleType);
          if (ngModuleExpression) {
            return ngModuleExpression;
          }
        }
      }
    }
    return null;
  }

  return (fn, callExpr, resolve, unresolvable) => {
    const rawType = fn.node.type;
    if (rawType === undefined) {
      return unresolvable;
    }

    const type =
        _reflectModuleFromTypeParam(rawType, fn.node) ?? _reflectModuleFromLiteralType(rawType);
    if (type === null) {
      return unresolvable;
    }
    const ngModule = resolve(type);
    if (!(ngModule instanceof Reference) || !isNamedClassDeclaration(ngModule.node)) {
      return unresolvable;
    }

    return new SyntheticValue({
      ngModule: ngModule as Reference<ClassDeclaration>,
      mwpCall: callExpr,
    });
  };
}

export interface ResolvedModuleWithProviders {
  ngModule: Reference<ClassDeclaration>;
  mwpCall: ts.CallExpression;
}

export function isResolvedModuleWithProviders(sv: SyntheticValue<unknown>):
    sv is SyntheticValue<ResolvedModuleWithProviders> {
  return typeof sv.value === 'object' && sv.value != null &&
      sv.value.hasOwnProperty('ngModule' as keyof ResolvedModuleWithProviders) &&
      sv.value.hasOwnProperty('mwpCall' as keyof ResolvedModuleWithProviders);
}
