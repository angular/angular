/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FactoryTarget} from './compiler_facade_interface';
import {ConstantPool} from './constant_pool';
import {ChangeDetectionStrategy, ViewEncapsulation} from './core';
import {compileInjectable} from './injectable_compiler_2';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './ml_parser/defaults';
import {
  DeclareVarStmt,
  literal,
  LiteralExpr,
  StmtModifier,
  WrappedNodeExpr,
} from './output/output_ast';
import {JitEvaluator} from './output/output_jit';
import {r3JitTypeSourceSpan} from './parse_util';
import {compileFactoryFunction} from './render3/r3_factory';
import {compileInjector} from './render3/r3_injector_compiler';
import {R3JitReflector} from './render3/r3_jit';
import {
  compileNgModule,
  compileNgModuleDeclarationExpression,
  R3NgModuleMetadataKind,
  R3SelectorScopeMode,
} from './render3/r3_module_compiler';
import {compilePipeFromMetadata} from './render3/r3_pipe_compiler';
import {
  createMayBeForwardRefExpression,
  getSafePropertyAccessString,
  wrapReference,
} from './render3/util';
import {R3TemplateDependencyKind} from './render3/view/api';
import {
  compileComponentFromMetadata,
  compileDirectiveFromMetadata,
  parseHostBindings,
  verifyHostBindings,
} from './render3/view/compiler';
import {R3TargetBinder} from './render3/view/t2_binder';
import {makeBindingParser, parseTemplate} from './render3/view/template';
import {ResourceLoader} from './resource_loader';
import {DomElementSchemaRegistry} from './schema/dom_element_schema_registry';
import {getJitStandaloneDefaultForVersion} from './util';
export class CompilerFacadeImpl {
  jitEvaluator;
  FactoryTarget = FactoryTarget;
  ResourceLoader = ResourceLoader;
  elementSchemaRegistry = new DomElementSchemaRegistry();
  constructor(jitEvaluator = new JitEvaluator()) {
    this.jitEvaluator = jitEvaluator;
  }
  compilePipe(angularCoreEnv, sourceMapUrl, facade) {
    const metadata = {
      name: facade.name,
      type: wrapReference(facade.type),
      typeArgumentCount: 0,
      deps: null,
      pipeName: facade.pipeName,
      pure: facade.pure,
      isStandalone: facade.isStandalone,
    };
    const res = compilePipeFromMetadata(metadata);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
  }
  compilePipeDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
    const meta = convertDeclarePipeFacadeToMetadata(declaration);
    const res = compilePipeFromMetadata(meta);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
  }
  compileInjectable(angularCoreEnv, sourceMapUrl, facade) {
    const {expression, statements} = compileInjectable(
      {
        name: facade.name,
        type: wrapReference(facade.type),
        typeArgumentCount: facade.typeArgumentCount,
        providedIn: computeProvidedIn(facade.providedIn),
        useClass: convertToProviderExpression(facade, 'useClass'),
        useFactory: wrapExpression(facade, 'useFactory'),
        useValue: convertToProviderExpression(facade, 'useValue'),
        useExisting: convertToProviderExpression(facade, 'useExisting'),
        deps: facade.deps?.map(convertR3DependencyMetadata),
      },
      /* resolveForwardRefs */ true,
    );
    return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
  }
  compileInjectableDeclaration(angularCoreEnv, sourceMapUrl, facade) {
    const {expression, statements} = compileInjectable(
      {
        name: facade.type.name,
        type: wrapReference(facade.type),
        typeArgumentCount: 0,
        providedIn: computeProvidedIn(facade.providedIn),
        useClass: convertToProviderExpression(facade, 'useClass'),
        useFactory: wrapExpression(facade, 'useFactory'),
        useValue: convertToProviderExpression(facade, 'useValue'),
        useExisting: convertToProviderExpression(facade, 'useExisting'),
        deps: facade.deps?.map(convertR3DeclareDependencyMetadata),
      },
      /* resolveForwardRefs */ true,
    );
    return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, statements);
  }
  compileInjector(angularCoreEnv, sourceMapUrl, facade) {
    const meta = {
      name: facade.name,
      type: wrapReference(facade.type),
      providers:
        facade.providers && facade.providers.length > 0
          ? new WrappedNodeExpr(facade.providers)
          : null,
      imports: facade.imports.map((i) => new WrappedNodeExpr(i)),
    };
    const res = compileInjector(meta);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
  }
  compileInjectorDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
    const meta = convertDeclareInjectorFacadeToMetadata(declaration);
    const res = compileInjector(meta);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
  }
  compileNgModule(angularCoreEnv, sourceMapUrl, facade) {
    const meta = {
      kind: R3NgModuleMetadataKind.Global,
      type: wrapReference(facade.type),
      bootstrap: facade.bootstrap.map(wrapReference),
      declarations: facade.declarations.map(wrapReference),
      publicDeclarationTypes: null, // only needed for types in AOT
      imports: facade.imports.map(wrapReference),
      includeImportTypes: true,
      exports: facade.exports.map(wrapReference),
      selectorScopeMode: R3SelectorScopeMode.Inline,
      containsForwardDecls: false,
      schemas: facade.schemas ? facade.schemas.map(wrapReference) : null,
      id: facade.id ? new WrappedNodeExpr(facade.id) : null,
    };
    const res = compileNgModule(meta);
    return this.jitExpression(res.expression, angularCoreEnv, sourceMapUrl, []);
  }
  compileNgModuleDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
    const expression = compileNgModuleDeclarationExpression(declaration);
    return this.jitExpression(expression, angularCoreEnv, sourceMapUrl, []);
  }
  compileDirective(angularCoreEnv, sourceMapUrl, facade) {
    const meta = convertDirectiveFacadeToMetadata(facade);
    return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
  }
  compileDirectiveDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
    const typeSourceSpan = this.createParseSourceSpan(
      'Directive',
      declaration.type.name,
      sourceMapUrl,
    );
    const meta = convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan);
    return this.compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta);
  }
  compileDirectiveFromMeta(angularCoreEnv, sourceMapUrl, meta) {
    const constantPool = new ConstantPool();
    const bindingParser = makeBindingParser();
    const res = compileDirectiveFromMetadata(meta, constantPool, bindingParser);
    return this.jitExpression(
      res.expression,
      angularCoreEnv,
      sourceMapUrl,
      constantPool.statements,
    );
  }
  compileComponent(angularCoreEnv, sourceMapUrl, facade) {
    // Parse the template and check for errors.
    const {template, interpolation, defer} = parseJitTemplate(
      facade.template,
      facade.name,
      sourceMapUrl,
      facade.preserveWhitespaces,
      facade.interpolation,
      undefined,
    );
    // Compile the component metadata, including template, into an expression.
    const meta = {
      ...facade,
      ...convertDirectiveFacadeToMetadata(facade),
      selector: facade.selector || this.elementSchemaRegistry.getDefaultComponentElementName(),
      template,
      declarations: facade.declarations.map(convertDeclarationFacadeToMetadata),
      declarationListEmitMode: 0 /* DeclarationListEmitMode.Direct */,
      defer,
      styles: [...facade.styles, ...template.styles],
      encapsulation: facade.encapsulation,
      interpolation,
      changeDetection: facade.changeDetection ?? null,
      animations: facade.animations != null ? new WrappedNodeExpr(facade.animations) : null,
      viewProviders:
        facade.viewProviders != null ? new WrappedNodeExpr(facade.viewProviders) : null,
      relativeContextFilePath: '',
      i18nUseExternalIds: true,
      relativeTemplatePath: null,
    };
    const jitExpressionSourceMap = `ng:///${facade.name}.js`;
    return this.compileComponentFromMeta(angularCoreEnv, jitExpressionSourceMap, meta);
  }
  compileComponentDeclaration(angularCoreEnv, sourceMapUrl, declaration) {
    const typeSourceSpan = this.createParseSourceSpan(
      'Component',
      declaration.type.name,
      sourceMapUrl,
    );
    const meta = convertDeclareComponentFacadeToMetadata(declaration, typeSourceSpan, sourceMapUrl);
    return this.compileComponentFromMeta(angularCoreEnv, sourceMapUrl, meta);
  }
  compileComponentFromMeta(angularCoreEnv, sourceMapUrl, meta) {
    const constantPool = new ConstantPool();
    const bindingParser = makeBindingParser(meta.interpolation);
    const res = compileComponentFromMetadata(meta, constantPool, bindingParser);
    return this.jitExpression(
      res.expression,
      angularCoreEnv,
      sourceMapUrl,
      constantPool.statements,
    );
  }
  compileFactory(angularCoreEnv, sourceMapUrl, meta) {
    const factoryRes = compileFactoryFunction({
      name: meta.name,
      type: wrapReference(meta.type),
      typeArgumentCount: meta.typeArgumentCount,
      deps: convertR3DependencyMetadataArray(meta.deps),
      target: meta.target,
    });
    return this.jitExpression(
      factoryRes.expression,
      angularCoreEnv,
      sourceMapUrl,
      factoryRes.statements,
    );
  }
  compileFactoryDeclaration(angularCoreEnv, sourceMapUrl, meta) {
    const factoryRes = compileFactoryFunction({
      name: meta.type.name,
      type: wrapReference(meta.type),
      typeArgumentCount: 0,
      deps: Array.isArray(meta.deps)
        ? meta.deps.map(convertR3DeclareDependencyMetadata)
        : meta.deps,
      target: meta.target,
    });
    return this.jitExpression(
      factoryRes.expression,
      angularCoreEnv,
      sourceMapUrl,
      factoryRes.statements,
    );
  }
  createParseSourceSpan(kind, typeName, sourceUrl) {
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
  jitExpression(def, context, sourceUrl, preStatements) {
    // The ConstantPool may contain Statements which declare variables used in the final expression.
    // Therefore, its statements need to precede the actual JIT operation. The final statement is a
    // declaration of $def which is set to the expression being compiled.
    const statements = [
      ...preStatements,
      new DeclareVarStmt('$def', def, undefined, StmtModifier.Exported),
    ];
    const res = this.jitEvaluator.evaluateStatements(
      sourceUrl,
      statements,
      new R3JitReflector(context),
      /* enableSourceMaps */ true,
    );
    return res['$def'];
  }
}
function convertToR3QueryMetadata(facade) {
  return {
    ...facade,
    isSignal: facade.isSignal,
    predicate: convertQueryPredicate(facade.predicate),
    read: facade.read ? new WrappedNodeExpr(facade.read) : null,
    static: facade.static,
    emitDistinctChangesOnly: facade.emitDistinctChangesOnly,
  };
}
function convertQueryDeclarationToMetadata(declaration) {
  return {
    propertyName: declaration.propertyName,
    first: declaration.first ?? false,
    predicate: convertQueryPredicate(declaration.predicate),
    descendants: declaration.descendants ?? false,
    read: declaration.read ? new WrappedNodeExpr(declaration.read) : null,
    static: declaration.static ?? false,
    emitDistinctChangesOnly: declaration.emitDistinctChangesOnly ?? true,
    isSignal: !!declaration.isSignal,
  };
}
function convertQueryPredicate(predicate) {
  return Array.isArray(predicate)
    ? // The predicate is an array of strings so pass it through.
      predicate
    : // The predicate is a type - assume that we will need to unwrap any `forwardRef()` calls.
      createMayBeForwardRefExpression(
        new WrappedNodeExpr(predicate),
        1 /* ForwardRefHandling.Wrapped */,
      );
}
function convertDirectiveFacadeToMetadata(facade) {
  const inputsFromMetadata = parseInputsArray(facade.inputs || []);
  const outputsFromMetadata = parseMappingStringArray(facade.outputs || []);
  const propMetadata = facade.propMetadata;
  const inputsFromType = {};
  const outputsFromType = {};
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      propMetadata[field].forEach((ann) => {
        if (isInput(ann)) {
          inputsFromType[field] = {
            bindingPropertyName: ann.alias || field,
            classPropertyName: field,
            required: ann.required || false,
            // For JIT, decorators are used to declare signal inputs. That is because of
            // a technical limitation where it's not possible to statically reflect class
            // members of a directive/component at runtime before instantiating the class.
            isSignal: !!ann.isSignal,
            transformFunction: ann.transform != null ? new WrappedNodeExpr(ann.transform) : null,
          };
        } else if (isOutput(ann)) {
          outputsFromType[field] = ann.alias || field;
        }
      });
    }
  }
  const hostDirectives = facade.hostDirectives?.length
    ? facade.hostDirectives.map((hostDirective) => {
        return typeof hostDirective === 'function'
          ? {
              directive: wrapReference(hostDirective),
              inputs: null,
              outputs: null,
              isForwardReference: false,
            }
          : {
              directive: wrapReference(hostDirective.directive),
              isForwardReference: false,
              inputs: hostDirective.inputs ? parseMappingStringArray(hostDirective.inputs) : null,
              outputs: hostDirective.outputs
                ? parseMappingStringArray(hostDirective.outputs)
                : null,
            };
      })
    : null;
  return {
    ...facade,
    typeArgumentCount: 0,
    typeSourceSpan: facade.typeSourceSpan,
    type: wrapReference(facade.type),
    deps: null,
    host: {
      ...extractHostBindings(facade.propMetadata, facade.typeSourceSpan, facade.host),
    },
    inputs: {...inputsFromMetadata, ...inputsFromType},
    outputs: {...outputsFromMetadata, ...outputsFromType},
    queries: facade.queries.map(convertToR3QueryMetadata),
    providers: facade.providers != null ? new WrappedNodeExpr(facade.providers) : null,
    viewQueries: facade.viewQueries.map(convertToR3QueryMetadata),
    fullInheritance: false,
    hostDirectives,
  };
}
function convertDeclareDirectiveFacadeToMetadata(declaration, typeSourceSpan) {
  const hostDirectives = declaration.hostDirectives?.length
    ? declaration.hostDirectives.map((dir) => ({
        directive: wrapReference(dir.directive),
        isForwardReference: false,
        inputs: dir.inputs ? getHostDirectiveBindingMapping(dir.inputs) : null,
        outputs: dir.outputs ? getHostDirectiveBindingMapping(dir.outputs) : null,
      }))
    : null;
  return {
    name: declaration.type.name,
    type: wrapReference(declaration.type),
    typeSourceSpan,
    selector: declaration.selector ?? null,
    inputs: declaration.inputs ? inputsPartialMetadataToInputMetadata(declaration.inputs) : {},
    outputs: declaration.outputs ?? {},
    host: convertHostDeclarationToMetadata(declaration.host),
    queries: (declaration.queries ?? []).map(convertQueryDeclarationToMetadata),
    viewQueries: (declaration.viewQueries ?? []).map(convertQueryDeclarationToMetadata),
    providers:
      declaration.providers !== undefined ? new WrappedNodeExpr(declaration.providers) : null,
    exportAs: declaration.exportAs ?? null,
    usesInheritance: declaration.usesInheritance ?? false,
    lifecycle: {usesOnChanges: declaration.usesOnChanges ?? false},
    deps: null,
    typeArgumentCount: 0,
    fullInheritance: false,
    isStandalone:
      declaration.isStandalone ?? getJitStandaloneDefaultForVersion(declaration.version),
    isSignal: declaration.isSignal ?? false,
    hostDirectives,
  };
}
function convertHostDeclarationToMetadata(host = {}) {
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
/**
 * Parses a host directive mapping where each odd array key is the name of an input/output
 * and each even key is its public name, e.g. `['one', 'oneAlias', 'two', 'two']`.
 */
function getHostDirectiveBindingMapping(array) {
  let result = null;
  for (let i = 1; i < array.length; i += 2) {
    result = result || {};
    result[array[i - 1]] = array[i];
  }
  return result;
}
function convertOpaqueValuesToExpressions(obj) {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = new WrappedNodeExpr(obj[key]);
  }
  return result;
}
function convertDeclareComponentFacadeToMetadata(decl, typeSourceSpan, sourceMapUrl) {
  const {template, interpolation, defer} = parseJitTemplate(
    decl.template,
    decl.type.name,
    sourceMapUrl,
    decl.preserveWhitespaces ?? false,
    decl.interpolation,
    decl.deferBlockDependencies,
  );
  const declarations = [];
  if (decl.dependencies) {
    for (const innerDep of decl.dependencies) {
      switch (innerDep.kind) {
        case 'directive':
        case 'component':
          declarations.push(convertDirectiveDeclarationToMetadata(innerDep));
          break;
        case 'pipe':
          declarations.push(convertPipeDeclarationToMetadata(innerDep));
          break;
      }
    }
  } else if (decl.components || decl.directives || decl.pipes) {
    // Existing declarations on NPM may not be using the new `dependencies` merged field, and may
    // have separate fields for dependencies instead. Unify them for JIT compilation.
    decl.components &&
      declarations.push(
        ...decl.components.map((dir) =>
          convertDirectiveDeclarationToMetadata(dir, /* isComponent */ true),
        ),
      );
    decl.directives &&
      declarations.push(
        ...decl.directives.map((dir) => convertDirectiveDeclarationToMetadata(dir)),
      );
    decl.pipes && declarations.push(...convertPipeMapToMetadata(decl.pipes));
  }
  const hasDirectiveDependencies = declarations.some(
    ({kind}) =>
      kind === R3TemplateDependencyKind.Directive || kind === R3TemplateDependencyKind.NgModule,
  );
  return {
    ...convertDeclareDirectiveFacadeToMetadata(decl, typeSourceSpan),
    template,
    styles: decl.styles ?? [],
    declarations,
    viewProviders:
      decl.viewProviders !== undefined ? new WrappedNodeExpr(decl.viewProviders) : null,
    animations: decl.animations !== undefined ? new WrappedNodeExpr(decl.animations) : null,
    defer,
    changeDetection: decl.changeDetection ?? ChangeDetectionStrategy.Default,
    encapsulation: decl.encapsulation ?? ViewEncapsulation.Emulated,
    interpolation,
    declarationListEmitMode: 2 /* DeclarationListEmitMode.ClosureResolved */,
    relativeContextFilePath: '',
    i18nUseExternalIds: true,
    relativeTemplatePath: null,
    hasDirectiveDependencies,
  };
}
function convertDeclarationFacadeToMetadata(declaration) {
  return {
    ...declaration,
    type: new WrappedNodeExpr(declaration.type),
  };
}
function convertDirectiveDeclarationToMetadata(declaration, isComponent = null) {
  return {
    kind: R3TemplateDependencyKind.Directive,
    isComponent: isComponent || declaration.kind === 'component',
    selector: declaration.selector,
    type: new WrappedNodeExpr(declaration.type),
    inputs: declaration.inputs ?? [],
    outputs: declaration.outputs ?? [],
    exportAs: declaration.exportAs ?? null,
  };
}
function convertPipeMapToMetadata(pipes) {
  if (!pipes) {
    return [];
  }
  return Object.keys(pipes).map((name) => {
    return {
      kind: R3TemplateDependencyKind.Pipe,
      name,
      type: new WrappedNodeExpr(pipes[name]),
    };
  });
}
function convertPipeDeclarationToMetadata(pipe) {
  return {
    kind: R3TemplateDependencyKind.Pipe,
    name: pipe.name,
    type: new WrappedNodeExpr(pipe.type),
  };
}
function parseJitTemplate(
  template,
  typeName,
  sourceMapUrl,
  preserveWhitespaces,
  interpolation,
  deferBlockDependencies,
) {
  const interpolationConfig = interpolation
    ? InterpolationConfig.fromArray(interpolation)
    : DEFAULT_INTERPOLATION_CONFIG;
  // Parse the template and check for errors.
  const parsed = parseTemplate(template, sourceMapUrl, {
    preserveWhitespaces,
    interpolationConfig,
  });
  if (parsed.errors !== null) {
    const errors = parsed.errors.map((err) => err.toString()).join(', ');
    throw new Error(`Errors during JIT compilation of template for ${typeName}: ${errors}`);
  }
  const binder = new R3TargetBinder(null);
  const boundTarget = binder.bind({template: parsed.nodes});
  return {
    template: parsed,
    interpolation: interpolationConfig,
    defer: createR3ComponentDeferMetadata(boundTarget, deferBlockDependencies),
  };
}
/**
 * Convert the expression, if present to an `R3ProviderExpression`.
 *
 * In JIT mode we do not want the compiler to wrap the expression in a `forwardRef()` call because,
 * if it is referencing a type that has not yet been defined, it will have already been wrapped in
 * a `forwardRef()` - either by the application developer or during partial-compilation. Thus we can
 * use `ForwardRefHandling.None`.
 */
function convertToProviderExpression(obj, property) {
  if (obj.hasOwnProperty(property)) {
    return createMayBeForwardRefExpression(
      new WrappedNodeExpr(obj[property]),
      0 /* ForwardRefHandling.None */,
    );
  } else {
    return undefined;
  }
}
function wrapExpression(obj, property) {
  if (obj.hasOwnProperty(property)) {
    return new WrappedNodeExpr(obj[property]);
  } else {
    return undefined;
  }
}
function computeProvidedIn(providedIn) {
  const expression =
    typeof providedIn === 'function'
      ? new WrappedNodeExpr(providedIn)
      : new LiteralExpr(providedIn ?? null);
  // See `convertToProviderExpression()` for why this uses `ForwardRefHandling.None`.
  return createMayBeForwardRefExpression(expression, 0 /* ForwardRefHandling.None */);
}
function convertR3DependencyMetadataArray(facades) {
  return facades == null ? null : facades.map(convertR3DependencyMetadata);
}
function convertR3DependencyMetadata(facade) {
  const isAttributeDep = facade.attribute != null; // both `null` and `undefined`
  const rawToken = facade.token === null ? null : new WrappedNodeExpr(facade.token);
  // In JIT mode, if the dep is an `@Attribute()` then we use the attribute name given in
  // `attribute` rather than the `token`.
  const token = isAttributeDep ? new WrappedNodeExpr(facade.attribute) : rawToken;
  return createR3DependencyMetadata(
    token,
    isAttributeDep,
    facade.host,
    facade.optional,
    facade.self,
    facade.skipSelf,
  );
}
function convertR3DeclareDependencyMetadata(facade) {
  const isAttributeDep = facade.attribute ?? false;
  const token = facade.token === null ? null : new WrappedNodeExpr(facade.token);
  return createR3DependencyMetadata(
    token,
    isAttributeDep,
    facade.host ?? false,
    facade.optional ?? false,
    facade.self ?? false,
    facade.skipSelf ?? false,
  );
}
function createR3DependencyMetadata(token, isAttributeDep, host, optional, self, skipSelf) {
  // If the dep is an `@Attribute()` the `attributeNameType` ought to be the `unknown` type.
  // But types are not available at runtime so we just use a literal `"<unknown>"` string as a dummy
  // marker.
  const attributeNameType = isAttributeDep ? literal('unknown') : null;
  return {token, attributeNameType, host, optional, self, skipSelf};
}
function createR3ComponentDeferMetadata(boundTarget, deferBlockDependencies) {
  const deferredBlocks = boundTarget.getDeferBlocks();
  const blocks = new Map();
  for (let i = 0; i < deferredBlocks.length; i++) {
    const dependencyFn = deferBlockDependencies?.[i];
    blocks.set(deferredBlocks[i], dependencyFn ? new WrappedNodeExpr(dependencyFn) : null);
  }
  return {mode: 0 /* DeferBlockDepsEmitMode.PerBlock */, blocks};
}
function extractHostBindings(propMetadata, sourceSpan, host) {
  // First parse the declarations from the metadata.
  const bindings = parseHostBindings(host || {});
  // After that check host bindings for errors
  const errors = verifyHostBindings(bindings, sourceSpan);
  if (errors.length) {
    throw new Error(errors.map((error) => error.msg).join('\n'));
  }
  // Next, loop over the properties of the object, looking for @HostBinding and @HostListener.
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      propMetadata[field].forEach((ann) => {
        if (isHostBinding(ann)) {
          // Since this is a decorator, we know that the value is a class member. Always access it
          // through `this` so that further down the line it can't be confused for a literal value
          // (e.g. if there's a property called `true`).
          bindings.properties[ann.hostPropertyName || field] = getSafePropertyAccessString(
            'this',
            field,
          );
        } else if (isHostListener(ann)) {
          bindings.listeners[ann.eventName || field] = `${field}(${(ann.args || []).join(',')})`;
        }
      });
    }
  }
  return bindings;
}
function isHostBinding(value) {
  return value.ngMetadataName === 'HostBinding';
}
function isHostListener(value) {
  return value.ngMetadataName === 'HostListener';
}
function isInput(value) {
  return value.ngMetadataName === 'Input';
}
function isOutput(value) {
  return value.ngMetadataName === 'Output';
}
function inputsPartialMetadataToInputMetadata(inputs) {
  return Object.keys(inputs).reduce((result, minifiedClassName) => {
    const value = inputs[minifiedClassName];
    // Handle legacy partial input output.
    if (typeof value === 'string' || Array.isArray(value)) {
      result[minifiedClassName] = parseLegacyInputPartialOutput(value);
    } else {
      result[minifiedClassName] = {
        bindingPropertyName: value.publicName,
        classPropertyName: minifiedClassName,
        transformFunction:
          value.transformFunction !== null ? new WrappedNodeExpr(value.transformFunction) : null,
        required: value.isRequired,
        isSignal: value.isSignal,
      };
    }
    return result;
  }, {});
}
/**
 * Parses the legacy input partial output. For more details see `partial/directive.ts`.
 * TODO(legacy-partial-output-inputs): Remove in v18.
 */
function parseLegacyInputPartialOutput(value) {
  if (typeof value === 'string') {
    return {
      bindingPropertyName: value,
      classPropertyName: value,
      transformFunction: null,
      required: false,
      // legacy partial output does not capture signal inputs.
      isSignal: false,
    };
  }
  return {
    bindingPropertyName: value[0],
    classPropertyName: value[1],
    transformFunction: value[2] ? new WrappedNodeExpr(value[2]) : null,
    required: false,
    // legacy partial output does not capture signal inputs.
    isSignal: false,
  };
}
function parseInputsArray(values) {
  return values.reduce((results, value) => {
    if (typeof value === 'string') {
      const [bindingPropertyName, classPropertyName] = parseMappingString(value);
      results[classPropertyName] = {
        bindingPropertyName,
        classPropertyName,
        required: false,
        // Signal inputs not supported for the inputs array.
        isSignal: false,
        transformFunction: null,
      };
    } else {
      results[value.name] = {
        bindingPropertyName: value.alias || value.name,
        classPropertyName: value.name,
        required: value.required || false,
        // Signal inputs not supported for the inputs array.
        isSignal: false,
        transformFunction: value.transform != null ? new WrappedNodeExpr(value.transform) : null,
      };
    }
    return results;
  }, {});
}
function parseMappingStringArray(values) {
  return values.reduce((results, value) => {
    const [alias, fieldName] = parseMappingString(value);
    results[fieldName] = alias;
    return results;
  }, {});
}
function parseMappingString(value) {
  // Either the value is 'field' or 'field: property'. In the first case, `property` will
  // be undefined, in which case the field name should also be used as the property name.
  const [fieldName, bindingPropertyName] = value.split(':', 2).map((str) => str.trim());
  return [bindingPropertyName ?? fieldName, fieldName];
}
function convertDeclarePipeFacadeToMetadata(declaration) {
  return {
    name: declaration.type.name,
    type: wrapReference(declaration.type),
    typeArgumentCount: 0,
    pipeName: declaration.name,
    deps: null,
    pure: declaration.pure ?? true,
    isStandalone:
      declaration.isStandalone ?? getJitStandaloneDefaultForVersion(declaration.version),
  };
}
function convertDeclareInjectorFacadeToMetadata(declaration) {
  return {
    name: declaration.type.name,
    type: wrapReference(declaration.type),
    providers:
      declaration.providers !== undefined && declaration.providers.length > 0
        ? new WrappedNodeExpr(declaration.providers)
        : null,
    imports:
      declaration.imports !== undefined
        ? declaration.imports.map((i) => new WrappedNodeExpr(i))
        : [],
  };
}
export function publishFacade(global) {
  const ng = global.ng || (global.ng = {});
  ng.ɵcompilerFacade = new CompilerFacadeImpl();
}
//# sourceMappingURL=jit_compiler_facade.js.map
