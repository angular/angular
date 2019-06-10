/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {NgDecorator, getAngularDecorators} from '../../utils/ng_decorators';
import {getPropertyNameText} from '../../utils/typescript/property_name';

export interface ResolvedNgModule {
  name: string;
  node: ts.ClassDeclaration;
  decorator: NgDecorator;
  providersExpr: ts.Expression|null;
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

    const providersNode = metadata.properties.filter(ts.isPropertyAssignment)
                              .find(p => getPropertyNameText(p.name) === 'providers');
    this.resolvedModules.push({
      name: node.name ? node.name.text : 'default',
      node,
      decorator,
      providersExpr: providersNode !== undefined ? providersNode.initializer : null,
    });
  }
}
