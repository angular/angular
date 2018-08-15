/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ResolvedTemplate} from '../../../utils/ng_component_template';
import {getAngularDecorators} from '../../../utils/ng_decorators';
import {findParentClassDeclaration, getBaseTypeIdentifiers} from '../../../utils/typescript/class_declaration';
import {getPropertyNameText} from '../../../utils/typescript/property_name';

import {getInputNamesOfClass} from './directive_inputs';
import {NgQueryDefinition, QueryType} from './query-definition';


/** Resolved metadata of a given class. */
export interface ClassMetadata {
  /** List of class declarations that derive from the given class. */
  derivedClasses: ts.ClassDeclaration[];
  /** Super class of the given class. */
  superClass: ts.ClassDeclaration|null;
  /** List of property names that declare an Angular input within the given class. */
  ngInputNames: string[];
  /** Component template that belongs to that class if present. */
  template?: ResolvedTemplate;
}

/** Type that describes a map which can be used to get a class declaration's metadata. */
export type ClassMetadataMap = Map<ts.ClassDeclaration, ClassMetadata>;

/**
 * Visitor that can be used to determine Angular queries within given TypeScript nodes.
 * Besides resolving queries, the visitor also records class relations and searches for
 * Angular input setters which can be used to analyze the timing usage of a given query.
 */
export class NgQueryResolveVisitor {
  /** Resolved Angular query definitions. */
  resolvedQueries = new Map<ts.SourceFile, NgQueryDefinition[]>();

  /** Maps a class declaration to its class metadata. */
  classMetadata: ClassMetadataMap = new Map();

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        this.visitPropertyDeclaration(node as ts.PropertyDeclaration);
        break;
      case ts.SyntaxKind.ClassDeclaration:
        this.visitClassDeclaration(node as ts.ClassDeclaration);
        break;
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.SetAccessor:
        this.visitAccessorDeclaration(node as ts.AccessorDeclaration);
        break;
    }

    ts.forEachChild(node, n => this.visitNode(n));
  }

  private visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    this._recordQueryDeclaration(node, node, getPropertyNameText(node.name));
  }

  private visitAccessorDeclaration(node: ts.AccessorDeclaration) {
    this._recordQueryDeclaration(node, null, getPropertyNameText(node.name));
  }

  private visitClassDeclaration(node: ts.ClassDeclaration) {
    this._recordClassInputSetters(node);
    this._recordClassInheritances(node);
  }

  private _recordQueryDeclaration(
      node: ts.Node, property: ts.PropertyDeclaration|null, queryName: string|null) {
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
      name: queryName,
      type: queryDecorator.name === 'ViewChild' ? QueryType.ViewChild : QueryType.ContentChild,
      node,
      property,
      decorator: queryDecorator,
      container: queryContainer,
    }));
  }

  private _recordClassInputSetters(node: ts.ClassDeclaration) {
    const resolvedInputNames = getInputNamesOfClass(node, this.typeChecker);

    if (resolvedInputNames) {
      const classMetadata = this._getClassMetadata(node);

      classMetadata.ngInputNames = resolvedInputNames;
      this.classMetadata.set(node, classMetadata);
    }
  }

  private _recordClassInheritances(node: ts.ClassDeclaration) {
    const baseTypes = getBaseTypeIdentifiers(node);

    if (!baseTypes || baseTypes.length !== 1) {
      return;
    }

    const superClass = baseTypes[0];
    const baseClassMetadata = this._getClassMetadata(node);

    // We need to resolve the value declaration through the resolved type as the base
    // class could be declared in different source files and the local symbol won't
    // contain a value declaration as the value is not declared locally.
    const symbol = this.typeChecker.getTypeAtLocation(superClass).getSymbol();

    if (symbol && symbol.valueDeclaration && ts.isClassDeclaration(symbol.valueDeclaration)) {
      const extendedClass = symbol.valueDeclaration;
      const classMetadataExtended = this._getClassMetadata(extendedClass);

      // Record all classes that derive from the given class. This makes it easy to
      // determine all classes that could potentially use inherited queries statically.
      classMetadataExtended.derivedClasses.push(node);
      this.classMetadata.set(extendedClass, classMetadataExtended);

      // Record the super class of the current class.
      baseClassMetadata.superClass = extendedClass;
      this.classMetadata.set(node, baseClassMetadata);
    }
  }

  private _getClassMetadata(node: ts.ClassDeclaration): ClassMetadata {
    return this.classMetadata.get(node) || {derivedClasses: [], superClass: null, ngInputNames: []};
  }
}
