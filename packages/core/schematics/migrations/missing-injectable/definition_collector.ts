/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {getPropertyNameText} from '../../utils/typescript/property_name';

export interface ResolvedNgModule {
  name: string;
  node: ts.ClassDeclaration;
  decorator: NgDecorator;
  providersExpr: ts.Expression|null;
}

export interface ResolvedDirective {
  name: string;
  node: ts.ClassDeclaration;
  decorator: NgDecorator;
  providersExpr: ts.Expression|null;
  viewProvidersExpr: ts.Expression|null;
}

/**
 * Visitor that walks through specified TypeScript nodes and collects all
 * found NgModule, Directive or Component definitions.
 */
export class NgDefinitionCollector {
  resolvedModules: ResolvedNgModule[] = [];
  resolvedDirectives: ResolvedDirective[] = [];

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
    const directiveDecorator =
        ngDecorators.find(({name}) => name === 'Component' || name == 'Directive');
    const ngModuleDecorator = ngDecorators.find(({name}) => name === 'NgModule');

    if (ngModuleDecorator) {
      this._visitNgModuleClass(node, ngModuleDecorator);
    } else if (directiveDecorator) {
      this._visitDirectiveClass(node, directiveDecorator);
    }
  }

  private _visitDirectiveClass(node: ts.ClassDeclaration, decorator: NgDecorator) {
    const decoratorCall = decorator.node.expression;
    const metadata = decoratorCall.arguments[0];

    if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
      return;
    }

    const providersNode = metadata.properties.filter(ts.isPropertyAssignment)
                              .find(p => getPropertyNameText(p.name) === 'providers');

    const viewProvidersNode = metadata.properties.filter(ts.isPropertyAssignment)
                                  .find(p => getPropertyNameText(p.name) === 'viewProviders');

    this.resolvedDirectives.push({
      name: node.name ? node.name.text : 'default',
      node,
      decorator,
      providersExpr: providersNode !== undefined ? providersNode.initializer : null,
      viewProvidersExpr: viewProvidersNode !== undefined ? viewProvidersNode.initializer : null,
    });
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
