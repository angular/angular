/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {getPropertyNameText} from '../../utils/typescript/property_name';


/**
 * Visitor that walks through specified TypeScript nodes and collects all defined
 * directives and provider classes. Directives are separated by decorated and
 * undecorated directives.
 */
export class NgDeclarationCollector {
  /** List of resolved directives which are decorated. */
  decoratedDirectives: ts.ClassDeclaration[] = [];

  /** List of resolved providers which are decorated. */
  decoratedProviders: ts.ClassDeclaration[] = [];

  /** Set of resolved Angular declarations which are not decorated. */
  undecoratedDeclarations = new Set<ts.ClassDeclaration>();

  private evaluator;

  constructor(
      public typeChecker: ts.TypeChecker,
      private compilerCliMigrationsModule:
          typeof import('@angular/compiler-cli/private/migrations')) {
    this.evaluator = new compilerCliMigrationsModule.PartialEvaluator(
        new compilerCliMigrationsModule.TypeScriptReflectionHost(typeChecker), typeChecker,
        /* dependencyTracker */ null);
  }

  visitNode(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      this._visitClassDeclaration(node);
    }

    ts.forEachChild(node, n => this.visitNode(n));
  }

  private _visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!node.decorators || !node.decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this.typeChecker, node.decorators);
    const ngModuleDecorator = ngDecorators.find(({name}) => name === 'NgModule');

    if (hasDirectiveDecorator(node, this.typeChecker, ngDecorators)) {
      this.decoratedDirectives.push(node);
    } else if (hasInjectableDecorator(node, this.typeChecker, ngDecorators)) {
      this.decoratedProviders.push(node);
    } else if (ngModuleDecorator) {
      this._visitNgModuleDecorator(ngModuleDecorator);
    }
  }

  private _visitNgModuleDecorator(decorator: NgDecorator) {
    const decoratorCall = decorator.node.expression;
    const metadata = decoratorCall.arguments[0];

    if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
      return;
    }

    let entryComponentsNode: ts.Expression|null = null;
    let declarationsNode: ts.Expression|null = null;

    metadata.properties.forEach(p => {
      if (!ts.isPropertyAssignment(p)) {
        return;
      }

      const name = getPropertyNameText(p.name);

      if (name === 'entryComponents') {
        entryComponentsNode = p.initializer;
      } else if (name === 'declarations') {
        declarationsNode = p.initializer;
      }
    });

    const values = [];

    // In case the module specifies the "entryComponents" field, walk through all
    // resolved entry components and collect the referenced directives.
    if (entryComponentsNode) {
      values.push(this.evaluator.evaluate(entryComponentsNode));
    }

    // In case the module specifies the "declarations" field, walk through all
    // resolved declarations and collect the referenced directives.
    if (declarationsNode) {
      values.push(this.evaluator.evaluate(declarationsNode));
    }

    // Flatten values and analyze references
    for (const value of values.flat(Infinity)) {
      if (value instanceof this.compilerCliMigrationsModule.Reference &&
          ts.isClassDeclaration(value.node) &&
          !hasNgDeclarationDecorator(value.node, this.typeChecker)) {
        this.undecoratedDeclarations.add(value.node);
      }
    }
  }
}

/** Checks whether the given node has the "@Directive" or "@Component" decorator set. */
export function hasDirectiveDecorator(
    node: ts.ClassDeclaration, typeChecker: ts.TypeChecker, ngDecorators?: NgDecorator[]): boolean {
  return (ngDecorators || getNgClassDecorators(node, typeChecker))
      .some(({name}) => name === 'Directive' || name === 'Component');
}



/** Checks whether the given node has the "@Injectable" decorator set. */
export function hasInjectableDecorator(
    node: ts.ClassDeclaration, typeChecker: ts.TypeChecker, ngDecorators?: NgDecorator[]): boolean {
  return (ngDecorators || getNgClassDecorators(node, typeChecker))
      .some(({name}) => name === 'Injectable');
}
/** Whether the given node has an explicit decorator that describes an Angular declaration. */
export function hasNgDeclarationDecorator(node: ts.ClassDeclaration, typeChecker: ts.TypeChecker) {
  return getNgClassDecorators(node, typeChecker)
      .some(({name}) => name === 'Component' || name === 'Directive' || name === 'Pipe');
}

/** Gets all Angular decorators of a given class declaration. */
export function getNgClassDecorators(
    node: ts.ClassDeclaration, typeChecker: ts.TypeChecker): NgDecorator[] {
  if (!node.decorators) {
    return [];
  }
  return getAngularDecorators(typeChecker, node.decorators);
}
