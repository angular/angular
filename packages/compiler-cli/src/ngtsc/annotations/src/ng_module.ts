/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileClassMetadata, compileDeclareClassMetadata, compileDeclareInjectorFromMetadata, compileDeclareNgModuleFromMetadata, compileInjector, compileNgModule, CUSTOM_ELEMENTS_SCHEMA, Expression, ExternalExpr, FactoryTarget, Identifiers as R3, InvokeFunctionExpr, LiteralArrayExpr, LiteralExpr, NO_ERRORS_SCHEMA, R3ClassMetadata, R3CompiledExpression, R3FactoryMetadata, R3Identifiers, R3InjectorMetadata, R3NgModuleMetadata, R3Reference, SchemaMetadata, Statement, STRING_TYPE, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeDiagnostic, makeRelatedInformation} from '../../diagnostics';
import {Reference, ReferenceEmitter} from '../../imports';
import {isArrayEqual, isReferenceEqual, isSymbolEqual, SemanticReference, SemanticSymbol} from '../../incremental/semantic_graph';
import {InjectableClassRegistry, MetadataReader, MetadataRegistry} from '../../metadata';
import {PartialEvaluator, ResolvedValue} from '../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../perf';
import {ClassDeclaration, Decorator, isNamedClassDeclaration, ReflectionHost, reflectObjectLiteral, typeNodeToValueExpr} from '../../reflection';
import {NgModuleRouteAnalyzer} from '../../routing';
import {LocalModuleScopeRegistry, ScopeData} from '../../scope';
import {FactoryTracker} from '../../shims/api';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence, ResolveResult} from '../../transform';
import {getSourceFile} from '../../util/src/typescript';

import {createValueHasWrongTypeError, getProviderDiagnostics} from './diagnostics';
import {compileDeclareFactory, compileNgFactoryDefField} from './factory';
import {extractClassMetadata} from './metadata';
import {ReferencesRegistry} from './references_registry';
import {combineResolvers, findAngularDecorator, forwardRefResolver, getValidConstructorDependencies, isExpressionForwardReference, resolveProvidersRequiringFactory, toR3Reference, unwrapExpression, wrapFunctionExpressionsInParens, wrapTypeReference} from './util';

export interface NgModuleAnalysis {
  mod: R3NgModuleMetadata;
  inj: R3InjectorMetadata;
  fac: R3FactoryMetadata;
  classMetadata: R3ClassMetadata|null;
  declarations: Reference<ClassDeclaration>[];
  rawDeclarations: ts.Expression|null;
  schemas: SchemaMetadata[];
  imports: Reference<ClassDeclaration>[];
  exports: Reference<ClassDeclaration>[];
  id: Expression|null;
  factorySymbolName: string;
  providersRequiringFactory: Set<Reference<ClassDeclaration>>|null;
  providers: ts.Expression|null;
}

export interface NgModuleResolution {
  injectorImports: Expression[];
}

/**
 * Represents an Angular NgModule.
 */
export class NgModuleSymbol extends SemanticSymbol {
  private remotelyScopedComponents: {
    component: SemanticSymbol,
    usedDirectives: SemanticReference[],
    usedPipes: SemanticReference[]
  }[] = [];

  override isPublicApiAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }

    // NgModules don't have a public API that could affect emit of Angular decorated classes.
    return false;
  }

  override isEmitAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }

    // compare our remotelyScopedComponents to the previous symbol
    if (previousSymbol.remotelyScopedComponents.length !== this.remotelyScopedComponents.length) {
      return true;
    }

    for (const currEntry of this.remotelyScopedComponents) {
      const prevEntry = previousSymbol.remotelyScopedComponents.find(prevEntry => {
        return isSymbolEqual(prevEntry.component, currEntry.component);
      });

      if (prevEntry === undefined) {
        // No previous entry was found, which means that this component became remotely scoped and
        // hence this NgModule needs to be re-emitted.
        return true;
      }

      if (!isArrayEqual(currEntry.usedDirectives, prevEntry.usedDirectives, isReferenceEqual)) {
        // The list of used directives or their order has changed. Since this NgModule emits
        // references to the list of used directives, it should be re-emitted to update this list.
        // Note: the NgModule does not have to be re-emitted when any of the directives has had
        // their public API changed, as the NgModule only emits a reference to the symbol by its
        // name. Therefore, testing for symbol equality is sufficient.
        return true;
      }

      if (!isArrayEqual(currEntry.usedPipes, prevEntry.usedPipes, isReferenceEqual)) {
        return true;
      }
    }
    return false;
  }

  override isTypeCheckApiAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }

    return false;
  }

  addRemotelyScopedComponent(
      component: SemanticSymbol, usedDirectives: SemanticReference[],
      usedPipes: SemanticReference[]): void {
    this.remotelyScopedComponents.push({component, usedDirectives, usedPipes});
  }
}

/**
 * Compiles @NgModule annotations to ngModuleDef fields.
 */
export class NgModuleDecoratorHandler implements
    DecoratorHandler<Decorator, NgModuleAnalysis, NgModuleSymbol, NgModuleResolution> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaReader: MetadataReader, private metaRegistry: MetadataRegistry,
      private scopeRegistry: LocalModuleScopeRegistry,
      private referencesRegistry: ReferencesRegistry, private isCore: boolean,
      private routeAnalyzer: NgModuleRouteAnalyzer|null, private refEmitter: ReferenceEmitter,
      private factoryTracker: FactoryTracker|null, private annotateForClosureCompiler: boolean,
      private injectableRegistry: InjectableClassRegistry, private perf: PerfRecorder,
      private localeId?: string) {}

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = NgModuleDecoratorHandler.name;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<Decorator>|undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'NgModule', this.isCore);
    if (decorator !== undefined) {
      return {
        trigger: decorator.node,
        decorator: decorator,
        metadata: decorator,
      };
    } else {
      return undefined;
    }
  }

  analyze(node: ClassDeclaration, decorator: Readonly<Decorator>):
      AnalysisOutput<NgModuleAnalysis> {
    this.perf.eventCount(PerfEvent.AnalyzeNgModule);

    const name = node.name.text;
    if (decorator.args === null || decorator.args.length > 1) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(decorator),
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

    const moduleResolvers = combineResolvers([
      ref => this._extractModuleFromModuleWithProvidersFn(ref.node),
      forwardRefResolver,
    ]);

    const diagnostics: ts.Diagnostic[] = [];

    // Extract the module declarations, imports, and exports.
    let declarationRefs: Reference<ClassDeclaration>[] = [];
    let rawDeclarations: ts.Expression|null = null;
    if (ngModule.has('declarations')) {
      rawDeclarations = ngModule.get('declarations')!;
      const declarationMeta = this.evaluator.evaluate(rawDeclarations, forwardRefResolver);
      declarationRefs =
          this.resolveTypeList(rawDeclarations, declarationMeta, name, 'declarations');

      // Look through the declarations to make sure they're all a part of the current compilation.
      for (const ref of declarationRefs) {
        if (ref.node.getSourceFile().isDeclarationFile) {
          const errorNode: ts.Expression = ref.getOriginForDiagnostics(rawDeclarations);

          diagnostics.push(makeDiagnostic(
              ErrorCode.NGMODULE_INVALID_DECLARATION, errorNode,
              `Cannot declare '${
                  ref.node.name
                      .text}' in an NgModule as it's not a part of the current compilation.`,
              [makeRelatedInformation(
                  ref.node.name, `'${ref.node.name.text}' is declared here.`)]));
        }
      }
    }

    if (diagnostics.length > 0) {
      return {diagnostics};
    }

    let importRefs: Reference<ClassDeclaration>[] = [];
    let rawImports: ts.Expression|null = null;
    if (ngModule.has('imports')) {
      rawImports = ngModule.get('imports')!;
      const importsMeta = this.evaluator.evaluate(rawImports, moduleResolvers);
      importRefs = this.resolveTypeList(rawImports, importsMeta, name, 'imports');
    }
    let exportRefs: Reference<ClassDeclaration>[] = [];
    let rawExports: ts.Expression|null = null;
    if (ngModule.has('exports')) {
      rawExports = ngModule.get('exports')!;
      const exportsMeta = this.evaluator.evaluate(rawExports, moduleResolvers);
      exportRefs = this.resolveTypeList(rawExports, exportsMeta, name, 'exports');
      this.referencesRegistry.add(node, ...exportRefs);
    }
    let bootstrapRefs: Reference<ClassDeclaration>[] = [];
    if (ngModule.has('bootstrap')) {
      const expr = ngModule.get('bootstrap')!;
      const bootstrapMeta = this.evaluator.evaluate(expr, forwardRefResolver);
      bootstrapRefs = this.resolveTypeList(expr, bootstrapMeta, name, 'bootstrap');
    }

    const schemas: SchemaMetadata[] = [];
    if (ngModule.has('schemas')) {
      const rawExpr = ngModule.get('schemas')!;
      const result = this.evaluator.evaluate(rawExpr);
      if (!Array.isArray(result)) {
        throw createValueHasWrongTypeError(rawExpr, result, `NgModule.schemas must be an array`);
      }

      for (const schemaRef of result) {
        if (!(schemaRef instanceof Reference)) {
          throw createValueHasWrongTypeError(
              rawExpr, result, 'NgModule.schemas must be an array of schemas');
        }
        const id = schemaRef.getIdentityIn(schemaRef.node.getSourceFile());
        if (id === null || schemaRef.ownedByModuleGuess !== '@angular/core') {
          throw createValueHasWrongTypeError(
              rawExpr, result, 'NgModule.schemas must be an array of schemas');
        }
        // Since `id` is the `ts.Identifer` within the schema ref's declaration file, it's safe to
        // use `id.text` here to figure out which schema is in use. Even if the actual reference was
        // renamed when the user imported it, these names will match.
        switch (id.text) {
          case 'CUSTOM_ELEMENTS_SCHEMA':
            schemas.push(CUSTOM_ELEMENTS_SCHEMA);
            break;
          case 'NO_ERRORS_SCHEMA':
            schemas.push(NO_ERRORS_SCHEMA);
            break;
          default:
            throw createValueHasWrongTypeError(
                rawExpr, schemaRef, `'${schemaRef.debugName}' is not a valid NgModule schema`);
        }
      }
    }

    const id: Expression|null =
        ngModule.has('id') ? new WrappedNodeExpr(ngModule.get('id')!) : null;
    const valueContext = node.getSourceFile();

    let typeContext = valueContext;
    const typeNode = this.reflector.getDtsDeclaration(node);
    if (typeNode !== null) {
      typeContext = typeNode.getSourceFile();
    }

    const bootstrap =
        bootstrapRefs.map(bootstrap => this._toR3Reference(bootstrap, valueContext, typeContext));
    const declarations =
        declarationRefs.map(decl => this._toR3Reference(decl, valueContext, typeContext));
    const imports = importRefs.map(imp => this._toR3Reference(imp, valueContext, typeContext));
    const exports = exportRefs.map(exp => this._toR3Reference(exp, valueContext, typeContext));

    const isForwardReference = (ref: R3Reference) =>
        isExpressionForwardReference(ref.value, node.name!, valueContext);
    const containsForwardDecls = bootstrap.some(isForwardReference) ||
        declarations.some(isForwardReference) || imports.some(isForwardReference) ||
        exports.some(isForwardReference);

    const type = wrapTypeReference(this.reflector, node);
    const internalType = new WrappedNodeExpr(this.reflector.getInternalNameOfClass(node));
    const adjacentType = new WrappedNodeExpr(this.reflector.getAdjacentNameOfClass(node));

    const ngModuleMetadata: R3NgModuleMetadata = {
      type,
      internalType,
      adjacentType,
      bootstrap,
      declarations,
      exports,
      imports,
      containsForwardDecls,
      id,
      emitInline: false,
      // TODO: to be implemented as a part of FW-1004.
      schemas: [],
    };

    const rawProviders = ngModule.has('providers') ? ngModule.get('providers')! : null;
    const wrapperProviders = rawProviders !== null ?
        new WrappedNodeExpr(
            this.annotateForClosureCompiler ? wrapFunctionExpressionsInParens(rawProviders) :
                                              rawProviders) :
        null;

    // At this point, only add the module's imports as the injectors' imports. Any exported modules
    // are added during `resolve`, as we need scope information to be able to filter out directives
    // and pipes from the module exports.
    const injectorImports: WrappedNodeExpr<ts.Expression>[] = [];
    if (ngModule.has('imports')) {
      injectorImports.push(new WrappedNodeExpr(ngModule.get('imports')!));
    }

    if (this.routeAnalyzer !== null) {
      this.routeAnalyzer.add(node.getSourceFile(), name, rawImports, rawExports, rawProviders);
    }

    const injectorMetadata: R3InjectorMetadata = {
      name,
      type,
      internalType,
      providers: wrapperProviders,
      imports: injectorImports,
    };

    const factoryMetadata: R3FactoryMetadata = {
      name,
      type,
      internalType,
      typeArgumentCount: 0,
      deps: getValidConstructorDependencies(node, this.reflector, this.isCore),
      target: FactoryTarget.NgModule,
    };

    return {
      analysis: {
        id,
        schemas,
        mod: ngModuleMetadata,
        inj: injectorMetadata,
        fac: factoryMetadata,
        declarations: declarationRefs,
        rawDeclarations,
        imports: importRefs,
        exports: exportRefs,
        providers: rawProviders,
        providersRequiringFactory: rawProviders ?
            resolveProvidersRequiringFactory(rawProviders, this.reflector, this.evaluator) :
            null,
        classMetadata: extractClassMetadata(
            node, this.reflector, this.isCore, this.annotateForClosureCompiler),
        factorySymbolName: node.name.text,
      },
    };
  }

  symbol(node: ClassDeclaration): NgModuleSymbol {
    return new NgModuleSymbol(node);
  }

  register(node: ClassDeclaration, analysis: NgModuleAnalysis): void {
    // Register this module's information with the LocalModuleScopeRegistry. This ensures that
    // during the compile() phase, the module's metadata is available for selector scope
    // computation.
    this.metaRegistry.registerNgModuleMetadata({
      ref: new Reference(node),
      schemas: analysis.schemas,
      declarations: analysis.declarations,
      imports: analysis.imports,
      exports: analysis.exports,
      rawDeclarations: analysis.rawDeclarations,
    });

    if (this.factoryTracker !== null) {
      this.factoryTracker.track(node.getSourceFile(), {
        name: analysis.factorySymbolName,
        hasId: analysis.id !== null,
      });
    }

    this.injectableRegistry.registerInjectable(node);
  }

  resolve(node: ClassDeclaration, analysis: Readonly<NgModuleAnalysis>):
      ResolveResult<NgModuleResolution> {
    const scope = this.scopeRegistry.getScopeOfModule(node);
    const diagnostics: ts.Diagnostic[] = [];

    const scopeDiagnostics = this.scopeRegistry.getDiagnosticsOfModule(node);
    if (scopeDiagnostics !== null) {
      diagnostics.push(...scopeDiagnostics);
    }

    if (analysis.providersRequiringFactory !== null) {
      const providerDiagnostics = getProviderDiagnostics(
          analysis.providersRequiringFactory, analysis.providers!, this.injectableRegistry);
      diagnostics.push(...providerDiagnostics);
    }

    const data: NgModuleResolution = {
      injectorImports: [],
    };

    if (scope !== null && !scope.compilation.isPoisoned) {
      // Using the scope information, extend the injector's imports using the modules that are
      // specified as module exports.
      const context = getSourceFile(node);
      for (const exportRef of analysis.exports) {
        if (isNgModule(exportRef.node, scope.compilation)) {
          data.injectorImports.push(this.refEmitter.emit(exportRef, context).expression);
        }
      }

      for (const decl of analysis.declarations) {
        const metadata = this.metaReader.getDirectiveMetadata(decl);

        if (metadata !== null && metadata.selector === null) {
          throw new FatalDiagnosticError(
              ErrorCode.DIRECTIVE_MISSING_SELECTOR, decl.node,
              `Directive ${decl.node.name.text} has no selector, please add it!`);
        }
      }
    }

    if (diagnostics.length > 0) {
      return {diagnostics};
    }

    if (scope === null || scope.compilation.isPoisoned || scope.exported.isPoisoned ||
        scope.reexports === null) {
      return {data};
    } else {
      return {
        data,
        reexports: scope.reexports,
      };
    }
  }

  compileFull(
      node: ClassDeclaration,
      {inj, mod, fac, classMetadata, declarations}: Readonly<NgModuleAnalysis>,
      {injectorImports}: Readonly<NgModuleResolution>): CompileResult[] {
    const factoryFn = compileNgFactoryDefField(fac);
    const ngInjectorDef = compileInjector(this.mergeInjectorImports(inj, injectorImports));
    const ngModuleDef = compileNgModule(mod);
    const statements = ngModuleDef.statements;
    const metadata = classMetadata !== null ? compileClassMetadata(classMetadata) : null;
    this.insertMetadataStatement(statements, metadata);
    this.appendRemoteScopingStatements(statements, node, declarations);

    return this.compileNgModule(factoryFn, ngInjectorDef, ngModuleDef);
  }

  compilePartial(
      node: ClassDeclaration, {inj, fac, mod, classMetadata}: Readonly<NgModuleAnalysis>,
      {injectorImports}: Readonly<NgModuleResolution>): CompileResult[] {
    const factoryFn = compileDeclareFactory(fac);
    const injectorDef =
        compileDeclareInjectorFromMetadata(this.mergeInjectorImports(inj, injectorImports));
    const ngModuleDef = compileDeclareNgModuleFromMetadata(mod);
    const metadata = classMetadata !== null ? compileDeclareClassMetadata(classMetadata) : null;
    this.insertMetadataStatement(ngModuleDef.statements, metadata);
    // NOTE: no remote scoping required as this is banned in partial compilation.
    return this.compileNgModule(factoryFn, injectorDef, ngModuleDef);
  }

  /**
   *  Merge the injector imports (which are 'exports' that were later found to be NgModules)
   *  computed during resolution with the ones from analysis.
   */
  private mergeInjectorImports(inj: R3InjectorMetadata, injectorImports: Expression[]):
      R3InjectorMetadata {
    return {...inj, imports: [...inj.imports, ...injectorImports]};
  }

  /**
   * Add class metadata statements, if provided, to the `ngModuleStatements`.
   */
  private insertMetadataStatement(ngModuleStatements: Statement[], metadata: Expression|null):
      void {
    if (metadata !== null) {
      ngModuleStatements.unshift(metadata.toStmt());
    }
  }

  /**
   * Add remote scoping statements, as needed, to the `ngModuleStatements`.
   */
  private appendRemoteScopingStatements(
      ngModuleStatements: Statement[], node: ClassDeclaration,
      declarations: Reference<ClassDeclaration>[]): void {
    const context = getSourceFile(node);
    for (const decl of declarations) {
      const remoteScope = this.scopeRegistry.getRemoteScope(decl.node);
      if (remoteScope !== null) {
        const directives = remoteScope.directives.map(
            directive => this.refEmitter.emit(directive, context).expression);
        const pipes = remoteScope.pipes.map(pipe => this.refEmitter.emit(pipe, context).expression);
        const directiveArray = new LiteralArrayExpr(directives);
        const pipesArray = new LiteralArrayExpr(pipes);
        const declExpr = this.refEmitter.emit(decl, context).expression;
        const setComponentScope = new ExternalExpr(R3Identifiers.setComponentScope);
        const callExpr =
            new InvokeFunctionExpr(setComponentScope, [declExpr, directiveArray, pipesArray]);

        ngModuleStatements.push(callExpr.toStmt());
      }
    }
  }

  private compileNgModule(
      factoryFn: CompileResult, injectorDef: R3CompiledExpression,
      ngModuleDef: R3CompiledExpression): CompileResult[] {
    const res: CompileResult[] = [
      factoryFn,
      {
        name: 'ɵmod',
        initializer: ngModuleDef.expression,
        statements: ngModuleDef.statements,
        type: ngModuleDef.type,
      },
      {
        name: 'ɵinj',
        initializer: injectorDef.expression,
        statements: injectorDef.statements,
        type: injectorDef.type,
      },
    ];

    if (this.localeId) {
      // QUESTION: can this stuff be removed?
      res.push({
        name: 'ɵloc',
        initializer: new LiteralExpr(this.localeId),
        statements: [],
        type: STRING_TYPE
      });
    }

    return res;
  }

  private _toR3Reference(
      valueRef: Reference<ClassDeclaration>, valueContext: ts.SourceFile,
      typeContext: ts.SourceFile): R3Reference {
    if (valueRef.hasOwningModuleGuess) {
      return toR3Reference(valueRef, valueRef, valueContext, valueContext, this.refEmitter);
    } else {
      let typeRef = valueRef;
      let typeNode = this.reflector.getDtsDeclaration(typeRef.node);
      if (typeNode !== null && isNamedClassDeclaration(typeNode)) {
        typeRef = new Reference(typeNode);
      }
      return toR3Reference(valueRef, typeRef, valueContext, typeContext, this.refEmitter);
    }
  }

  /**
   * Given a `FunctionDeclaration`, `MethodDeclaration` or `FunctionExpression`, check if it is
   * typed as a `ModuleWithProviders` and return an expression referencing the module if available.
   */
  private _extractModuleFromModuleWithProvidersFn(node: ts.FunctionDeclaration|
                                                  ts.MethodDeclaration|
                                                  ts.FunctionExpression): ts.Expression|null {
    const type = node.type || null;
    return type &&
        (this._reflectModuleFromTypeParam(type, node) || this._reflectModuleFromLiteralType(type));
  }

  /**
   * Retrieve an `NgModule` identifier (T) from the specified `type`, if it is of the form:
   * `ModuleWithProviders<T>`
   * @param type The type to reflect on.
   * @returns the identifier of the NgModule type if found, or null otherwise.
   */
  private _reflectModuleFromTypeParam(
      type: ts.TypeNode,
      node: ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression): ts.Expression|null {
    // Examine the type of the function to see if it's a ModuleWithProviders reference.
    if (!ts.isTypeReferenceNode(type)) {
      return null;
    }

    const typeName = type &&
            (ts.isIdentifier(type.typeName) && type.typeName ||
             ts.isQualifiedName(type.typeName) && type.typeName.right) ||
        null;
    if (typeName === null) {
      return null;
    }

    // Look at the type itself to see where it comes from.
    const id = this.reflector.getImportOfIdentifier(typeName);

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
      const parent =
          ts.isMethodDeclaration(node) && ts.isClassDeclaration(node.parent) ? node.parent : null;
      const symbolName = (parent && parent.name ? parent.name.getText() + '.' : '') +
          (node.name ? node.name.getText() : 'anonymous');
      throw new FatalDiagnosticError(
          ErrorCode.NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC, type,
          `${symbolName} returns a ModuleWithProviders type without a generic type argument. ` +
              `Please add a generic type argument to the ModuleWithProviders type. If this ` +
              `occurrence is in library code you don't control, please contact the library authors.`);
    }

    const arg = type.typeArguments[0];

    return typeNodeToValueExpr(arg);
  }

  /**
   * Retrieve an `NgModule` identifier (T) from the specified `type`, if it is of the form:
   * `A|B|{ngModule: T}|C`.
   * @param type The type to reflect on.
   * @returns the identifier of the NgModule type if found, or null otherwise.
   */
  private _reflectModuleFromLiteralType(type: ts.TypeNode): ts.Expression|null {
    if (!ts.isIntersectionTypeNode(type)) {
      return null;
    }
    for (const t of type.types) {
      if (ts.isTypeLiteralNode(t)) {
        for (const m of t.members) {
          const ngModuleType = ts.isPropertySignature(m) && ts.isIdentifier(m.name) &&
                  m.name.text === 'ngModule' && m.type ||
              null;
          const ngModuleExpression = ngModuleType && typeNodeToValueExpr(ngModuleType);
          if (ngModuleExpression) {
            return ngModuleExpression;
          }
        }
      }
    }
    return null;
  }

  // Verify that a "Declaration" reference is a `ClassDeclaration` reference.
  private isClassDeclarationReference(ref: Reference): ref is Reference<ClassDeclaration> {
    return this.reflector.isClass(ref.node);
  }

  /**
   * Compute a list of `Reference`s from a resolved metadata value.
   */
  private resolveTypeList(
      expr: ts.Node, resolvedList: ResolvedValue, className: string,
      arrayName: string): Reference<ClassDeclaration>[] {
    const refList: Reference<ClassDeclaration>[] = [];
    if (!Array.isArray(resolvedList)) {
      throw createValueHasWrongTypeError(
          expr, resolvedList,
          `Expected array when reading the NgModule.${arrayName} of ${className}`);
    }

    resolvedList.forEach((entry, idx) => {
      // Unwrap ModuleWithProviders for modules that are locally declared (and thus static
      // resolution was able to descend into the function and return an object literal, a Map).
      if (entry instanceof Map && entry.has('ngModule')) {
        entry = entry.get('ngModule')!;
      }

      if (Array.isArray(entry)) {
        // Recurse into nested arrays.
        refList.push(...this.resolveTypeList(expr, entry, className, arrayName));
      } else if (entry instanceof Reference) {
        if (!this.isClassDeclarationReference(entry)) {
          throw createValueHasWrongTypeError(
              entry.node, entry,
              `Value at position ${idx} in the NgModule.${arrayName} of ${
                  className} is not a class`);
        }
        refList.push(entry);
      } else {
        // TODO(alxhub): Produce a better diagnostic here - the array index may be an inner array.
        throw createValueHasWrongTypeError(
            expr, entry,
            `Value at position ${idx} in the NgModule.${arrayName} of ${
                className} is not a reference`);
      }
    });

    return refList;
  }
}

function isNgModule(node: ClassDeclaration, compilation: ScopeData): boolean {
  return !compilation.directives.some(directive => directive.ref.node === node) &&
      !compilation.pipes.some(pipe => pipe.ref.node === node);
}
