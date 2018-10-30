/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, LiteralExpr, R3DependencyMetadata, R3InjectableMetadata, R3ResolvedDependencyType, Statement, WrappedNodeExpr, compileInjectable as compileIvyInjectable} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {Decorator, ReflectionHost} from '../../host';
import {reflectObjectLiteral} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {generateSetClassMetadataCall} from './metadata';
import {getConstructorDependencies, isAngularCore} from './util';

export interface InjectableHandlerData {
  meta: R3InjectableMetadata;
  metadataStmt: Statement|null;
}

/**
 * Adapts the `compileIvyInjectable` compiler for `@Injectable` decorators to the Ivy compiler.
 */
export class InjectableDecoratorHandler implements
    DecoratorHandler<InjectableHandlerData, Decorator> {
  constructor(private reflector: ReflectionHost, private isCore: boolean) {}

  detect(node: ts.Declaration, decorators: Decorator[]|null): Decorator|undefined {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(
        decorator => decorator.name === 'Injectable' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<InjectableHandlerData> {
    return {
      analysis: {
        meta: extractInjectableMetadata(node, decorator, this.reflector, this.isCore),
        metadataStmt: generateSetClassMetadataCall(node, this.reflector, this.isCore),
      },
    };
  }

  compile(node: ts.ClassDeclaration, analysis: InjectableHandlerData): CompileResult {
    const res = compileIvyInjectable(analysis.meta);
    const statements = res.statements;
    if (analysis.metadataStmt !== null) {
      statements.push(analysis.metadataStmt);
    }
    return {
      name: 'ngInjectableDef',
      initializer: res.expression, statements,
      type: res.type,
    };
  }
}

/**
 * Read metadata from the `@Injectable` decorator and produce the `IvyInjectableMetadata`, the input
 * metadata needed to run `compileIvyInjectable`.
 */
function extractInjectableMetadata(
    clazz: ts.ClassDeclaration, decorator: Decorator, reflector: ReflectionHost,
    isCore: boolean): R3InjectableMetadata {
  if (clazz.name === undefined) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ON_ANONYMOUS_CLASS, decorator.node, `@Injectable on anonymous class`);
  }
  const name = clazz.name.text;
  const type = new WrappedNodeExpr(clazz.name);
  const ctorDeps = getConstructorDependencies(clazz, reflector, isCore);
  if (decorator.args === null) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_NOT_CALLED, decorator.node, '@Injectable must be called');
  }
  if (decorator.args.length === 0) {
    return {
      name,
      type,
      providedIn: new LiteralExpr(null), ctorDeps,
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

    let userDeps: R3DependencyMetadata[]|undefined = undefined;
    if ((meta.has('useClass') || meta.has('useFactory')) && meta.has('deps')) {
      const depsExpr = meta.get('deps') !;
      if (!ts.isArrayLiteralExpression(depsExpr)) {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_NOT_LITERAL, depsExpr,
            `In Ivy, deps metadata must be an inline array.`);
      }
      if (depsExpr.elements.length > 0) {
        throw new Error(`deps not yet supported`);
      }
      userDeps = depsExpr.elements.map(dep => getDep(dep, reflector));
    }

    if (meta.has('useValue')) {
      return {
        name,
        type,
        ctorDeps,
        providedIn,
        useValue: new WrappedNodeExpr(meta.get('useValue') !)
      };
    } else if (meta.has('useExisting')) {
      return {
        name,
        type,
        ctorDeps,
        providedIn,
        useExisting: new WrappedNodeExpr(meta.get('useExisting') !)
      };
    } else if (meta.has('useClass')) {
      return {
        name,
        type,
        ctorDeps,
        providedIn,
        useClass: new WrappedNodeExpr(meta.get('useClass') !), userDeps
      };
    } else if (meta.has('useFactory')) {
      // useFactory is special - the 'deps' property must be analyzed.
      const factory = new WrappedNodeExpr(meta.get('useFactory') !);
      return {name, type, providedIn, useFactory: factory, ctorDeps, userDeps};
    } else {
      return {name, type, providedIn, ctorDeps};
    }
  } else {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, decorator.args[2], 'Too many arguments to @Injectable');
  }
}



function getDep(dep: ts.Expression, reflector: ReflectionHost): R3DependencyMetadata {
  const meta: R3DependencyMetadata = {
    token: new WrappedNodeExpr(dep),
    host: false,
    resolved: R3ResolvedDependencyType.Token,
    optional: false,
    self: false,
    skipSelf: false,
  };

  function maybeUpdateDecorator(
      dec: ts.Identifier, reflector: ReflectionHost, token?: ts.Expression): void {
    const source = reflector.getImportOfIdentifier(dec);
    if (source === null || source.from !== '@angular/core') {
      return;
    }
    switch (source.name) {
      case 'Inject':
        if (token !== undefined) {
          meta.token = new WrappedNodeExpr(token);
        }
        break;
      case 'Optional':
        meta.optional = true;
        break;
      case 'SkipSelf':
        meta.skipSelf = true;
        break;
      case 'Self':
        meta.self = true;
        break;
    }
  }

  if (ts.isArrayLiteralExpression(dep)) {
    dep.elements.forEach(el => {
      if (ts.isIdentifier(el)) {
        maybeUpdateDecorator(el, reflector);
      } else if (ts.isNewExpression(el) && ts.isIdentifier(el.expression)) {
        const token = el.arguments && el.arguments.length > 0 && el.arguments[0] || undefined;
        maybeUpdateDecorator(el.expression, reflector, token);
      }
    });
  }
  return meta;
}
