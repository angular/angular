/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {PartialEvaluator, ResolvedValue} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import * as ts from 'typescript';

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

  constructor(public typeChecker: ts.TypeChecker, private evaluator: PartialEvaluator) {}

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

    // In case the module specifies the "entryComponents" field, walk through all
    // resolved entry components and collect the referenced directives.
    if (entryComponentsNode) {
      flattenTypeList(this.evaluator.evaluate(entryComponentsNode)).forEach(ref => {
        if (ts.isClassDeclaration(ref.node) &&
            !hasNgDeclarationDecorator(ref.node, this.typeChecker)) {
          this.undecoratedDeclarations.add(ref.node);
        }
      });
    }

    // In case the module specifies the "declarations" field, walk through all
    // resolved declarations and collect the referenced directives.
    if (declarationsNode) {
      flattenTypeList(this.evaluator.evaluate(declarationsNode)).forEach(ref => {
        if (ts.isClassDeclaration(ref.node) &&
            !hasNgDeclarationDecorator(ref.node, this.typeChecker)) {
          this.undecoratedDeclarations.add(ref.node);
        }
      });
    }
  }
}

/** Flattens a list of type references. */
function flattenTypeList(value: ResolvedValue): Reference[] {
  if (Array.isArray(value)) {
    return <Reference[]>value.reduce(
        (res: Reference[], v: ResolvedValue) => res.concat(flattenTypeList(v)), []);
  } else if (value instanceof Reference) {
    return [value];
  }
  return [];
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
