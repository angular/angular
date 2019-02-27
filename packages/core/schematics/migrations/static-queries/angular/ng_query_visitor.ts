/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {findParentClassDeclaration, getBaseTypeIdentifiers} from '../typescript/class_declaration';
import {getAngularDecorators} from './decorators';
import {NgQueryDefinition, QueryType} from './query-definition';

export type DerivedClassesMap = Map<ts.ClassDeclaration, ts.ClassDeclaration[]>;

/**
 * Visitor that can be used to determine Angular queries within given TypeScript nodes.
 * Besides resolving queries, the visitor also records class relations which can be used
 * to analyze the usage of a given query.
 */
export class NgQueryResolveVisitor {
  /** Resolved Angular query definitions. */
  resolvedQueries = new Map<ts.SourceFile, NgQueryDefinition[]>();

  /** Maps a class declaration to all class declarations that derive from it. */
  derivedClasses: DerivedClassesMap = new Map<ts.ClassDeclaration, ts.ClassDeclaration[]>();

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        this.visitPropertyDeclaration(node as ts.PropertyDeclaration);
        break;
      case ts.SyntaxKind.ClassDeclaration:
        this.visitClassDeclaration(node as ts.ClassDeclaration);
        break;
    }

    ts.forEachChild(node, node => this.visitNode(node));
  }

  private visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    if (!node.decorators || !node.decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this.typeChecker, node.decorators);
    const queryDecorator =
        ngDecorators.find(({name}) => name === 'ViewChild' || name === 'ContentChild');

    // Ensure that the current property declaration is defining a query.
    if (!queryDecorator) {
      return;
    }

    const queryContainer = findParentClassDeclaration(node);

    // If the query is not located within a class declaration, skip this node.
    if (!queryContainer) {
      return;
    }

    const sourceFile = node.getSourceFile();
    const newQueries = this.resolvedQueries.get(sourceFile) || [];

    this.resolvedQueries.set(sourceFile, newQueries.concat({
      type: queryDecorator.name === 'ViewChild' ? QueryType.ViewChild : QueryType.ContentChild,
      property: node,
      decorator: queryDecorator,
      container: queryContainer,
    }));
  }

  private visitClassDeclaration(node: ts.ClassDeclaration) {
    const baseTypes = getBaseTypeIdentifiers(node);

    if (!baseTypes || !baseTypes.length) {
      return;
    }

    baseTypes.forEach(baseTypeIdentifier => {
      // We need to resolve the value declaration through the resolved type as the base
      // class could be declared in different source files and the local symbol won't
      // contain a value declaration as the value is not declared locally.
      const symbol = this.typeChecker.getTypeAtLocation(baseTypeIdentifier).getSymbol();

      if (symbol && symbol.valueDeclaration) {
        this._recordClassInheritance(node, symbol.valueDeclaration as ts.ClassDeclaration);
      }
    });
  }

  private _recordClassInheritance(
      derivedClass: ts.ClassDeclaration, baseClass: ts.ClassDeclaration) {
    const existingInheritances = this.derivedClasses.get(baseClass) || [];

    // Record all classes that derive from a given class. This makes it easy to
    // determine all classes that could potentially use inherited queries statically.
    this.derivedClasses.set(baseClass, existingInheritances.concat(derivedClass));
  }
}
