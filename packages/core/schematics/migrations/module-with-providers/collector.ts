/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';

import {isModuleWithProvidersNotGeneric} from './util';

export interface ResolvedNgModule {
  name: string;
  node: ts.ClassDeclaration;
  decorator: NgDecorator;
  /**
   * List of found static method declarations on the module which do not
   * declare an explicit return type.
   */
  staticMethodsWithoutType: ts.MethodDeclaration[];
}

/**
 * Visitor that walks through specified TypeScript nodes and collects all
 * found NgModule static methods without types and all ModuleWithProviders
 * usages without generic types attached.
 */
export class Collector {
  resolvedModules: ResolvedNgModule[] = [];
  resolvedNonGenerics: ts.TypeReferenceNode[] = [];

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      this.visitClassDeclaration(node);
    } else if (isModuleWithProvidersNotGeneric(this.typeChecker, node)) {
      this.resolvedNonGenerics.push(node);
    }

    ts.forEachChild(node, n => this.visitNode(n));
  }

  private visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!node.decorators || !node.decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this.typeChecker, node.decorators);
    const ngModuleDecorator = ngDecorators.find(({name}) => name === 'NgModule');

    if (ngModuleDecorator) {
      this._visitNgModuleClass(node, ngModuleDecorator);
    }
  }

  private _visitNgModuleClass(node: ts.ClassDeclaration, decorator: NgDecorator) {
    const decoratorCall = decorator.node.expression;
    const metadata = decoratorCall.arguments[0];

    if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
      return;
    }

    this.resolvedModules.push({
      name: node.name ? node.name.text : 'default',
      node,
      decorator,
      staticMethodsWithoutType: node.members.filter(isStaticMethodNoType),
    });
  }
}

function isStaticMethodNoType(node: ts.ClassElement): node is ts.MethodDeclaration {
  return ts.isMethodDeclaration(node) && !!node.modifiers &&
      node.modifiers.findIndex(m => m.kind === ts.SyntaxKind.StaticKeyword) > -1 && !node.type;
}
