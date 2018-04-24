/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, IvyInjectableDep, IvyInjectableMetadata, LiteralExpr, WrappedNodeExpr, compileIvyInjectable} from '@angular/compiler';
import * as ts from 'typescript';

import {Decorator} from '../../metadata';
import {reflectConstructorParameters, reflectImportedIdentifier, reflectObjectLiteral} from '../../metadata/src/reflector';

import {AddStaticFieldInstruction, AnalysisOutput, CompilerAdapter} from './api';


/**
 * Adapts the `compileIvyInjectable` compiler for `@Injectable` decorators to the Ivy compiler.
 */
export class InjectableCompilerAdapter implements CompilerAdapter<IvyInjectableMetadata> {
  constructor(private checker: ts.TypeChecker) {}

  detect(decorator: Decorator[]): Decorator|undefined {
    return decorator.find(dec => dec.name === 'Injectable' && dec.from === '@angular/core');
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<IvyInjectableMetadata> {
    return {
      analysis: extractInjectableMetadata(node, decorator, this.checker),
    };
  }

  compile(node: ts.ClassDeclaration, analysis: IvyInjectableMetadata): AddStaticFieldInstruction {
    const res = compileIvyInjectable(analysis);
    return {
      field: 'ngInjectableDef',
      initializer: res.expression,
      type: res.type,
    };
  }
}

/**
 * Read metadata from the `@Injectable` decorator and produce the `IvyInjectableMetadata`, the input
 * metadata needed to run `compileIvyInjectable`.
 */
function extractInjectableMetadata(
    clazz: ts.ClassDeclaration, decorator: Decorator,
    checker: ts.TypeChecker): IvyInjectableMetadata {
  if (clazz.name === undefined) {
    throw new Error(`@Injectables must have names`);
  }
  const name = clazz.name.text;
  const type = new WrappedNodeExpr(clazz.name);
  if (decorator.args.length === 0) {
    return {
      name,
      type,
      providedIn: new LiteralExpr(null),
      useType: getUseType(clazz, checker),
    };
  } else if (decorator.args.length === 1) {
    const metaNode = decorator.args[0];
    // Firstly make sure the decorator argument is an inline literal - if not, it's illegal to
    // transport references from one location to another. This is the problem that lowering
    // used to solve - if this restriction proves too undesirable we can re-implement lowering.
    if (!ts.isObjectLiteralExpression(metaNode)) {
      throw new Error(`In Ivy, decorator metadata must be inline.`);
    }

    // Resolve the fields of the literal into a map of field name to expression.
    const meta = reflectObjectLiteral(metaNode);
    let providedIn: Expression = new LiteralExpr(null);
    if (meta.has('providedIn')) {
      providedIn = new WrappedNodeExpr(meta.get('providedIn') !);
    }
    if (meta.has('useValue')) {
      return {name, type, providedIn, useValue: new WrappedNodeExpr(meta.get('useValue') !)};
    } else if (meta.has('useExisting')) {
      return {name, type, providedIn, useExisting: new WrappedNodeExpr(meta.get('useExisting') !)};
    } else if (meta.has('useClass')) {
      return {name, type, providedIn, useClass: new WrappedNodeExpr(meta.get('useClass') !)};
    } else if (meta.has('useFactory')) {
      // useFactory is special - the 'deps' property must be analyzed.
      const factory = new WrappedNodeExpr(meta.get('useFactory') !);
      const deps: IvyInjectableDep[] = [];
      if (meta.has('deps')) {
        const depsExpr = meta.get('deps') !;
        if (!ts.isArrayLiteralExpression(depsExpr)) {
          throw new Error(`In Ivy, deps metadata must be inline.`);
        }
        if (depsExpr.elements.length > 0) {
          throw new Error(`deps not yet supported`);
        }
        deps.push(...depsExpr.elements.map(dep => getDep(dep, checker)));
      }
      return {name, type, providedIn, useFactory: {factory, deps}};
    } else {
      const useType = getUseType(clazz, checker);
      return {name, type, providedIn, useType};
    }
  } else {
    throw new Error(`Too many arguments to @Injectable`);
  }
}

function getUseType(clazz: ts.ClassDeclaration, checker: ts.TypeChecker): IvyInjectableDep[] {
  const useType: IvyInjectableDep[] = [];
  const ctorParams = (reflectConstructorParameters(clazz, checker) || []);
  ctorParams.forEach(param => {
    let tokenExpr = param.typeValueExpr;
    let optional = false, self = false, skipSelf = false;
    param.decorators.filter(dec => dec.from === '@angular/core').forEach(dec => {
      if (dec.name === 'Inject') {
        if (dec.args.length !== 1) {
          throw new Error(`Unexpected number of arguments to @Inject().`);
        }
        tokenExpr = dec.args[0];
      } else if (dec.name === 'Optional') {
        optional = true;
      } else if (dec.name === 'SkipSelf') {
        skipSelf = true;
      } else if (dec.name === 'Self') {
        self = true;
      } else {
        throw new Error(`Unexpected decorator ${dec.name} on parameter.`);
      }
      if (tokenExpr === null) {
        throw new Error(`No suitable token for parameter!`);
      }
    });
    const token = new WrappedNodeExpr(tokenExpr);
    useType.push({token, optional, self, skipSelf, attribute: false});
  });
  return useType;
}

function getDep(dep: ts.Expression, checker: ts.TypeChecker): IvyInjectableDep {
  const depObj = {
    token: new WrappedNodeExpr(dep),
    optional: false,
    self: false,
    skipSelf: false,
    attribute: false,
  };

  function maybeUpdateDecorator(dec: ts.Identifier, token?: ts.Expression): void {
    const source = reflectImportedIdentifier(dec, checker);
    if (source === null || source.from !== '@angular/core') {
      return;
    }
    switch (source.name) {
      case 'Inject':
        if (token !== undefined) {
          depObj.token = new WrappedNodeExpr(token);
        }
        break;
      case 'Optional':
        depObj.optional = true;
        break;
      case 'SkipSelf':
        depObj.skipSelf = true;
        break;
      case 'Self':
        depObj.self = true;
        break;
    }
  }

  if (ts.isArrayLiteralExpression(dep)) {
    dep.elements.forEach(el => {
      if (ts.isIdentifier(el)) {
        maybeUpdateDecorator(el);
      } else if (ts.isNewExpression(el) && ts.isIdentifier(el.expression)) {
        const token = el.arguments && el.arguments.length > 0 && el.arguments[0] || undefined;
        maybeUpdateDecorator(el.expression, token);
      }
    });
  }
  return depObj;
}
