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
import {getConstructorDependencies, isAngularCore, toR3Reference, unwrapExpression} from './util';

export interface NgModuleAnalysis {
  ngModuleDef: R3NgModuleMetadata;
  ngInjectorDef: R3InjectorMetadata;
}

/**
 * Compiles @NgModule annotations to ngModuleDef fields.
 *
 * TODO(alxhub): handle injector side of things as well.
 */
export class NgModuleDecoratorHandler implements DecoratorHandler<NgModuleAnalysis, Decorator> {
  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean) {}

  detect(node: ts.Declaration, decorators: Decorator[]|null): Decorator|undefined {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(
        decorator => decorator.name === 'NgModule' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<NgModuleAnalysis> {
    if (decorator.args === null || decorator.args.length > 1) {
      throw new Error(`Incorrect number of arguments to @NgModule decorator`);
    }

    // @NgModule can be invoked without arguments. In case it is, pretend as if a blank object
    // literal was specified. This simplifies the code below.
    const meta = decorator.args.length === 1 ? unwrapExpression(decorator.args[0]) :
                                               ts.createObjectLiteral([]);

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
      const declarationMeta =
          staticallyResolve(ngModule.get('declarations') !, this.reflector, this.checker);
      declarations = resolveTypeList(declarationMeta, 'declarations');
    }
    let imports: Reference[] = [];
    if (ngModule.has('imports')) {
      const importsMeta = staticallyResolve(
          ngModule.get('imports') !, this.reflector, this.checker,
          ref => this._extractModuleFromModuleWithProvidersFn(ref.node));
      imports = resolveTypeList(importsMeta, 'imports');
    }
    let exports: Reference[] = [];
    if (ngModule.has('exports')) {
      const exportsMeta = staticallyResolve(
          ngModule.get('exports') !, this.reflector, this.checker,
          ref => this._extractModuleFromModuleWithProvidersFn(ref.node));
      exports = resolveTypeList(exportsMeta, 'exports');
    }

    // Register this module's information with the SelectorScopeRegistry. This ensures that during
    // the compile() phase, the module's metadata is available for selector scope computation.
    this.scopeRegistry.registerModule(node, {declarations, imports, exports});

    const context = node.getSourceFile();

    const ngModuleDef: R3NgModuleMetadata = {
      type: new WrappedNodeExpr(node.name !),
      bootstrap: [],
      declarations: declarations.map(decl => toR3Reference(decl, context)),
      exports: exports.map(exp => toR3Reference(exp, context)),
      imports: imports.map(imp => toR3Reference(imp, context)),
      emitInline: false,
    };

    const providers: Expression = ngModule.has('providers') ?
        new WrappedNodeExpr(ngModule.get('providers') !) :
        new LiteralArrayExpr([]);

    const injectorImports: WrappedNodeExpr<ts.Expression>[] = [];
    if (ngModule.has('imports')) {
      injectorImports.push(new WrappedNodeExpr(ngModule.get('imports') !));
    }
    if (ngModule.has('exports')) {
      injectorImports.push(new WrappedNodeExpr(ngModule.get('exports') !));
    }

    const ngInjectorDef: R3InjectorMetadata = {
      name: node.name !.text,
      type: new WrappedNodeExpr(node.name !),
      deps: getConstructorDependencies(node, this.reflector, this.isCore), providers,
      imports: new LiteralArrayExpr(injectorImports),
    };

    return {
      analysis: {
          ngModuleDef, ngInjectorDef,
      },
      factorySymbolName: node.name !== undefined ? node.name.text : undefined,
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

  /**
   * Given a `FunctionDeclaration` or `MethodDeclaration`, check if it is typed as a
   * `ModuleWithProviders` and return an expression referencing the module if available.
   */
  private _extractModuleFromModuleWithProvidersFn(node: ts.FunctionDeclaration|
                                                  ts.MethodDeclaration): ts.Expression|null {
    const type = node.type;
    // Examine the type of the function to see if it's a ModuleWithProviders reference.
    if (type === undefined || !ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) {
      return null;
    }

    // Look at the type itself to see where it comes from.
    const id = this.reflector.getImportOfIdentifier(type.typeName);

    // If it's not named ModuleWithProviders, bail.
    if (id === null || id.name !== 'ModuleWithProviders') {
      return null;
    }

    // If it's not from @angular/core, bail.
    if (!this.isCore && id.from !== '@angular/core') {
      return null;
    }

    // If there's no type parameter specified, bail.
    if (type.typeArguments === undefined || type.typeArguments.length !== 1) {
      return null;
    }

    const arg = type.typeArguments[0];

    // If the argument isn't an Identifier, bail.
    if (!ts.isTypeReferenceNode(arg) || !ts.isIdentifier(arg.typeName)) {
      return null;
    }

    return arg.typeName;
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
    // Unwrap ModuleWithProviders for modules that are locally declared (and thus static resolution
    // was able to descend into the function and return an object literal, a Map).
    if (entry instanceof Map && entry.has('ngModule')) {
      entry = entry.get('ngModule') !;
    }

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
    } else {
      // TODO(alxhub): expand ModuleWithProviders.
      throw new Error(`Value at position ${idx} in ${name} array is not a reference: ${entry}`);
    }
  });

  return refList;
}
