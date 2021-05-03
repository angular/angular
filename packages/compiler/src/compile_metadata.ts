/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from './aot/static_symbol';
import {ChangeDetectionStrategy, SchemaMetadata, Type, ViewEncapsulation} from './core';
import {LifecycleHooks} from './lifecycle_reflector';
import {ParseTreeResult as HtmlParseTreeResult} from './ml_parser/parser';
import {splitAtColon, stringify} from './util';

// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
const HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;

export function sanitizeIdentifier(name: string): string {
  return name.replace(/\W/g, '_');
}

let _anonymousTypeIndex = 0;

export function identifierName(compileIdentifier: CompileIdentifierMetadata|null|undefined): string|
    null {
  if (!compileIdentifier || !compileIdentifier.reference) {
    return null;
  }
  const ref = compileIdentifier.reference;
  if (ref instanceof StaticSymbol) {
    return ref.name;
  }
  if (ref['__anonymousType']) {
    return ref['__anonymousType'];
  }
  if (ref['__forward_ref__']) {
    // We do not want to try to stringify a `forwardRef()` function because that would cause the
    // inner function to be evaluated too early, defeating the whole point of the `forwardRef`.
    return '__forward_ref__';
  }
  let identifier = stringify(ref);
  if (identifier.indexOf('(') >= 0) {
    // case: anonymous functions!
    identifier = `anonymous_${_anonymousTypeIndex++}`;
    ref['__anonymousType'] = identifier;
  } else {
    identifier = sanitizeIdentifier(identifier);
  }
  return identifier;
}

export function identifierModuleUrl(compileIdentifier: CompileIdentifierMetadata): string {
  const ref = compileIdentifier.reference;
  if (ref instanceof StaticSymbol) {
    return ref.filePath;
  }
  // Runtime type
  return `./${stringify(ref)}`;
}

export function viewClassName(compType: any, embeddedTemplateIndex: number): string {
  return `View_${identifierName({reference: compType})}_${embeddedTemplateIndex}`;
}

export function rendererTypeName(compType: any): string {
  return `RenderType_${identifierName({reference: compType})}`;
}

export function hostViewClassName(compType: any): string {
  return `HostView_${identifierName({reference: compType})}`;
}

export function componentFactoryName(compType: any): string {
  return `${identifierName({reference: compType})}NgFactory`;
}

export interface ProxyClass {
  setDelegate(delegate: any): void;
}

export interface CompileIdentifierMetadata {
  reference: any;
}

export enum CompileSummaryKind {
  Pipe,
  Directive,
  NgModule,
  Injectable
}

/**
 * A CompileSummary is the data needed to use a directive / pipe / module
 * in other modules / components. However, this data is not enough to compile
 * the directive / module itself.
 */
export interface CompileTypeSummary {
  summaryKind: CompileSummaryKind|null;
  type: CompileTypeMetadata;
}

export interface CompileDiDependencyMetadata {
  isAttribute?: boolean;
  isSelf?: boolean;
  isHost?: boolean;
  isSkipSelf?: boolean;
  isOptional?: boolean;
  isValue?: boolean;
  token?: CompileTokenMetadata;
  value?: any;
}

export interface CompileProviderMetadata {
  token: CompileTokenMetadata;
  useClass?: CompileTypeMetadata;
  useValue?: any;
  useExisting?: CompileTokenMetadata;
  useFactory?: CompileFactoryMetadata;
  deps?: CompileDiDependencyMetadata[];
  multi?: boolean;
}

export interface CompileFactoryMetadata extends CompileIdentifierMetadata {
  diDeps: CompileDiDependencyMetadata[];
  reference: any;
}

export function tokenName(token: CompileTokenMetadata) {
  return token.value != null ? sanitizeIdentifier(token.value) : identifierName(token.identifier);
}

export function tokenReference(token: CompileTokenMetadata) {
  if (token.identifier != null) {
    return token.identifier.reference;
  } else {
    return token.value;
  }
}

export interface CompileTokenMetadata {
  value?: any;
  identifier?: CompileIdentifierMetadata|CompileTypeMetadata;
}

export interface CompileInjectableMetadata {
  symbol: StaticSymbol;
  type: CompileTypeMetadata;

  providedIn?: StaticSymbol;

  useValue?: any;
  useClass?: StaticSymbol;
  useExisting?: StaticSymbol;
  useFactory?: StaticSymbol;
  deps?: any[];
}

/**
 * Metadata regarding compilation of a type.
 */
export interface CompileTypeMetadata extends CompileIdentifierMetadata {
  diDeps: CompileDiDependencyMetadata[];
  lifecycleHooks: LifecycleHooks[];
  reference: any;
}

export interface CompileQueryMetadata {
  selectors: Array<CompileTokenMetadata>;
  descendants: boolean;
  first: boolean;
  propertyName: string;
  read: CompileTokenMetadata;
  static?: boolean;
  emitDistinctChangesOnly?: boolean;
}

/**
 * Metadata about a stylesheet
 */
export class CompileStylesheetMetadata {
  moduleUrl: string|null;
  styles: string[];
  styleUrls: string[];
  constructor(
      {moduleUrl, styles, styleUrls}:
          {moduleUrl?: string, styles?: string[], styleUrls?: string[]} = {}) {
    this.moduleUrl = moduleUrl || null;
    this.styles = _normalizeArray(styles);
    this.styleUrls = _normalizeArray(styleUrls);
  }
}

/**
 * Summary Metadata regarding compilation of a template.
 */
export interface CompileTemplateSummary {
  ngContentSelectors: string[];
  encapsulation: ViewEncapsulation|null;
  styles: string[];
  animations: any[]|null;
}

/**
 * Metadata regarding compilation of a template.
 */
export class CompileTemplateMetadata {
  encapsulation: ViewEncapsulation|null;
  template: string|null;
  templateUrl: string|null;
  htmlAst: HtmlParseTreeResult|null;
  isInline: boolean;
  styles: string[];
  styleUrls: string[];
  externalStylesheets: CompileStylesheetMetadata[];
  animations: any[];
  ngContentSelectors: string[];
  interpolation: [string, string]|null;
  preserveWhitespaces: boolean;
  constructor({
    encapsulation,
    template,
    templateUrl,
    htmlAst,
    styles,
    styleUrls,
    externalStylesheets,
    animations,
    ngContentSelectors,
    interpolation,
    isInline,
    preserveWhitespaces
  }: {
    encapsulation: ViewEncapsulation|null,
    template: string|null,
    templateUrl: string|null,
    htmlAst: HtmlParseTreeResult|null,
    styles: string[],
    styleUrls: string[],
    externalStylesheets: CompileStylesheetMetadata[],
    ngContentSelectors: string[],
    animations: any[],
    interpolation: [string, string]|null,
    isInline: boolean,
    preserveWhitespaces: boolean
  }) {
    this.encapsulation = encapsulation;
    this.template = template;
    this.templateUrl = templateUrl;
    this.htmlAst = htmlAst;
    this.styles = _normalizeArray(styles);
    this.styleUrls = _normalizeArray(styleUrls);
    this.externalStylesheets = _normalizeArray(externalStylesheets);
    this.animations = animations ? flatten(animations) : [];
    this.ngContentSelectors = ngContentSelectors || [];
    if (interpolation && interpolation.length != 2) {
      throw new Error(`'interpolation' should have a start and an end symbol.`);
    }
    this.interpolation = interpolation;
    this.isInline = isInline;
    this.preserveWhitespaces = preserveWhitespaces;
  }

  toSummary(): CompileTemplateSummary {
    return {
      ngContentSelectors: this.ngContentSelectors,
      encapsulation: this.encapsulation,
      styles: this.styles,
      animations: this.animations
    };
  }
}

export interface CompileEntryComponentMetadata {
  componentType: any;
  componentFactory: StaticSymbol|object;
}

// Note: This should only use interfaces as nested data types
// as we need to be able to serialize this from/to JSON!
export interface CompileDirectiveSummary extends CompileTypeSummary {
  type: CompileTypeMetadata;
  isComponent: boolean;
  selector: string|null;
  exportAs: string|null;
  inputs: {[key: string]: string};
  outputs: {[key: string]: string};
  hostListeners: {[key: string]: string};
  hostProperties: {[key: string]: string};
  hostAttributes: {[key: string]: string};
  providers: CompileProviderMetadata[];
  viewProviders: CompileProviderMetadata[];
  queries: CompileQueryMetadata[];
  guards: {[key: string]: any};
  viewQueries: CompileQueryMetadata[];
  entryComponents: CompileEntryComponentMetadata[];
  changeDetection: ChangeDetectionStrategy|null;
  template: CompileTemplateSummary|null;
  componentViewType: StaticSymbol|ProxyClass|null;
  rendererType: StaticSymbol|object|null;
  componentFactory: StaticSymbol|object|null;
}

/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata {
  static create({
    isHost,
    type,
    isComponent,
    selector,
    exportAs,
    changeDetection,
    inputs,
    outputs,
    host,
    providers,
    viewProviders,
    queries,
    guards,
    viewQueries,
    entryComponents,
    template,
    componentViewType,
    rendererType,
    componentFactory
  }: {
    isHost: boolean,
    type: CompileTypeMetadata,
    isComponent: boolean,
    selector: string|null,
    exportAs: string|null,
    changeDetection: ChangeDetectionStrategy|null,
    inputs: string[],
    outputs: string[],
    host: {[key: string]: string},
    providers: CompileProviderMetadata[],
    viewProviders: CompileProviderMetadata[],
    queries: CompileQueryMetadata[],
    guards: {[key: string]: any};
    viewQueries: CompileQueryMetadata[],
    entryComponents: CompileEntryComponentMetadata[],
    template: CompileTemplateMetadata,
    componentViewType: StaticSymbol|ProxyClass|null,
    rendererType: StaticSymbol|object|null,
    componentFactory: StaticSymbol|object|null,
  }): CompileDirectiveMetadata {
    const hostListeners: {[key: string]: string} = {};
    const hostProperties: {[key: string]: string} = {};
    const hostAttributes: {[key: string]: string} = {};
    if (host != null) {
      Object.keys(host).forEach(key => {
        const value = host[key];
        const matches = key.match(HOST_REG_EXP);
        if (matches === null) {
          hostAttributes[key] = value;
        } else if (matches[1] != null) {
          hostProperties[matches[1]] = value;
        } else if (matches[2] != null) {
          hostListeners[matches[2]] = value;
        }
      });
    }
    const inputsMap: {[key: string]: string} = {};
    if (inputs != null) {
      inputs.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        const parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        inputsMap[parts[0]] = parts[1];
      });
    }
    const outputsMap: {[key: string]: string} = {};
    if (outputs != null) {
      outputs.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        const parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        outputsMap[parts[0]] = parts[1];
      });
    }

    return new CompileDirectiveMetadata({
      isHost,
      type,
      isComponent: !!isComponent,
      selector,
      exportAs,
      changeDetection,
      inputs: inputsMap,
      outputs: outputsMap,
      hostListeners,
      hostProperties,
      hostAttributes,
      providers,
      viewProviders,
      queries,
      guards,
      viewQueries,
      entryComponents,
      template,
      componentViewType,
      rendererType,
      componentFactory,
    });
  }
  isHost: boolean;
  type: CompileTypeMetadata;
  isComponent: boolean;
  selector: string|null;
  exportAs: string|null;
  changeDetection: ChangeDetectionStrategy|null;
  inputs: {[key: string]: string};
  outputs: {[key: string]: string};
  hostListeners: {[key: string]: string};
  hostProperties: {[key: string]: string};
  hostAttributes: {[key: string]: string};
  providers: CompileProviderMetadata[];
  viewProviders: CompileProviderMetadata[];
  queries: CompileQueryMetadata[];
  guards: {[key: string]: any};
  viewQueries: CompileQueryMetadata[];
  entryComponents: CompileEntryComponentMetadata[];

  template: CompileTemplateMetadata|null;

  componentViewType: StaticSymbol|ProxyClass|null;
  rendererType: StaticSymbol|object|null;
  componentFactory: StaticSymbol|object|null;

  constructor({
    isHost,
    type,
    isComponent,
    selector,
    exportAs,
    changeDetection,
    inputs,
    outputs,
    hostListeners,
    hostProperties,
    hostAttributes,
    providers,
    viewProviders,
    queries,
    guards,
    viewQueries,
    entryComponents,
    template,
    componentViewType,
    rendererType,
    componentFactory
  }: {
    isHost: boolean,
    type: CompileTypeMetadata,
    isComponent: boolean,
    selector: string|null,
    exportAs: string|null,
    changeDetection: ChangeDetectionStrategy|null,
    inputs: {[key: string]: string},
    outputs: {[key: string]: string},
    hostListeners: {[key: string]: string},
    hostProperties: {[key: string]: string},
    hostAttributes: {[key: string]: string},
    providers: CompileProviderMetadata[],
    viewProviders: CompileProviderMetadata[],
    queries: CompileQueryMetadata[],
    guards: {[key: string]: any},
    viewQueries: CompileQueryMetadata[],
    entryComponents: CompileEntryComponentMetadata[],
    template: CompileTemplateMetadata|null,
    componentViewType: StaticSymbol|ProxyClass|null,
    rendererType: StaticSymbol|object|null,
    componentFactory: StaticSymbol|object|null,
  }) {
    this.isHost = !!isHost;
    this.type = type;
    this.isComponent = isComponent;
    this.selector = selector;
    this.exportAs = exportAs;
    this.changeDetection = changeDetection;
    this.inputs = inputs;
    this.outputs = outputs;
    this.hostListeners = hostListeners;
    this.hostProperties = hostProperties;
    this.hostAttributes = hostAttributes;
    this.providers = _normalizeArray(providers);
    this.viewProviders = _normalizeArray(viewProviders);
    this.queries = _normalizeArray(queries);
    this.guards = guards;
    this.viewQueries = _normalizeArray(viewQueries);
    this.entryComponents = _normalizeArray(entryComponents);
    this.template = template;

    this.componentViewType = componentViewType;
    this.rendererType = rendererType;
    this.componentFactory = componentFactory;
  }

  toSummary(): CompileDirectiveSummary {
    return {
      summaryKind: CompileSummaryKind.Directive,
      type: this.type,
      isComponent: this.isComponent,
      selector: this.selector,
      exportAs: this.exportAs,
      inputs: this.inputs,
      outputs: this.outputs,
      hostListeners: this.hostListeners,
      hostProperties: this.hostProperties,
      hostAttributes: this.hostAttributes,
      providers: this.providers,
      viewProviders: this.viewProviders,
      queries: this.queries,
      guards: this.guards,
      viewQueries: this.viewQueries,
      entryComponents: this.entryComponents,
      changeDetection: this.changeDetection,
      template: this.template && this.template.toSummary(),
      componentViewType: this.componentViewType,
      rendererType: this.rendererType,
      componentFactory: this.componentFactory
    };
  }
}

export interface CompilePipeSummary extends CompileTypeSummary {
  type: CompileTypeMetadata;
  name: string;
  pure: boolean;
}

export class CompilePipeMetadata {
  type: CompileTypeMetadata;
  name: string;
  pure: boolean;

  constructor({type, name, pure}: {
    type: CompileTypeMetadata,
    name: string,
    pure: boolean,
  }) {
    this.type = type;
    this.name = name;
    this.pure = !!pure;
  }

  toSummary(): CompilePipeSummary {
    return {
      summaryKind: CompileSummaryKind.Pipe,
      type: this.type,
      name: this.name,
      pure: this.pure
    };
  }
}

// Note: This should only use interfaces as nested data types
// as we need to be able to serialize this from/to JSON!
export interface CompileNgModuleSummary extends CompileTypeSummary {
  type: CompileTypeMetadata;

  // Note: This is transitive over the exported modules.
  exportedDirectives: CompileIdentifierMetadata[];
  // Note: This is transitive over the exported modules.
  exportedPipes: CompileIdentifierMetadata[];

  // Note: This is transitive.
  entryComponents: CompileEntryComponentMetadata[];
  // Note: This is transitive.
  providers: {provider: CompileProviderMetadata, module: CompileIdentifierMetadata}[];
  // Note: This is transitive.
  modules: CompileTypeMetadata[];
}

export class CompileShallowModuleMetadata {
  // TODO(issue/24571): remove '!'.
  type!: CompileTypeMetadata;

  rawExports: any;
  rawImports: any;
  rawProviders: any;
}

/**
 * Metadata regarding compilation of a module.
 */
export class CompileNgModuleMetadata {
  type: CompileTypeMetadata;
  declaredDirectives: CompileIdentifierMetadata[];
  exportedDirectives: CompileIdentifierMetadata[];
  declaredPipes: CompileIdentifierMetadata[];

  exportedPipes: CompileIdentifierMetadata[];
  entryComponents: CompileEntryComponentMetadata[];
  bootstrapComponents: CompileIdentifierMetadata[];
  providers: CompileProviderMetadata[];

  importedModules: CompileNgModuleSummary[];
  exportedModules: CompileNgModuleSummary[];
  schemas: SchemaMetadata[];
  id: string|null;

  transitiveModule: TransitiveCompileNgModuleMetadata;

  constructor({
    type,
    providers,
    declaredDirectives,
    exportedDirectives,
    declaredPipes,
    exportedPipes,
    entryComponents,
    bootstrapComponents,
    importedModules,
    exportedModules,
    schemas,
    transitiveModule,
    id
  }: {
    type: CompileTypeMetadata,
    providers: CompileProviderMetadata[],
    declaredDirectives: CompileIdentifierMetadata[],
    exportedDirectives: CompileIdentifierMetadata[],
    declaredPipes: CompileIdentifierMetadata[],
    exportedPipes: CompileIdentifierMetadata[],
    entryComponents: CompileEntryComponentMetadata[],
    bootstrapComponents: CompileIdentifierMetadata[],
    importedModules: CompileNgModuleSummary[],
    exportedModules: CompileNgModuleSummary[],
    transitiveModule: TransitiveCompileNgModuleMetadata,
    schemas: SchemaMetadata[],
    id: string|null
  }) {
    this.type = type || null;
    this.declaredDirectives = _normalizeArray(declaredDirectives);
    this.exportedDirectives = _normalizeArray(exportedDirectives);
    this.declaredPipes = _normalizeArray(declaredPipes);
    this.exportedPipes = _normalizeArray(exportedPipes);
    this.providers = _normalizeArray(providers);
    this.entryComponents = _normalizeArray(entryComponents);
    this.bootstrapComponents = _normalizeArray(bootstrapComponents);
    this.importedModules = _normalizeArray(importedModules);
    this.exportedModules = _normalizeArray(exportedModules);
    this.schemas = _normalizeArray(schemas);
    this.id = id || null;
    this.transitiveModule = transitiveModule || null;
  }

  toSummary(): CompileNgModuleSummary {
    const module = this.transitiveModule!;
    return {
      summaryKind: CompileSummaryKind.NgModule,
      type: this.type,
      entryComponents: module.entryComponents,
      providers: module.providers,
      modules: module.modules,
      exportedDirectives: module.exportedDirectives,
      exportedPipes: module.exportedPipes
    };
  }
}

export class TransitiveCompileNgModuleMetadata {
  directivesSet = new Set<any>();
  directives: CompileIdentifierMetadata[] = [];
  exportedDirectivesSet = new Set<any>();
  exportedDirectives: CompileIdentifierMetadata[] = [];
  pipesSet = new Set<any>();
  pipes: CompileIdentifierMetadata[] = [];
  exportedPipesSet = new Set<any>();
  exportedPipes: CompileIdentifierMetadata[] = [];
  modulesSet = new Set<any>();
  modules: CompileTypeMetadata[] = [];
  entryComponentsSet = new Set<any>();
  entryComponents: CompileEntryComponentMetadata[] = [];

  providers: {provider: CompileProviderMetadata, module: CompileIdentifierMetadata}[] = [];

  addProvider(provider: CompileProviderMetadata, module: CompileIdentifierMetadata) {
    this.providers.push({provider: provider, module: module});
  }

  addDirective(id: CompileIdentifierMetadata) {
    if (!this.directivesSet.has(id.reference)) {
      this.directivesSet.add(id.reference);
      this.directives.push(id);
    }
  }
  addExportedDirective(id: CompileIdentifierMetadata) {
    if (!this.exportedDirectivesSet.has(id.reference)) {
      this.exportedDirectivesSet.add(id.reference);
      this.exportedDirectives.push(id);
    }
  }
  addPipe(id: CompileIdentifierMetadata) {
    if (!this.pipesSet.has(id.reference)) {
      this.pipesSet.add(id.reference);
      this.pipes.push(id);
    }
  }
  addExportedPipe(id: CompileIdentifierMetadata) {
    if (!this.exportedPipesSet.has(id.reference)) {
      this.exportedPipesSet.add(id.reference);
      this.exportedPipes.push(id);
    }
  }
  addModule(id: CompileTypeMetadata) {
    if (!this.modulesSet.has(id.reference)) {
      this.modulesSet.add(id.reference);
      this.modules.push(id);
    }
  }
  addEntryComponent(ec: CompileEntryComponentMetadata) {
    if (!this.entryComponentsSet.has(ec.componentType)) {
      this.entryComponentsSet.add(ec.componentType);
      this.entryComponents.push(ec);
    }
  }
}

function _normalizeArray(obj: any[]|undefined|null): any[] {
  return obj || [];
}

export class ProviderMeta {
  token: any;
  useClass: Type|null;
  useValue: any;
  useExisting: any;
  useFactory: Function|null;
  dependencies: Object[]|null;
  multi: boolean;

  constructor(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
    useClass?: Type,
    useValue?: any,
    useExisting?: any,
    useFactory?: Function|null,
    deps?: Object[]|null,
    multi?: boolean
  }) {
    this.token = token;
    this.useClass = useClass || null;
    this.useValue = useValue;
    this.useExisting = useExisting;
    this.useFactory = useFactory || null;
    this.dependencies = deps || null;
    this.multi = !!multi;
  }
}

export function flatten<T>(list: Array<T|T[]>): T[] {
  return list.reduce((flat: any[], item: T|T[]): T[] => {
    const flatItem = Array.isArray(item) ? flatten(item) : item;
    return (<T[]>flat).concat(flatItem);
  }, []);
}

function jitSourceUrl(url: string) {
  // Note: We need 3 "/" so that ng shows up as a separate domain
  // in the chrome dev tools.
  return url.replace(/(\w+:\/\/[\w:-]+)?(\/+)?/, 'ng:///');
}

export function templateSourceUrl(
    ngModuleType: CompileIdentifierMetadata, compMeta: {type: CompileIdentifierMetadata},
    templateMeta: {isInline: boolean, templateUrl: string|null}) {
  let url: string;
  if (templateMeta.isInline) {
    if (compMeta.type.reference instanceof StaticSymbol) {
      // Note: a .ts file might contain multiple components with inline templates,
      // so we need to give them unique urls, as these will be used for sourcemaps.
      url = `${compMeta.type.reference.filePath}.${compMeta.type.reference.name}.html`;
    } else {
      url = `${identifierName(ngModuleType)}/${identifierName(compMeta.type)}.html`;
    }
  } else {
    url = templateMeta.templateUrl!;
  }
  return compMeta.type.reference instanceof StaticSymbol ? url : jitSourceUrl(url);
}

export function sharedStylesheetJitUrl(meta: CompileStylesheetMetadata, id: number) {
  const pathParts = meta.moduleUrl!.split(/\/\\/g);
  const baseName = pathParts[pathParts.length - 1];
  return jitSourceUrl(`css/${id}${baseName}.ngstyle.js`);
}

export function ngModuleJitUrl(moduleMeta: CompileNgModuleMetadata): string {
  return jitSourceUrl(`${identifierName(moduleMeta.type)}/module.ngfactory.js`);
}

export function templateJitUrl(
    ngModuleType: CompileIdentifierMetadata, compMeta: CompileDirectiveMetadata): string {
  return jitSourceUrl(
      `${identifierName(ngModuleType)}/${identifierName(compMeta.type)}.ngfactory.js`);
}
