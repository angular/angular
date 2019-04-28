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
  declarationsNode: ts.ArrayLiteralExpression;
}

export type DirectiveModuleMap = Map<ts.ClassDeclaration, ResolvedNgModule[]>;

/**
 * Visitor that walks through specified TypeScript nodes and collects all found
 * NgModule definitions and directives/components.
 */
export class NgDirectiveVisitor {
  directiveModules: DirectiveModuleMap = new Map();
  resolvedDirectives: ts.ClassDeclaration[] = [];

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
        ngDecorators.find(({name}) => name === 'Directive' || name === 'Component');
    const ngModuleDecorator = ngDecorators.find(({name}) => name === 'NgModule');

    if (ngModuleDecorator) {
      this._visitNgModuleClass(node, ngModuleDecorator);
    } else if (directiveDecorator) {
      this.resolvedDirectives.push(node);
    }
  }

  private _visitNgModuleClass(node: ts.ClassDeclaration, decorator: NgDecorator) {
    const decoratorCall = decorator.node.expression;

    if (!ts.isObjectLiteralExpression(decoratorCall.arguments[0])) {
      return;
    }

    const metadata = decoratorCall.arguments[0] as ts.ObjectLiteralExpression;
    const declarations = metadata.properties.filter(ts.isPropertyAssignment)
                             .find(p => getPropertyNameText(p.name) === 'declarations');

    // In case there is no "declarations" property in the NgModule metadata,
    // just skip this module as there are no declared directives/components.
    if (!declarations || !ts.isArrayLiteralExpression(declarations.initializer)) {
      return;
    }

    const name = node.name ? node.name.text : 'default';
    const declarationsNode = declarations.initializer;
    const module: ResolvedNgModule = {name, node, decorator, declarationsNode};

    declarationsNode.elements.forEach(el => {
      const decl = this._getDeclarationSymbolOfNode(el);

      if (!decl || !decl.valueDeclaration || !ts.isClassDeclaration(decl.valueDeclaration)) {
        return;
      }

      const resolvedModules = this.directiveModules.get(decl.valueDeclaration) || [];
      resolvedModules.push(module);
      this.directiveModules.set(decl.valueDeclaration, resolvedModules);
    });
  }

  /**
   * Gets the declaration symbol of a given TypeScript node. Resolves aliased
   * symbols to the symbol containing the value declaration.
   */
  private _getDeclarationSymbolOfNode(node: ts.Node): ts.Symbol|null {
    let symbol = this.typeChecker.getSymbolAtLocation(node);

    if (!symbol) {
      return null;
    }

    // Resolve the symbol to it's original declaration symbol.
    while (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = this.typeChecker.getAliasedSymbol(symbol);
    }

    return symbol;
  }
}
