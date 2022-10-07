/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/** Whether the current TypeScript version is after 4.8. */
const IS_AFTER_TS_48 = isAfterVersion(4, 8);

/** Equivalent of `ts.ModifierLike` which is only present in TS 4.8+. */
export type ModifierLike = ts.Modifier|ts.Decorator;

/** Type of `ts.factory.updateParameterDeclaration` in TS 4.8+. */
type Ts48UpdateParameterDeclarationFn =
    (node: ts.ParameterDeclaration, modifiers: readonly ModifierLike[]|undefined,
     dotDotDotToken: ts.DotDotDotToken|undefined, name: string|ts.BindingName,
     questionToken: ts.QuestionToken|undefined, type: ts.TypeNode|undefined,
     initializer: ts.Expression|undefined) => ts.ParameterDeclaration;

/**
 * Updates a `ts.ParameterDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updateParameterDeclaration: Ts48UpdateParameterDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updateParameterDeclaration as any) :
    (node, modifiers, dotDotDotToken, name, questionToken, type, initializer) => (
        ts.factory.updateParameterDeclaration as any)(
        node, ...splitModifiers(modifiers), dotDotDotToken, name, questionToken, type, initializer);

/** Type of `ts.factory.updateImportDeclaration` in TS 4.8+. */
type Ts48UpdateImportDeclarationFn =
    (node: ts.ImportDeclaration, modifiers: readonly ts.Modifier[]|undefined,
     importClause: ts.ImportClause|undefined, moduleSpecifier: ts.Expression,
     assertClause: ts.AssertClause|undefined) => ts.ImportDeclaration;

/**
 * Updates a `ts.ImportDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updateImportDeclaration: Ts48UpdateImportDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updateImportDeclaration as any) :
    (node, modifiers, importClause, moduleSpecifier, assertClause) =>
        (ts.factory.updateImportDeclaration as any)(
            node, undefined, modifiers, importClause, moduleSpecifier, assertClause);

/** Type of `ts.factory.updateClassDeclaration` in TS 4.8+. */
type Ts48UpdateClassDeclarationFn =
    (node: ts.ClassDeclaration, modifiers: readonly ModifierLike[]|undefined,
     name: ts.Identifier|undefined,
     typeParameters: readonly ts.TypeParameterDeclaration[]|undefined,
     heritageClauses: readonly ts.HeritageClause[]|undefined,
     members: readonly ts.ClassElement[]) => ts.ClassDeclaration;

/**
 * Updates a `ts.ClassDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updateClassDeclaration: Ts48UpdateClassDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updateClassDeclaration as any) :
    (node, combinedModifiers, name, typeParameters, heritageClauses, members) => (
        ts.factory.updateClassDeclaration as any)(
        node, ...splitModifiers(combinedModifiers), name, typeParameters, heritageClauses, members);

/** Type of `ts.factory.createClassDeclaration` in TS 4.8+. */
type Ts48CreateClassDeclarationFn =
    (modifiers: readonly ModifierLike[]|undefined, name: ts.Identifier|undefined,
     typeParameters: readonly ts.TypeParameterDeclaration[]|undefined,
     heritageClauses: readonly ts.HeritageClause[]|undefined,
     members: readonly ts.ClassElement[]) => ts.ClassDeclaration;

/**
 * Creates a `ts.ClassDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const createClassDeclaration: Ts48CreateClassDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.createClassDeclaration as any) :
    (combinedModifiers, name, typeParameters, heritageClauses, members) =>
        (ts.factory.createClassDeclaration as any)(
            ...splitModifiers(combinedModifiers), name, typeParameters, heritageClauses, members);

/** Type of `ts.factory.updateMethodDeclaration` in TS 4.8+. */
type Ts48UpdateMethodDeclarationFn =
    (node: ts.MethodDeclaration, modifiers: readonly ModifierLike[]|undefined,
     asteriskToken: ts.AsteriskToken|undefined, name: ts.PropertyName,
     questionToken: ts.QuestionToken|undefined,
     typeParameters: readonly ts.TypeParameterDeclaration[]|undefined,
     parameters: readonly ts.ParameterDeclaration[], type: ts.TypeNode|undefined,
     body: ts.Block|undefined) => ts.MethodDeclaration;

/**
 * Updates a `ts.MethodDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updateMethodDeclaration: Ts48UpdateMethodDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updateMethodDeclaration as any) :
    (node, modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body) =>
        (ts.factory.updateMethodDeclaration as any)(
            node, ...splitModifiers(modifiers), asteriskToken, name, questionToken, typeParameters,
            parameters, type, body);

/** Type of `ts.factory.createMethodDeclaration` in TS 4.8+. */
type Ts48CreateMethodDeclarationFn =
    (modifiers: readonly ModifierLike[]|undefined, asteriskToken: ts.AsteriskToken|undefined,
     name: ts.PropertyName, questionToken: ts.QuestionToken|undefined,
     typeParameters: readonly ts.TypeParameterDeclaration[]|undefined,
     parameters: readonly ts.ParameterDeclaration[], type: ts.TypeNode|undefined,
     body: ts.Block|undefined) => ts.MethodDeclaration;

/**
 * Creates a `ts.MethodDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const createMethodDeclaration: Ts48CreateMethodDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.createMethodDeclaration as any) :
    (modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body) =>
        (ts.factory.createMethodDeclaration as any)(
            ...splitModifiers(modifiers), asteriskToken, name, questionToken, typeParameters,
            parameters, type, body);

/** Type of `ts.factory.updatePropertyDeclaration` in TS 4.8+. */
type Ts48UpdatePropertyDeclarationFn =
    (node: ts.PropertyDeclaration, modifiers: readonly ModifierLike[]|undefined,
     name: string|ts.PropertyName,
     questionOrExclamationToken: ts.QuestionToken|ts.ExclamationToken|undefined,
     type: ts.TypeNode|undefined, initializer: ts.Expression|undefined) => ts.PropertyDeclaration;

/**
 * Updates a `ts.PropertyDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updatePropertyDeclaration: Ts48UpdatePropertyDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updatePropertyDeclaration as any) :
    (node, modifiers, name, questionOrExclamationToken, type, initializer) => (
        ts.factory.updatePropertyDeclaration as any)(
        node, ...splitModifiers(modifiers), name, questionOrExclamationToken, type, initializer);


/** Type of `ts.factory.createPropertyDeclaration` in TS 4.8+. */
type Ts48CreatePropertyDeclarationFn =
    (modifiers: readonly ModifierLike[]|undefined, name: string|ts.PropertyName,
     questionOrExclamationToken: ts.QuestionToken|ts.ExclamationToken|undefined,
     type: ts.TypeNode|undefined, initializer: ts.Expression|undefined) => ts.PropertyDeclaration;

/**
 * Creates a `ts.PropertyDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const createPropertyDeclaration: Ts48CreatePropertyDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.createPropertyDeclaration as any) :
    (modifiers, name, questionOrExclamationToken, type, initializer) =>
        (ts.factory.createPropertyDeclaration as any)(
            ...splitModifiers(modifiers), name, questionOrExclamationToken, type, initializer);

/** Type of `ts.factory.updateGetAccessorDeclaration` in TS 4.8+. */
type Ts48UpdateGetAccessorDeclarationFn =
    (node: ts.GetAccessorDeclaration, modifiers: readonly ModifierLike[]|undefined,
     name: ts.PropertyName, parameters: readonly ts.ParameterDeclaration[],
     type: ts.TypeNode|undefined, body: ts.Block|undefined) => ts.GetAccessorDeclaration;

/**
 * Updates a `ts.GetAccessorDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updateGetAccessorDeclaration: Ts48UpdateGetAccessorDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updateGetAccessorDeclaration as any) :
    (node, modifiers, name, parameters, type, body) =>
        (ts.factory.updateGetAccessorDeclaration as any)(
            node, ...splitModifiers(modifiers), name, parameters, type, body);

/** Type of `ts.factory.createGetAccessorDeclaration` in TS 4.8+. */
type Ts48CreateGetAccessorDeclarationFn =
    (modifiers: readonly ModifierLike[]|undefined, name: ts.PropertyName,
     parameters: readonly ts.ParameterDeclaration[], type: ts.TypeNode|undefined,
     body: ts.Block|undefined) => ts.GetAccessorDeclaration;

/**
 * Creates a `ts.GetAccessorDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const createGetAccessorDeclaration: Ts48CreateGetAccessorDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.createGetAccessorDeclaration as any) :
    (modifiers, name, parameters, type, body) => (ts.factory.createGetAccessorDeclaration as any)(
        ...splitModifiers(modifiers), name, parameters, type, body);

/** Type of `ts.factory.updateSetAccessorDeclaration` in TS 4.8+. */
type Ts48UpdateSetAccessorDeclarationFn =
    (node: ts.SetAccessorDeclaration, modifiers: readonly ModifierLike[]|undefined,
     name: ts.PropertyName, parameters: readonly ts.ParameterDeclaration[],
     body: ts.Block|undefined) => ts.SetAccessorDeclaration;

/**
 * Updates a `ts.GetAccessorDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updateSetAccessorDeclaration: Ts48UpdateSetAccessorDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updateSetAccessorDeclaration as any) :
    (node, modifiers, name, parameters, body) => (ts.factory.updateSetAccessorDeclaration as any)(
        node, ...splitModifiers(modifiers), name, parameters, body);

/** Type of `ts.factory.createSetAccessorDeclaration` in TS 4.8+. */
type Ts48CreateSetAccessorDeclarationFn =
    (modifiers: readonly ModifierLike[]|undefined, name: ts.PropertyName,
     parameters: readonly ts.ParameterDeclaration[], body: ts.Block|undefined) =>
        ts.SetAccessorDeclaration;

/**
 * Creates a `ts.GetAccessorDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const createSetAccessorDeclaration: Ts48CreateSetAccessorDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.createSetAccessorDeclaration as any) :
    (modifiers, name, parameters, body) => (ts.factory.createSetAccessorDeclaration as any)(
        ...splitModifiers(modifiers), name, parameters, body);

/** Type of `ts.factory.updateConstructorDeclaration` in TS 4.8+. */
type Ts48UpdateConstructorDeclarationFn =
    (node: ts.ConstructorDeclaration, modifiers: readonly ts.Modifier[]|undefined,
     parameters: readonly ts.ParameterDeclaration[], body: ts.Block|undefined) =>
        ts.ConstructorDeclaration;

/**
 * Updates a `ts.ConstructorDeclaration` declaration.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const updateConstructorDeclaration: Ts48UpdateConstructorDeclarationFn = IS_AFTER_TS_48 ?
    (ts.factory.updateConstructorDeclaration as any) :
    (node, modifiers, parameters, body) => (ts.factory.updateConstructorDeclaration as any)(
        node, undefined, modifiers, parameters, body);

/**
 * Gets the decorators that have been applied to a node.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const getDecorators: (node: ts.Node) => readonly ts.Decorator[] | undefined =
    IS_AFTER_TS_48 ? (ts as any).getDecorators : node => node.decorators;

/**
 * Gets the modifiers that have been set on a node.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export const getModifiers: (node: ts.Node) => readonly ts.Modifier[] | undefined =
    IS_AFTER_TS_48 ? (ts as any).getModifiers : node => node.modifiers;

/**
 * Combines an optional array of decorators with an optional array of modifiers into a single
 * `ts.ModifierLike` array. Used in version of TypeScript after 4.8 where the `decorators` and
 * `modifiers` arrays have been combined.
 *
 * TODO(crisbeto): this is a backwards-compatibility layer for versions of TypeScript less than 4.8.
 * We should remove it once we have dropped support for the older versions.
 */
export function combineModifiers(
    decorators: readonly ts.Decorator[]|undefined,
    modifiers: readonly ModifierLike[]|undefined): readonly ModifierLike[]|undefined {
  const hasDecorators = decorators?.length;
  const hasModifiers = modifiers?.length;

  // This function can be written more compactly, but it is somewhat performance-sensitive
  // so we have some additional logic only to create new arrays when necessary.
  if (hasDecorators && hasModifiers) {
    return [...decorators, ...modifiers];
  }

  if (hasDecorators && !hasModifiers) {
    return decorators;
  }

  if (hasModifiers && !hasDecorators) {
    return modifiers;
  }

  return undefined;
}

/**
 * Splits a `ModifierLike` into two arrays: decorators and modifiers. Used for backwards
 * compatibility with TS 4.7 and below where most factory functions require separate `decorators`
 * and `modifiers` arrays.
 */
function splitModifiers(allModifiers: readonly ModifierLike[]|
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
