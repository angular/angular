/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CompilerFacade, CoreEnvironment, ExportedCompilerFacade, OpaqueValue, R3ComponentMetadataFacade, R3DeclareComponentFacade, R3DeclareDirectiveFacade, R3DeclarePipeFacade, R3DeclareQueryMetadataFacade, R3DependencyMetadataFacade, R3DirectiveMetadataFacade, R3FactoryDefMetadataFacade, R3InjectableMetadataFacade, R3InjectorMetadataFacade, R3NgModuleMetadataFacade, R3PipeMetadataFacade, R3QueryMetadataFacade, StringMap, StringMapWithRename} from './compiler_facade_interface';
import {ConstantPool} from './constant_pool';
import {ChangeDetectionStrategy, HostBinding, HostListener, Input, Output, Type, ViewEncapsulation} from './core';
import {Identifiers} from './identifiers';
import {compileInjectable} from './injectable_compiler_2';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './ml_parser/interpolation_config';
import {DeclareVarStmt, Expression, LiteralExpr, Statement, StmtModifier, WrappedNodeExpr} from './output/output_ast';
import {JitEvaluator} from './output/output_jit';
import {ParseError, ParseSourceSpan, r3JitTypeSourceSpan} from './parse_util';
import {compileFactoryFunction, R3DependencyMetadata, R3FactoryTarget, R3ResolvedDependencyType} from './render3/r3_factory';
import {R3JitReflector} from './render3/r3_jit';
import {compileInjector, compileNgModule, R3InjectorMetadata, R3NgModuleMetadata} from './render3/r3_module_compiler';
import {compilePipeFromMetadata, R3PipeMetadata} from './render3/r3_pipe_compiler';
import {getSafePropertyAccessString, R3Reference} from './render3/util';
import {DeclarationListEmitMode, R3ComponentMetadata, R3DirectiveMetadata, R3HostMetadata, R3QueryMetadata, R3UsedDirectiveMetadata} from './render3/view/api';
import {compileComponentFromMetadata, compileDirectiveFromMetadata, ParsedHostBindings, parseHostBindings, verifyHostBindings} from './render3/view/compiler';
import {makeBindingParser, parseTemplate} from './render3/view/template';
import {ResourceLoader} from './resource_loader';
import {DomElementSchemaRegistry} from './schema/dom_element_schema_registry';

export class CompilerFacadeImpl implements CompilerFacade {
  R3ResolvedDependencyType = R3ResolvedDependencyType as any;
  R3FactoryTarget = R3FactoryTarget as any;
  ResourceLoader = ResourceLoader;
  private elementSchemaRegistry = new DomElementSchemaRegistry();

  constructor(private jitEvaluator = new JitEvaluator()) {}

  compilePipe(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3PipeMetadataFacade):
      any {
    const metadata: R3PipeMetadata = {
      name: facade.name,
      type: wrapReference(facade.type),
      internalType: new WrappedNodeExpr(facade.type),
      typeArgumentCount: facade.typeArgumentCount,
      deps: convertR3DependencyMetadataArray(facade.deps),
      pipeName: facade.pipeName,
      pure: facade.pure,
    };
    const res = compilePipeFromMetadata(metadata);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
  }

  compilePipeDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      declaration: R3DeclarePipeFacade): any {
    const meta = convertDeclarePipeFacadeToMetadata(declaration);
    return compilePipeFromMetadata(meta);
  }

  compileInjectable(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      facade: R3InjectableMetadataFacade): any {
    const {expression, statements} = compileInjectable({
      name: facade.name,
      type: wrapReference(facade.type),
      internalType: new WrappedNodeExpr(facade.type),
      typeArgumentCount: facade.typeArgumentCount,
      providedIn: computeProvidedIn(facade.providedIn),
      useClass: wrapExpression(facade, USE_CLASS),
      useFactory: wrapExpression(facade, USE_FACTORY),
      useValue: wrapExpression(facade, USE_VALUE),
      useExisting: wrapExpression(facade, USE_EXISTING),
      userDeps: convertR3DependencyMetadataArray(facade.userDeps) || undefined,
    });

    return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
  }

  compileInjector(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      facade: R3InjectorMetadataFacade): any {
    const meta: R3InjectorMetadata = {
      name: facade.name,
      type: wrapReference(facade.type),
      internalType: new WrappedNodeExpr(facade.type),
      deps: convertR3DependencyMetadataArray(facade.deps),
      providers: new WrappedNodeExpr(facade.providers),
      imports: facade.imports.map(i => new WrappedNodeExpr(i)),
    };
    const res = compileInjector(meta);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, res.statements);
  }

  compileNgModule(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      facade: R3NgModuleMetadataFacade): any {
    const meta: R3NgModuleMetadata = {
      type: wrapReference(facade.type),
      internalType: new WrappedNodeExpr(facade.type),
      adjacentType: new WrappedNodeExpr(facade.type),
      bootstrap: facade.bootstrap.map(wrapReference),
      declarations: facade.declarations.map(wrapReference),
      imports: facade.imports.map(wrapReference),
      exports: facade.exports.map(wrapReference),
      emitInline: true,
      containsForwardDecls: false,
      schemas: facade.schemas ? facade.schemas.map(wrapReference) : null,
      id: facade.id ? new WrappedNodeExpr(facade.id) : null,
    };
    const res = compileNgModule(meta);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
  }

  compileDirective(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      facade: R3DirectiveMetadataFacade): any {
    const meta: R3DirectiveMetadata = convertDirectiveFacadeToMetadata(facade);
    return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
  }

  compileDirectiveDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      declaration: R3DeclareDirectiveFacade): any {
    const typeSourceSpan =
        this.createParseSourceSpan('Directive', declaration.type.name, sourceMapUrl);
    const meta = convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan);
    return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
  }

  private compileDirectiveFromMeta(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3DirectiveMetadata): any {
    const constantPool = new ConstantPool();
    const bindingParser = makeBindingParser();
    const res = compileDirectiveFromMetadata(meta, constantPool, bindingParser);
    return this.jitExpression(
        res.expression, angularCoreEnv, sourceMapUrl, constantPool.statements);
  }

  compileComponent(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      facade: R3ComponentMetadataFacade): any {
    // Parse the template and check for errors.
    const {template, interpolation} = parseJitTemplate(
        facade.template, facade.name, sourceMapUrl, facade.preserveWhitespaces,
        facade.interpolation);

    // Compile the component metadata, including template, into an expression.
    const meta: R3ComponentMetadata = {
      ...facade as R3ComponentMetadataFacadeNoPropAndWhitespace,
      ...convertDirectiveFacadeToMetadata(facade),
      selector: facade.selector || this.elementSchemaRegistry.getDefaultComponentElementName(),
      template,
      declarationListEmitMode: DeclarationListEmitMode.Direct,
      styles: [...facade.styles, ...template.styles],
      encapsulation: facade.encapsulation as any,
      interpolation,
      changeDetection: facade.changeDetection,
      animations: facade.animations != null ? new WrappedNodeExpr(facade.animations) : null,
      viewProviders: facade.viewProviders != null ? new WrappedNodeExpr(facade.viewProviders) :
                                                    null,
      relativeContextFilePath: '',
      i18nUseExternalIds: true,
    };
    const jitExpressionSourceMap = `ng:///${facade.name}.js`;
    return this.compileComponentFromMeta(angularCoreEnv, jitExpressionSourceMap, meta);
  }

  compileComponentDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      declaration: R3DeclareComponentFacade): any {
    const typeSourceSpan =
        this.createParseSourceSpan('Component', declaration.type.name, sourceMapUrl);
    const meta = convertDeclareComponentFacadeToMetadata(declaration, typeSourceSpan, sourceMapUrl);
    return this.compileComponentFromMeta(angularCoreEnv, sourceMapUrl, meta);
  }

  private compileComponentFromMeta(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3ComponentMetadata): any {
    const constantPool = new ConstantPool();
    const bindingParser = makeBindingParser(meta.interpolation);
    const res = compileComponentFromMetadata(meta, constantPool, bindingParser);
    return this.jitExpression(
        res.expression, angularCoreEnv, sourceMapUrl, constantPool.statements);
  }

  compileFactory(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3FactoryDefMetadataFacade) {
    const factoryRes = compileFactoryFunction({
      name: meta.name,
      type: wrapReference(meta.type),
      internalType: new WrappedNodeExpr(meta.type),
      typeArgumentCount: meta.typeArgumentCount,
      deps: convertR3DependencyMetadataArray(meta.deps),
      injectFn: meta.injectFn === 'directiveInject' ? Identifiers.directiveInject :
                                                      Identifiers.inject,
      target: meta.target,
    });
    return this.jitExpression(
        factoryRes.factory, angularCoreEnv, sourceMapUrl, factoryRes.statements);
  }

  createParseSourceSpan(kind: string, typeName: string, sourceUrl: string): ParseSourceSpan {
    return r3JitTypeSourceSpan(kind, typeName, sourceUrl);
  }

  /**
   * JIT compiles an expression and returns the result of executing that expression.
   *
   * @param def the definition which will be compiled and executed to get the value to patch
   * @param context an object map of @angular/core symbol names to symbols which will be available
   * in the context of the compiled expression
   * @param sourceUrl a URL to use for the source map of the compiled expression
   * @param preStatements a collection of statements that should be evaluated before the expression.
   */
  private jitExpression(
      def: Expression, context: {[key: string]: any}, sourceUrl: string,
      preStatements: Statement[]): any {
    // The ConstantPool may contain Statements which declare variables used in the final expression.
    // Therefore, its statements need to precede the actual JIT operation. The final statement is a
    // declaration of $def which is set to the expression being compiled.
    const statements: Statement[] = [
      ...preStatements,
      new DeclareVarStmt('$def', def, undefined, [StmtModifier.Exported]),
    ];

    const res = this.jitEvaluator.evaluateStatements(
        sourceUrl, statements, new R3JitReflector(context), /* enableSourceMaps */ true);
    return res['$def'];
  }
}

// This seems to be needed to placate TS v3.0 only
type R3ComponentMetadataFacadeNoPropAndWhitespace = Pick<
    R3ComponentMetadataFacade,
    Exclude<Exclude<keyof R3ComponentMetadataFacade, 'preserveWhitespaces'>, 'propMetadata'>>;

const USE_CLASS = Object.keys({useClass: null})[0];
const USE_FACTORY = Object.keys({useFactory: null})[0];
const USE_VALUE = Object.keys({useValue: null})[0];
const USE_EXISTING = Object.keys({useExisting: null})[0];

const wrapReference = function(value: any): R3Reference {
  const wrapped = new WrappedNodeExpr(value);
  return {value: wrapped, type: wrapped};
};

function convertToR3QueryMetadata(facade: R3QueryMetadataFacade): R3QueryMetadata {
  return {
    ...facade,
    predicate: Array.isArray(facade.predicate) ? facade.predicate :
                                                 new WrappedNodeExpr(facade.predicate),
    read: facade.read ? new WrappedNodeExpr(facade.read) : null,
    static: facade.static,
    emitDistinctChangesOnly: facade.emitDistinctChangesOnly,
  };
}

function convertQueryDeclarationToMetadata(declaration: R3DeclareQueryMetadataFacade):
    R3QueryMetadata {
  return {
    propertyName: declaration.propertyName,
    first: declaration.first ?? false,
    predicate: Array.isArray(declaration.predicate) ? declaration.predicate :
                                                      new WrappedNodeExpr(declaration.predicate),
    descendants: declaration.descendants ?? false,
    read: declaration.read ? new WrappedNodeExpr(declaration.read) : null,
    static: declaration.static ?? false,
    emitDistinctChangesOnly: declaration.emitDistinctChangesOnly ?? true,
  };
}

function convertDirectiveFacadeToMetadata(facade: R3DirectiveMetadataFacade): R3DirectiveMetadata {
  const inputsFromMetadata = parseInputOutputs(facade.inputs || []);
  const outputsFromMetadata = parseInputOutputs(facade.outputs || []);
  const propMetadata = facade.propMetadata;
  const inputsFromType: StringMapWithRename = {};
  const outputsFromType: StringMap = {};
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      propMetadata[field].forEach(ann => {
        if (isInput(ann)) {
          inputsFromType[field] =
              ann.bindingPropertyName ? [ann.bindingPropertyName, field] : field;
        } else if (isOutput(ann)) {
          outputsFromType[field] = ann.bindingPropertyName || field;
        }
      });
    }
  }

  return {
    ...facade as R3DirectiveMetadataFacadeNoPropAndWhitespace,
    typeSourceSpan: facade.typeSourceSpan,
    type: wrapReference(facade.type),
    internalType: new WrappedNodeExpr(facade.type),
    deps: convertR3DependencyMetadataArray(facade.deps),
    host: extractHostBindings(facade.propMetadata, facade.typeSourceSpan, facade.host),
    inputs: {...inputsFromMetadata, ...inputsFromType},
    outputs: {...outputsFromMetadata, ...outputsFromType},
    queries: facade.queries.map(convertToR3QueryMetadata),
    providers: facade.providers != null ? new WrappedNodeExpr(facade.providers) : null,
    viewQueries: facade.viewQueries.map(convertToR3QueryMetadata),
    fullInheritance: false,
  };
}

function convertDeclareDirectiveFacadeToMetadata(
    declaration: R3DeclareDirectiveFacade, typeSourceSpan: ParseSourceSpan): R3DirectiveMetadata {
  return {
    name: declaration.type.name,
    type: wrapReference(declaration.type),
    typeSourceSpan,
    internalType: new WrappedNodeExpr(declaration.type),
    selector: declaration.selector ?? null,
    inputs: declaration.inputs ?? {},
    outputs: declaration.outputs ?? {},
    host: convertHostDeclarationToMetadata(declaration.host),
    queries: (declaration.queries ?? []).map(convertQueryDeclarationToMetadata),
    viewQueries: (declaration.viewQueries ?? []).map(convertQueryDeclarationToMetadata),
    providers: declaration.providers !== undefined ? new WrappedNodeExpr(declaration.providers) :
                                                     null,
    exportAs: declaration.exportAs ?? null,
    usesInheritance: declaration.usesInheritance ?? false,
    lifecycle: {usesOnChanges: declaration.usesOnChanges ?? false},
    deps: null,
    typeArgumentCount: 0,
    fullInheritance: false,
  };
}

function convertHostDeclarationToMetadata(host: R3DeclareDirectiveFacade['host'] = {}):
    R3HostMetadata {
  return {
    attributes: convertOpaqueValuesToExpressions(host.attributes ?? {}),
    listeners: host.listeners ?? {},
    properties: host.properties ?? {},
    specialAttributes: {
      classAttr: host.classAttribute,
      styleAttr: host.styleAttribute,
    },
  };
}

function convertOpaqueValuesToExpressions(obj: {[key: string]: OpaqueValue}):
    {[key: string]: WrappedNodeExpr<unknown>} {
  const result: {[key: string]: WrappedNodeExpr<unknown>} = {};
  for (const key of Object.keys(obj)) {
    result[key] = new WrappedNodeExpr(obj[key]);
  }
  return result;
}

function convertDeclareComponentFacadeToMetadata(
    declaration: R3DeclareComponentFacade, typeSourceSpan: ParseSourceSpan,
    sourceMapUrl: string): R3ComponentMetadata {
  const {template, interpolation} = parseJitTemplate(
      declaration.template, declaration.type.name, sourceMapUrl,
      declaration.preserveWhitespaces ?? false, declaration.interpolation);

  return {
    ...convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan),
    template,
    styles: declaration.styles ?? [],
    directives: (declaration.directives ?? []).map(convertUsedDirectiveDeclarationToMetadata),
    pipes: convertUsedPipesToMetadata(declaration.pipes),
    viewProviders: declaration.viewProviders !== undefined ?
        new WrappedNodeExpr(declaration.viewProviders) :
        null,
    animations: declaration.animations !== undefined ? new WrappedNodeExpr(declaration.animations) :
                                                       null,
    changeDetection: declaration.changeDetection ?? ChangeDetectionStrategy.Default,
    encapsulation: declaration.encapsulation ?? ViewEncapsulation.Emulated,
    interpolation,
    declarationListEmitMode: DeclarationListEmitMode.ClosureResolved,
    relativeContextFilePath: '',
    i18nUseExternalIds: true,
  };
}

function convertUsedDirectiveDeclarationToMetadata(
    declaration: NonNullable<R3DeclareComponentFacade['directives']>[number]):
    R3UsedDirectiveMetadata {
  return {
    selector: declaration.selector,
    type: new WrappedNodeExpr(declaration.type),
    inputs: declaration.inputs ?? [],
    outputs: declaration.outputs ?? [],
    exportAs: declaration.exportAs ?? null,
  };
}

function convertUsedPipesToMetadata(declaredPipes: R3DeclareComponentFacade['pipes']):
    Map<string, Expression> {
  const pipes = new Map<string, Expression>();
  if (declaredPipes === undefined) {
    return pipes;
  }

  for (const pipeName of Object.keys(declaredPipes)) {
    const pipeType = declaredPipes[pipeName];
    pipes.set(pipeName, new WrappedNodeExpr(pipeType));
  }
  return pipes;
}

function parseJitTemplate(
    template: string, typeName: string, sourceMapUrl: string, preserveWhitespaces: boolean,
    interpolation: [string, string]|undefined) {
  const interpolationConfig =
      interpolation ? InterpolationConfig.fromArray(interpolation) : DEFAULT_INTERPOLATION_CONFIG;
  // Parse the template and check for errors.
  const parsed = parseTemplate(
      template, sourceMapUrl, {preserveWhitespaces: preserveWhitespaces, interpolationConfig});
  if (parsed.errors !== null) {
    const errors = parsed.errors.map(err => err.toString()).join(', ');
    throw new Error(`Errors during JIT compilation of template for ${typeName}: ${errors}`);
  }
  return {template: parsed, interpolation: interpolationConfig};
}

// This seems to be needed to placate TS v3.0 only
type R3DirectiveMetadataFacadeNoPropAndWhitespace =
    Pick<R3DirectiveMetadataFacade, Exclude<keyof R3DirectiveMetadataFacade, 'propMetadata'>>;

function wrapExpression(obj: any, property: string): WrappedNodeExpr<any>|undefined {
  if (obj.hasOwnProperty(property)) {
    return new WrappedNodeExpr(obj[property]);
  } else {
    return undefined;
  }
}

function computeProvidedIn(providedIn: Type|string|null|undefined): Expression {
  if (providedIn == null || typeof providedIn === 'string') {
    return new LiteralExpr(providedIn);
  } else {
    return new WrappedNodeExpr(providedIn);
  }
}

function convertR3DependencyMetadata(facade: R3DependencyMetadataFacade): R3DependencyMetadata {
  let tokenExpr;
  if (facade.token === null) {
    tokenExpr = new LiteralExpr(null);
  } else if (facade.resolved === R3ResolvedDependencyType.Attribute) {
    tokenExpr = new LiteralExpr(facade.token);
  } else {
    tokenExpr = new WrappedNodeExpr(facade.token);
  }
  return {
    token: tokenExpr,
    attribute: null,
    resolved: facade.resolved,
    host: facade.host,
    optional: facade.optional,
    self: facade.self,
    skipSelf: facade.skipSelf,
  };
}

function convertR3DependencyMetadataArray(facades: R3DependencyMetadataFacade[]|null|
                                          undefined): R3DependencyMetadata[]|null {
  return facades == null ? null : facades.map(convertR3DependencyMetadata);
}

function extractHostBindings(
    propMetadata: {[key: string]: any[]}, sourceSpan: ParseSourceSpan,
    host?: {[key: string]: string}): ParsedHostBindings {
  // First parse the declarations from the metadata.
  const bindings = parseHostBindings(host || {});

  // After that check host bindings for errors
  const errors = verifyHostBindings(bindings, sourceSpan);
  if (errors.length) {
    throw new Error(errors.map((error: ParseError) => error.msg).join('\n'));
  }

  // Next, loop over the properties of the object, looking for @HostBinding and @HostListener.
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      propMetadata[field].forEach(ann => {
        if (isHostBinding(ann)) {
          // Since this is a decorator, we know that the value is a class member. Always access it
          // through `this` so that further down the line it can't be confused for a literal value
          // (e.g. if there's a property called `true`).
          bindings.properties[ann.hostPropertyName || field] =
              getSafePropertyAccessString('this', field);
        } else if (isHostListener(ann)) {
          bindings.listeners[ann.eventName || field] = `${field}(${(ann.args || []).join(',')})`;
        }
      });
    }
  }

  return bindings;
}

function isHostBinding(value: any): value is HostBinding {
  return value.ngMetadataName === 'HostBinding';
}

function isHostListener(value: any): value is HostListener {
  return value.ngMetadataName === 'HostListener';
}


function isInput(value: any): value is Input {
  return value.ngMetadataName === 'Input';
}

function isOutput(value: any): value is Output {
  return value.ngMetadataName === 'Output';
}

function parseInputOutputs(values: string[]): StringMap {
  return values.reduce((map, value) => {
    const [field, property] = value.split(',').map(piece => piece.trim());
    map[field] = property || field;
    return map;
  }, {} as StringMap);
}

function convertDeclarePipeFacadeToMetadata(declaration: R3DeclarePipeFacade): R3PipeMetadata {
  return {
    name: declaration.type.name,
    type: wrapReference(declaration.type),
    internalType: new WrappedNodeExpr(declaration.type),
    typeArgumentCount: 0,
    pipeName: declaration.name,
    deps: null,
    pure: declaration.pure ?? true,
  };
}


export function publishFacade(global: any) {
  const ng: ExportedCompilerFacade = global.ng || (global.ng = {});
  ng.ɵcompilerFacade = new CompilerFacadeImpl();
}
