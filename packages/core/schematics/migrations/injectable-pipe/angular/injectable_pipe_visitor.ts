/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getAngularDecorators} from '../../../utils/ng_decorators';
import {INJECTABLE_DECORATOR_NAME} from '../util';

/**
 * Goes through all of the descendant nodes of a given node and lists out all of the pipes
 * that don't have `@Injectable`, as well as their `@Pipe` decorator and the import declaration
 * from which we'd need to import the `Injectable` decorator.
 */
export class InjectablePipeVisitor {
  /**
   * Keeps track of all the classes that have a `Pipe` decorator, but not `Injectable`, as well
   * as a reference to the `Pipe` decorator itself and import declarations from which we'll have
   * to import the `Injectable` decorator.
   */
  missingInjectablePipes: {
    classDeclaration: ts.ClassDeclaration,
    importDeclarationMissingImport: ts.ImportDeclaration|null,
    pipeDecorator: ts.Decorator
  }[] = [];

  constructor(private _typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        this._visitClassDeclaration(node as ts.ClassDeclaration);
        break;
    }

    ts.forEachChild(node, node => this.visitNode(node));
  }

  private _visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!node.decorators || !node.decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this._typeChecker, node.decorators);
    const pipeDecorator = ngDecorators.find(decorator => decorator.name === 'Pipe');
    const hasInjectableDecorator =
        !ngDecorators.some(decorator => decorator.name === INJECTABLE_DECORATOR_NAME);

    // Skip non-pipe classes and pipes that are already marked as injectable.
    if (pipeDecorator && hasInjectableDecorator) {
      const importNode = pipeDecorator.importNode;
      const namedImports = importNode.importClause && importNode.importClause.namedBindings;
      const needsImport = namedImports && ts.isNamedImports(namedImports) &&
          !namedImports.elements.some(element => element.name.text === INJECTABLE_DECORATOR_NAME);

      this.missingInjectablePipes.push({
        classDeclaration: node,
        importDeclarationMissingImport: needsImport ? importNode : null,
        pipeDecorator: pipeDecorator.node
      });
    }
  }
}
