/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {NgDecorator, getAngularDecorators} from '../../utils/ng_decorators';
import {isModuleWithProvidersNotGeneric} from './util';

export interface ResolvedNgModule {
  name: string;
  node: ts.ClassDeclaration;
  decorator: NgDecorator;
  staticMethods: ts.MethodDeclaration[];
}

/**
 * Visitor that walks through specified TypeScript nodes and collects all
 * found NgModule definitions.
 */
export class NgModuleCollector {
  resolvedModules: ResolvedNgModule[] = [];

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      this.visitClassDeclaration(node);
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

    const staticMethods =
        node.members.filter(isStaticMethod)
            .filter(node => !node.type || isModuleWithProvidersNotGeneric(node.type));

    this.resolvedModules.push({
      name: node.name ? node.name.text : 'default',
      node,
      decorator,
      staticMethods,
    });
  }
}

function isStaticMethod(node: ts.ClassElement): node is ts.MethodDeclaration {
  return ts.isMethodDeclaration(node) && !!node.modifiers &&
      node.modifiers.findIndex(m => m.kind === ts.SyntaxKind.StaticKeyword) > -1;
}
