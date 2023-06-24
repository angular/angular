/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ChangeTracker} from '../../utils/change_tracker';
import {getImportOfIdentifier, getImportSpecifier, getImportSpecifiers, removeSymbolFromNamedImports, replaceImport} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';

export const deprecatedInterfaces =
    new Set(['CanLoad', 'CanMatch', 'CanActivate', 'CanDeactivate', 'CanActivateChild', 'Resolve']);
export const routerModule = '@angular/router';

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, rewriteFn: RewriteFn) {
  const deprecatedImports =
      getImportSpecifiers(sourceFile, routerModule, Array.from(deprecatedInterfaces));
  if (deprecatedImports.length === 0) {
    return;
  }
  const changeTracker = new ChangeTracker(ts.createPrinter());
  // Map of original named imports to the most recent migrated node. We might update it multiple
  // times so we need to accumulate updates.
  const updatedImports = new Map<ts.NamedImports, ts.NamedImports>();
  const updatedImplements = new Map<ts.HeritageClause, ts.HeritageClause>();

  findUsages(
      sourceFile, typeChecker, updatedImplements, updatedImports, changeTracker, deprecatedImports);
  findImports(sourceFile, updatedImports);

  for (const [originalNode, rewrittenNode] of updatedImports.entries()) {
    if (rewrittenNode.elements.length > 0) {
      changeTracker.replaceNode(originalNode, rewrittenNode);
    } else {
      const importDeclaration = originalNode.parent.parent;
      changeTracker.removeNode(importDeclaration);
    }
  }

  for (const [originalNode, rewrittenNode] of updatedImplements.entries()) {
    if (rewrittenNode.types.length > 0) {
      changeTracker.replaceNode(originalNode, rewrittenNode);
    } else {
      changeTracker.removeNode(originalNode);
    }
  }

  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}

function findImports(
    sourceFile: ts.SourceFile, updatedImports: Map<ts.NamedImports, ts.NamedImports>) {
  for (const deprecatedInterface of deprecatedInterfaces) {
    const importSpecifier = getImportSpecifier(sourceFile, routerModule, deprecatedInterface);

    // No `specifier` found, nothing to migrate, exit early.
    if (importSpecifier === null) continue;

    const namedImports = closestNode(importSpecifier, ts.isNamedImports);
    if (namedImports !== null) {
      const importToUpdate = updatedImports.get(namedImports) ?? namedImports;
      const rewrittenNamedImports = removeSymbolFromNamedImports(importToUpdate, importSpecifier);
      updatedImports.set(namedImports, rewrittenNamedImports);
    }
  }
}

function findUsages(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    updatedImplements: Map<ts.HeritageClause, ts.HeritageClause>,
    updatedImports: Map<ts.NamedImports, ts.NamedImports>, changeTracker: ChangeTracker,
    deprecatedImports: ts.ImportSpecifier[]): void {
  const visitNode = (node: ts.Node) => {
    if (ts.isImportSpecifier(node)) {
      // Skip this node and all of its children; imports are a special case.
      return;
    }
    if ((ts.isInterfaceDeclaration(node) || ts.isClassLike(node)) && node.heritageClauses) {
      for (const heritageClause of node.heritageClauses) {
        visitHeritageClause(heritageClause, typeChecker, updatedImplements, deprecatedImports);
      }
      ts.forEachChild(node, visitNode);
    } else if (ts.isTypeReferenceNode(node)) {
      visitTypeReference(
          node, typeChecker, changeTracker, sourceFile, updatedImports, deprecatedImports);
    } else {
      ts.forEachChild(node, visitNode);
    }
  };
  ts.forEachChild(sourceFile, visitNode);
}

function visitHeritageClause(
    heritageClause: ts.HeritageClause, typeChecker: ts.TypeChecker,
    updatedImplements: Map<ts.HeritageClause, ts.HeritageClause>,
    deprecatedImports: ts.ImportSpecifier[]) {
  const visitChildren = (node: ts.Node): void => {
    if (ts.isIdentifier(node)) {
      if (deprecatedImports.some(importSpecifier => importSpecifier.name.text === node.text)) {
        const importIdentifier = getImportOfIdentifier(typeChecker, node);
        if (importIdentifier?.importModule === routerModule &&
            deprecatedInterfaces.has(importIdentifier.name)) {
          const heritageClauseToUpdate = updatedImplements.get(heritageClause) ?? heritageClause;
          const mostRecentUpdate = ts.factory.updateHeritageClause(
              heritageClauseToUpdate, heritageClauseToUpdate.types.filter(current => {
                return !ts.isExpressionWithTypeArguments(current) || current.expression !== node;
              }));
          updatedImplements.set(heritageClause, mostRecentUpdate);
        }
      }
    }
    ts.forEachChild(node, visitChildren);
  };
  ts.forEachChild(heritageClause, visitChildren);
}

function visitTypeReference(
    typeReference: ts.TypeReferenceNode, typeChecker: ts.TypeChecker, changeTracker: ChangeTracker,
    sourceFile: ts.SourceFile, updatedImports: Map<ts.NamedImports, ts.NamedImports>,
    deprecatedImports: ts.ImportSpecifier[]) {
  const visitTypeReferenceChildren = (node: ts.Node): void => {
    if (ts.isIdentifier(node) &&
        deprecatedImports.some(importSpecifier => importSpecifier.name.text === node.text)) {
      const importIdentifier = getImportOfIdentifier(typeChecker, node);
      if (importIdentifier?.importModule === routerModule &&
          deprecatedInterfaces.has(importIdentifier.name)) {
        const {name: interfaceName} = importIdentifier;
        const functionTypeName = `${interfaceName}Fn`;
        const classFunctionName =
            `${interfaceName.charAt(0).toLocaleLowerCase()}${interfaceName.slice(1)}`;
        // i.e. Resolve<T> => {resolve: ResolveFn<T>}
        const replacement = ts.factory.createTypeLiteralNode([ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier(classFunctionName),
            undefined,
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(functionTypeName),
                ts.isTypeReferenceNode(node.parent) ? node.parent.typeArguments : undefined,
                ),
            )]);
        changeTracker.replaceNode(node.parent, replacement);
        const importSpecifier = getImportSpecifier(sourceFile, routerModule, interfaceName);

        // No `specifier` found, nothing to migrate, exit early.
        if (importSpecifier === null) return;

        const namedImports = closestNode(importSpecifier, ts.isNamedImports);
        if (namedImports !== null) {
          const importToUpdate = updatedImports.get(namedImports) ?? namedImports;
          const rewrittenNamedImports =
              replaceImport(importToUpdate, interfaceName, functionTypeName);
          updatedImports.set(namedImports, rewrittenNamedImports);
        }
      }
    }
    ts.forEachChild(node, visitTypeReferenceChildren);
  };
  ts.forEachChild(typeReference, visitTypeReferenceChildren);
}
