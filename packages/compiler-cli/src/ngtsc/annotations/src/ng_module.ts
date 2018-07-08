/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, Expression, LiteralArrayExpr, R3DirectiveMetadata, R3InjectorMetadata, R3NgModuleMetadata, WrappedNodeExpr, compileInjector, compileNgModule, makeBindingParser, parseTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {Decorator, ReflectionHost} from '../../host';
import {Reference, ResolvedValue, reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {SelectorScopeRegistry} from './selector_scope';
import {getConstructorDependencies, isAngularCore, referenceToExpression} from './util';

export interface NgModuleAnalysis {
  ngModuleDef: R3NgModuleMetadata;
  ngInjectorDef: R3InjectorMetadata;
}

/**
 * Compiles @NgModule annotations to ngModuleDef fields.
 *
 * TODO(alxhub): handle injector side of things as well.
 */
export class NgModuleDecoratorHandler implements DecoratorHandler<NgModuleAnalysis> {
  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean) {}

  detect(decorators: Decorator[]): Decorator|undefined {
    return decorators.find(
        decorator => decorator.name === 'NgModule' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<NgModuleAnalysis> {
    if (decorator.args === null || decorator.args.length !== 1) {
      throw new Error(`Incorrect number of arguments to @NgModule decorator`);
    }
    const meta = decorator.args[0];
    if (!ts.isObjectLiteralExpression(meta)) {
      throw new Error(`Decorator argument must be literal.`);
    }
    const ngModule = reflectObjectLiteral(meta);

    if (ngModule.has('jit')) {
      // The only allowed value is true, so there's no need to expand further.
      return {};
    }

    // Extract the module declarations, imports, and exports.
    let declarations: Reference[] = [];
    if (ngModule.has('declarations')) {
      const declarationMeta = staticallyResolve(ngModule.get('declarations') !, this.checker);
      declarations = resolveTypeList(declarationMeta, 'declarations');
    }
    let imports: Reference[] = [];
    if (ngModule.has('imports')) {
      const importsMeta = staticallyResolve(ngModule.get('imports') !, this.checker);
      imports = resolveTypeList(importsMeta, 'imports');
    }
    let exports: Reference[] = [];
    if (ngModule.has('exports')) {
      const exportsMeta = staticallyResolve(ngModule.get('exports') !, this.checker);
      exports = resolveTypeList(exportsMeta, 'exports');
    }

    // Register this module's information with the SelectorScopeRegistry. This ensures that during
    // the compile() phase, the module's metadata is available for selector scope computation.
    this.scopeRegistry.registerModule(node, {declarations, imports, exports});

    const context = node.getSourceFile();

    const ngModuleDef: R3NgModuleMetadata = {
      type: new WrappedNodeExpr(node.name !),
      bootstrap: [],
      declarations: declarations.map(decl => referenceToExpression(decl, context)),
      exports: exports.map(exp => referenceToExpression(exp, context)),
      imports: imports.map(imp => referenceToExpression(imp, context)),
      emitInline: false,
    };

    const providers: Expression = ngModule.has('providers') ?
        new WrappedNodeExpr(ngModule.get('providers') !) :
        new LiteralArrayExpr([]);

    const ngInjectorDef: R3InjectorMetadata = {
      name: node.name !.text,
      type: new WrappedNodeExpr(node.name !),
      deps: getConstructorDependencies(node, this.reflector, this.isCore), providers,
      imports: new LiteralArrayExpr(
          [...imports, ...exports].map(imp => referenceToExpression(imp, context))),
    };

    return {
      analysis: {
          ngModuleDef, ngInjectorDef,
      },
    };
  }

  compile(node: ts.ClassDeclaration, analysis: NgModuleAnalysis): CompileResult[] {
    const ngInjectorDef = compileInjector(analysis.ngInjectorDef);
    const ngModuleDef = compileNgModule(analysis.ngModuleDef);
    return [
      {
        name: 'ngModuleDef',
        initializer: ngModuleDef.expression,
        statements: [],
        type: ngModuleDef.type,
      },
      {
        name: 'ngInjectorDef',
        initializer: ngInjectorDef.expression,
        statements: [],
        type: ngInjectorDef.type,
      },
    ];
  }
}

/**
 * Compute a list of `Reference`s from a resolved metadata value.
 */
function resolveTypeList(resolvedList: ResolvedValue, name: string): Reference[] {
  const refList: Reference[] = [];
  if (!Array.isArray(resolvedList)) {
    throw new Error(`Expected array when reading property ${name}`);
  }

  resolvedList.forEach((entry, idx) => {
    if (Array.isArray(entry)) {
      // Recurse into nested arrays.
      refList.push(...resolveTypeList(entry, name));
    } else if (entry instanceof Reference) {
      if (!entry.expressable) {
        throw new Error(`Value at position ${idx} in ${name} array is not expressable`);
      } else if (!ts.isClassDeclaration(entry.node)) {
        throw new Error(`Value at position ${idx} in ${name} array is not a class declaration`);
      }
      refList.push(entry);
    } else if (entry instanceof Map) {
      // TODO(alxhub): expand ModuleWithProviders.
      console.warn('ignoring `ModuleWithProviders');
    } else {
      throw new Error(`Value at position ${idx} in ${name} array is not a reference`);
    }
  });

  return refList;
}
