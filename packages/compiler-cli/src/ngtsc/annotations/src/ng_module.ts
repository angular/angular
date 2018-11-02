/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, LiteralArrayExpr, R3InjectorMetadata, R3NgModuleMetadata, R3Reference, Statement, WrappedNodeExpr, compileInjector, compileNgModule} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {Decorator, ReflectionHost} from '../../host';
import {Reference, ResolvedReference, ResolvedValue, reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {generateSetClassMetadataCall} from './metadata';
import {SelectorScopeRegistry} from './selector_scope';
import {getConstructorDependencies, isAngularCore, toR3Reference, unwrapExpression} from './util';

export interface NgModuleAnalysis {
  ngModuleDef: R3NgModuleMetadata;
  ngInjectorDef: R3InjectorMetadata;
  metadataStmt: Statement|null;
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
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
          `Incorrect number of arguments to @NgModule decorator`);
    }

    // @NgModule can be invoked without arguments. In case it is, pretend as if a blank object
    // literal was specified. This simplifies the code below.
    const meta = decorator.args.length === 1 ? unwrapExpression(decorator.args[0]) :
                                               ts.createObjectLiteral([]);

    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta,
          '@NgModule argument must be an object literal');
    }
    const ngModule = reflectObjectLiteral(meta);

    if (ngModule.has('jit')) {
      // The only allowed value is true, so there's no need to expand further.
      return {};
    }

    // Extract the module declarations, imports, and exports.
    let declarations: Reference<ts.Declaration>[] = [];
    if (ngModule.has('declarations')) {
      const expr = ngModule.get('declarations') !;
      const declarationMeta = staticallyResolve(expr, this.reflector, this.checker);
      declarations = this.resolveTypeList(expr, declarationMeta, 'declarations');
    }
    let imports: Reference<ts.Declaration>[] = [];
    if (ngModule.has('imports')) {
      const expr = ngModule.get('imports') !;
      const importsMeta = staticallyResolve(
          expr, this.reflector, this.checker,
          ref => this._extractModuleFromModuleWithProvidersFn(ref.node));
      imports = this.resolveTypeList(expr, importsMeta, 'imports');
    }
    let exports: Reference<ts.Declaration>[] = [];
    if (ngModule.has('exports')) {
      const expr = ngModule.get('exports') !;
      const exportsMeta = staticallyResolve(
          expr, this.reflector, this.checker,
          ref => this._extractModuleFromModuleWithProvidersFn(ref.node));
      exports = this.resolveTypeList(expr, exportsMeta, 'exports');
    }
    let bootstrap: Reference<ts.Declaration>[] = [];
    if (ngModule.has('bootstrap')) {
      const expr = ngModule.get('bootstrap') !;
      const bootstrapMeta = staticallyResolve(expr, this.reflector, this.checker);
      bootstrap = this.resolveTypeList(expr, bootstrapMeta, 'bootstrap');
    }

    // Register this module's information with the SelectorScopeRegistry. This ensures that during
    // the compile() phase, the module's metadata is available for selector scope computation.
    this.scopeRegistry.registerModule(node, {declarations, imports, exports});

    const valueContext = node.getSourceFile();

    let typeContext = valueContext;
    const typeNode = this.reflector.getDtsDeclarationOfClass(node);
    if (typeNode !== null) {
      typeContext = typeNode.getSourceFile();
    }

    const ngModuleDef: R3NgModuleMetadata = {
      type: new WrappedNodeExpr(node.name !),
      bootstrap:
          bootstrap.map(bootstrap => this._toR3Reference(bootstrap, valueContext, typeContext)),
      declarations: declarations.map(decl => this._toR3Reference(decl, valueContext, typeContext)),
      exports: exports.map(exp => this._toR3Reference(exp, valueContext, typeContext)),
      imports: imports.map(imp => this._toR3Reference(imp, valueContext, typeContext)),
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
        ngModuleDef,
        ngInjectorDef,
        metadataStmt: generateSetClassMetadataCall(node, this.reflector, this.isCore),
      },
      factorySymbolName: node.name !== undefined ? node.name.text : undefined,
    };
  }

  compile(node: ts.ClassDeclaration, analysis: NgModuleAnalysis): CompileResult[] {
    const ngInjectorDef = compileInjector(analysis.ngInjectorDef);
    const ngModuleDef = compileNgModule(analysis.ngModuleDef);
    const ngModuleStatements = ngModuleDef.additionalStatements;
    if (analysis.metadataStmt !== null) {
      ngModuleStatements.push(analysis.metadataStmt);
    }
    return [
      {
        name: 'ngModuleDef',
        initializer: ngModuleDef.expression,
        statements: ngModuleStatements,
        type: ngModuleDef.type,
      },
      {
        name: 'ngInjectorDef',
        initializer: ngInjectorDef.expression,
        statements: ngInjectorDef.statements,
        type: ngInjectorDef.type,
      },
    ];
  }

  private _toR3Reference(
      valueRef: Reference<ts.Declaration>, valueContext: ts.SourceFile,
      typeContext: ts.SourceFile): R3Reference {
    if (!(valueRef instanceof ResolvedReference)) {
      return toR3Reference(valueRef, valueRef, valueContext, valueContext);
    } else {
      let typeRef = valueRef;
      let typeNode = this.reflector.getDtsDeclarationOfClass(typeRef.node);
      if (typeNode !== null) {
        typeRef = new ResolvedReference(typeNode, typeNode.name !);
      }
      return toR3Reference(valueRef, typeRef, valueContext, typeContext);
    }
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

  /**
   * Compute a list of `Reference`s from a resolved metadata value.
   */
  private resolveTypeList(expr: ts.Node, resolvedList: ResolvedValue, name: string):
      Reference<ts.Declaration>[] {
    const refList: Reference<ts.Declaration>[] = [];
    if (!Array.isArray(resolvedList)) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, expr, `Expected array when reading property ${name}`);
    }

    resolvedList.forEach((entry, idx) => {
      // Unwrap ModuleWithProviders for modules that are locally declared (and thus static
      // resolution was able to descend into the function and return an object literal, a Map).
      if (entry instanceof Map && entry.has('ngModule')) {
        entry = entry.get('ngModule') !;
      }

      if (Array.isArray(entry)) {
        // Recurse into nested arrays.
        refList.push(...this.resolveTypeList(expr, entry, name));
      } else if (isDeclarationReference(entry)) {
        if (!entry.expressable) {
          throw new FatalDiagnosticError(
              ErrorCode.VALUE_HAS_WRONG_TYPE, expr, `One entry in ${name} is not a type`);
        } else if (!this.reflector.isClass(entry.node)) {
          throw new FatalDiagnosticError(
              ErrorCode.VALUE_HAS_WRONG_TYPE, entry.node,
              `Entry is not a type, but is used as such in ${name} array`);
        }
        refList.push(entry);
      } else {
        // TODO(alxhub): expand ModuleWithProviders.
        throw new Error(`Value at position ${idx} in ${name} array is not a reference: ${entry}`);
      }
    });

    return refList;
  }
}

function isDeclarationReference(ref: any): ref is Reference<ts.Declaration> {
  return ref instanceof Reference &&
      (ts.isClassDeclaration(ref.node) || ts.isFunctionDeclaration(ref.node) ||
       ts.isVariableDeclaration(ref.node));
}
