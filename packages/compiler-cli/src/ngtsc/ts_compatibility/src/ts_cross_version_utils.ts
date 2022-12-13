/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/** Whether the current TypeScript version is after 4.9. */
const IS_AFTER_TS_49 = isAfterVersion(4, 9);

/** Type of `ts.factory.CreateParameterDeclaration` in TS 4.9+. */
type Ts49CreateParameterDeclarationFn =
    (modifiers: readonly ts.ModifierLike[]|undefined, dotDotDotToken: ts.DotDotDotToken|undefined,
     name: string|ts.BindingName, questionToken?: ts.QuestionToken|undefined,
     type?: ts.TypeNode|undefined, initializer?: ts.Expression) => ts.ParameterDeclaration;

/**
 * Creates a `ts.ParameterDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export const createParameterDeclaration: Ts49CreateParameterDeclarationFn = IS_AFTER_TS_49 ?
    (ts.factory.createParameterDeclaration as any) :
    (modifiers, dotDotDotToken, name, questionToken, type, initializer) =>
        (ts.factory.createParameterDeclaration as any)(
            ...splitModifiers(modifiers), dotDotDotToken, name, questionToken, type, initializer);

/** Type of `ts.factory.createImportDeclaration` in TS 4.9+. */
type Ts49CreateImportDeclarationFn =
    (modifiers: readonly ts.Modifier[]|undefined, importClause: ts.ImportClause|undefined,
     moduleSpecifier: ts.Expression, assertClause?: ts.AssertClause) => ts.ImportDeclaration;

/**
 * Creates a `ts.ImportDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export const createImportDeclaration: Ts49CreateImportDeclarationFn = IS_AFTER_TS_49 ?
    (ts.factory.createImportDeclaration as any) :
    (modifiers, importClause, moduleSpecifier, assertClause) =>
        (ts.factory.createImportDeclaration as any)(
            undefined, modifiers, importClause, moduleSpecifier, assertClause);

/** Type of `ts.factory.createFunctionDeclaration` in TS 4.9+. */
type Ts49CreateFunctionDeclarationFn =
    (modifiers: readonly ts.ModifierLike[]|undefined, asteriskToken: ts.AsteriskToken|undefined,
     name: string|ts.Identifier|undefined,
     typeParameters: readonly ts.TypeParameterDeclaration[]|undefined,
     parameters: readonly ts.ParameterDeclaration[], type: ts.TypeNode|undefined,
     body: ts.Block|undefined) => ts.FunctionDeclaration;

/**
 * Creates a `ts.FunctionDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export const createFunctionDeclaration: Ts49CreateFunctionDeclarationFn = IS_AFTER_TS_49 ?
    (ts.factory.createFunctionDeclaration as any) :
    (modifiers, asteriskToken, name, typeParameters, parameters, type, body) => (
        ts.factory.createFunctionDeclaration as any)(
        ...splitModifiers(modifiers), asteriskToken, name, typeParameters, parameters, type, body);


/** Type of `ts.factory.createIndexSignature` in TS 4.9+. */
type Ts49CreateIndexSignatureFn =
    (modifiers: readonly ts.Modifier[]|undefined, parameters: readonly ts.ParameterDeclaration[],
     type: ts.TypeNode) => ts.IndexSignatureDeclaration;

/**
 * Creates a `ts.IndexSignatureDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.9.
 * We should remove it once we have dropped support for the older versions.
 */
export const createIndexSignature: Ts49CreateIndexSignatureFn = IS_AFTER_TS_49 ?
    (ts.factory.createIndexSignature as any) :
    (modifiers, parameters, type) =>
        (ts.factory.createIndexSignature as any)(modifiers, parameters, type);

/**
 * Splits a `ModifierLike` into two arrays: decorators and modifiers. Used for backwards
 * compatibility with TS 4.7 and below where most factory functions require separate `decorators`
 * and `modifiers` arrays.
 */
function splitModifiers(allModifiers: readonly ts.ModifierLike[]|
                        undefined): [ts.Decorator[]|undefined, ts.Modifier[]|undefined] {
  if (!allModifiers) {
    return [undefined, undefined];
  }

  const decorators: ts.Decorator[] = [];
  const modifiers: ts.Modifier[] = [];

  for (const current of allModifiers) {
    if (ts.isDecorator(current)) {
      decorators.push(current);
    } else {
      modifiers.push(current);
    }
  }

  return [decorators.length ? decorators : undefined, modifiers.length ? modifiers : undefined];
}

/** Checks if the current version of TypeScript is after the specified major/minor versions. */
function isAfterVersion(targetMajor: number, targetMinor: number): boolean {
  const [major, minor] = ts.versionMajorMinor.split('.').map(part => parseInt(part));

  if (major < targetMajor) {
    return false;
  }

  return major === targetMajor ? minor >= targetMinor : true;
}
