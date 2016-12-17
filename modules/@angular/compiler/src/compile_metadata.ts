/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ComponentFactory, SchemaMetadata, Type, ViewEncapsulation} from '@angular/core';

import {StaticSymbol} from './aot/static_symbol';
import {ListWrapper} from './facade/collection';
import {isPresent, stringify} from './facade/lang';
import {LifecycleHooks, reflector} from './private_import_core';
import {CssSelector} from './selector';
import {splitAtColon} from './util';

function unimplemented(): any {
  throw new Error('unimplemented');
}

// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
const HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;

export class CompileAnimationEntryMetadata {
  constructor(
      public name: string = null, public definitions: CompileAnimationStateMetadata[] = null) {}
}

export abstract class CompileAnimationStateMetadata {}

export class CompileAnimationStateDeclarationMetadata extends CompileAnimationStateMetadata {
  constructor(public stateNameExpr: string, public styles: CompileAnimationStyleMetadata) {
    super();
  }
}

export class CompileAnimationStateTransitionMetadata extends CompileAnimationStateMetadata {
  constructor(
      public stateChangeExpr: string|StaticSymbol|((stateA: string, stateB: string) => boolean),
      public steps: CompileAnimationMetadata) {
    super();
  }
}

export abstract class CompileAnimationMetadata {}

export class CompileAnimationKeyframesSequenceMetadata extends CompileAnimationMetadata {
  constructor(public steps: CompileAnimationStyleMetadata[] = []) { super(); }
}

export class CompileAnimationStyleMetadata extends CompileAnimationMetadata {
  constructor(
      public offset: number, public styles: Array<string|{[key: string]: string | number}> = null) {
    super();
  }
}

export class CompileAnimationAnimateMetadata extends CompileAnimationMetadata {
  constructor(
      public timings: string|number = 0, public styles: CompileAnimationStyleMetadata|
      CompileAnimationKeyframesSequenceMetadata = null) {
    super();
  }
}

export abstract class CompileAnimationWithStepsMetadata extends CompileAnimationMetadata {
  constructor(public steps: CompileAnimationMetadata[] = null) { super(); }
}

export class CompileAnimationSequenceMetadata extends CompileAnimationWithStepsMetadata {
  constructor(steps: CompileAnimationMetadata[] = null) { super(steps); }
}

export class CompileAnimationGroupMetadata extends CompileAnimationWithStepsMetadata {
  constructor(steps: CompileAnimationMetadata[] = null) { super(steps); }
}


function _sanitizeIdentifier(name: string): string {
  return name.replace(/\W/g, '_');
}

let _anonymousTypeIndex = 0;

export function identifierName(compileIdentifier: CompileIdentifierMetadata): string {
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
  let identifier = stringify(ref);
  if (identifier.indexOf('(') >= 0) {
    // case: anonymous functions!
    identifier = `anonymous_${_anonymousTypeIndex++}`;
    ref['__anonymousType'] = identifier;
  } else {
    identifier = _sanitizeIdentifier(identifier);
  }
  return identifier;
}

export function identifierModuleUrl(compileIdentifier: CompileIdentifierMetadata): string {
  const ref = compileIdentifier.reference;
  if (ref instanceof StaticSymbol) {
    return ref.filePath;
  }
  return reflector.importUri(ref);
}

export function viewClassName(compType: any, embeddedTemplateIndex: number): string {
  return `View_${identifierName({reference: compType})}_${embeddedTemplateIndex}`;
}

export function hostViewClassName(compType: any): string {
  return `HostView_${identifierName({reference: compType})}`;
}

export function dirWrapperClassName(dirType: any) {
  return `Wrapper_${identifierName({reference: dirType})}`;
}

export function componentFactoryName(compType: any): string {
  return `${identifierName({reference: compType})}NgFactory`;
}

export interface ProxyClass { setDelegate(delegate: any): void; }

export interface CompileIdentifierMetadata { reference: any; }

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
  summaryKind: CompileSummaryKind;
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
  return isPresent(token.value) ? _sanitizeIdentifier(token.value) :
                                  identifierName(token.identifier);
}

export function tokenReference(token: CompileTokenMetadata) {
  if (isPresent(token.identifier)) {
    return token.identifier.reference;
  } else {
    return token.value;
  }
}

export interface CompileTokenMetadata {
  value?: any;
  identifier?: CompileIdentifierMetadata|CompileTypeMetadata;
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
}

/**
 * Metadata about a stylesheet
 */
export class CompileStylesheetMetadata {
  moduleUrl: string;
  styles: string[];
  styleUrls: string[];
  constructor(
      {moduleUrl, styles,
       styleUrls}: {moduleUrl?: string, styles?: string[], styleUrls?: string[]} = {}) {
    this.moduleUrl = moduleUrl;
    this.styles = _normalizeArray(styles);
    this.styleUrls = _normalizeArray(styleUrls);
  }
}

/**
 * Summary Metadata regarding compilation of a template.
 */
export interface CompileTemplateSummary {
  animations: string[];
  ngContentSelectors: string[];
  encapsulation: ViewEncapsulation;
}

/**
 * Metadata regarding compilation of a template.
 */
export class CompileTemplateMetadata {
  encapsulation: ViewEncapsulation;
  template: string;
  templateUrl: string;
  styles: string[];
  styleUrls: string[];
  externalStylesheets: CompileStylesheetMetadata[];
  animations: CompileAnimationEntryMetadata[];
  ngContentSelectors: string[];
  interpolation: [string, string];
  constructor(
      {encapsulation, template, templateUrl, styles, styleUrls, externalStylesheets, animations,
       ngContentSelectors, interpolation}: {
        encapsulation?: ViewEncapsulation,
        template?: string,
        templateUrl?: string,
        styles?: string[],
        styleUrls?: string[],
        externalStylesheets?: CompileStylesheetMetadata[],
        ngContentSelectors?: string[],
        animations?: CompileAnimationEntryMetadata[],
        interpolation?: [string, string],
      } = {}) {
    this.encapsulation = encapsulation;
    this.template = template;
    this.templateUrl = templateUrl;
    this.styles = _normalizeArray(styles);
    this.styleUrls = _normalizeArray(styleUrls);
    this.externalStylesheets = _normalizeArray(externalStylesheets);
    this.animations = animations ? ListWrapper.flatten(animations) : [];
    this.ngContentSelectors = ngContentSelectors || [];
    if (interpolation && interpolation.length != 2) {
      throw new Error(`'interpolation' should have a start and an end symbol.`);
    }
    this.interpolation = interpolation;
  }

  toSummary(): CompileTemplateSummary {
    return {
      animations: this.animations.map(anim => anim.name),
      ngContentSelectors: this.ngContentSelectors,
      encapsulation: this.encapsulation,
    };
  }
}

export interface CompileEntryComponentMetadata {
  componentType: any;
  componentFactory: StaticSymbol|ComponentFactory<any>;
}

// Note: This should only use interfaces as nested data types
// as we need to be able to serialize this from/to JSON!
export interface CompileDirectiveSummary extends CompileTypeSummary {
  type: CompileTypeMetadata;
  isComponent: boolean;
  selector: string;
  exportAs: string;
  inputs: {[key: string]: string};
  outputs: {[key: string]: string};
  hostListeners: {[key: string]: string};
  hostProperties: {[key: string]: string};
  hostAttributes: {[key: string]: string};
  providers: CompileProviderMetadata[];
  viewProviders: CompileProviderMetadata[];
  queries: CompileQueryMetadata[];
  entryComponents: CompileEntryComponentMetadata[];
  changeDetection: ChangeDetectionStrategy;
  template: CompileTemplateSummary;
  wrapperType: StaticSymbol|ProxyClass;
  componentViewType: StaticSymbol|ProxyClass;
  componentFactory: StaticSymbol|ComponentFactory<any>;
}

/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata {
  static create(
      {isHost, type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host,
       providers, viewProviders, queries, viewQueries, entryComponents, template, wrapperType,
       componentViewType, componentFactory}: {
        isHost?: boolean,
        type?: CompileTypeMetadata,
        isComponent?: boolean,
        selector?: string,
        exportAs?: string,
        changeDetection?: ChangeDetectionStrategy,
        inputs?: string[],
        outputs?: string[],
        host?: {[key: string]: string},
        providers?: CompileProviderMetadata[],
        viewProviders?: CompileProviderMetadata[],
        queries?: CompileQueryMetadata[],
        viewQueries?: CompileQueryMetadata[],
        entryComponents?: CompileEntryComponentMetadata[],
        template?: CompileTemplateMetadata,
        wrapperType?: StaticSymbol|ProxyClass,
        componentViewType?: StaticSymbol|ProxyClass,
        componentFactory?: StaticSymbol|ComponentFactory<any>,
      } = {}): CompileDirectiveMetadata {
    const hostListeners: {[key: string]: string} = {};
    const hostProperties: {[key: string]: string} = {};
    const hostAttributes: {[key: string]: string} = {};
    if (isPresent(host)) {
      Object.keys(host).forEach(key => {
        const value = host[key];
        const matches = key.match(HOST_REG_EXP);
        if (matches === null) {
          hostAttributes[key] = value;
        } else if (isPresent(matches[1])) {
          hostProperties[matches[1]] = value;
        } else if (isPresent(matches[2])) {
          hostListeners[matches[2]] = value;
        }
      });
    }
    const inputsMap: {[key: string]: string} = {};
    if (isPresent(inputs)) {
      inputs.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        const parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        inputsMap[parts[0]] = parts[1];
      });
    }
    const outputsMap: {[key: string]: string} = {};
    if (isPresent(outputs)) {
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
      isComponent: !!isComponent, selector, exportAs, changeDetection,
      inputs: inputsMap,
      outputs: outputsMap,
      hostListeners,
      hostProperties,
      hostAttributes,
      providers,
      viewProviders,
      queries,
      viewQueries,
      entryComponents,
      template,
      wrapperType,
      componentViewType,
      componentFactory,
    });
  }
  isHost: boolean;
  type: CompileTypeMetadata;
  isComponent: boolean;
  selector: string;
  exportAs: string;
  changeDetection: ChangeDetectionStrategy;
  inputs: {[key: string]: string};
  outputs: {[key: string]: string};
  hostListeners: {[key: string]: string};
  hostProperties: {[key: string]: string};
  hostAttributes: {[key: string]: string};
  providers: CompileProviderMetadata[];
  viewProviders: CompileProviderMetadata[];
  queries: CompileQueryMetadata[];
  viewQueries: CompileQueryMetadata[];
  entryComponents: CompileEntryComponentMetadata[];

  template: CompileTemplateMetadata;

  wrapperType: StaticSymbol|ProxyClass;
  componentViewType: StaticSymbol|ProxyClass;
  componentFactory: StaticSymbol|ComponentFactory<any>;

  constructor({isHost,          type,      isComponent,   selector,          exportAs,
               changeDetection, inputs,    outputs,       hostListeners,     hostProperties,
               hostAttributes,  providers, viewProviders, queries,           viewQueries,
               entryComponents, template,  wrapperType,   componentViewType, componentFactory}: {
    isHost?: boolean,
    type?: CompileTypeMetadata,
    isComponent?: boolean,
    selector?: string,
    exportAs?: string,
    changeDetection?: ChangeDetectionStrategy,
    inputs?: {[key: string]: string},
    outputs?: {[key: string]: string},
    hostListeners?: {[key: string]: string},
    hostProperties?: {[key: string]: string},
    hostAttributes?: {[key: string]: string},
    providers?: CompileProviderMetadata[],
    viewProviders?: CompileProviderMetadata[],
    queries?: CompileQueryMetadata[],
    viewQueries?: CompileQueryMetadata[],
    entryComponents?: CompileEntryComponentMetadata[],
    template?: CompileTemplateMetadata,
    wrapperType?: StaticSymbol|ProxyClass,
    componentViewType?: StaticSymbol|ProxyClass,
    componentFactory?: StaticSymbol|ComponentFactory<any>,
  } = {}) {
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
    this.viewQueries = _normalizeArray(viewQueries);
    this.entryComponents = _normalizeArray(entryComponents);
    this.template = template;

    this.wrapperType = wrapperType;
    this.componentViewType = componentViewType;
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
      entryComponents: this.entryComponents,
      changeDetection: this.changeDetection,
      template: this.template && this.template.toSummary(),
      wrapperType: this.wrapperType,
      componentViewType: this.componentViewType,
      componentFactory: this.componentFactory
    };
  }
}

/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export function createHostComponentMeta(
    hostTypeReference: any, compMeta: CompileDirectiveMetadata,
    hostViewType: StaticSymbol | ProxyClass): CompileDirectiveMetadata {
  const template = CssSelector.parse(compMeta.selector)[0].getMatchingElementTemplate();
  return CompileDirectiveMetadata.create({
    isHost: true,
    type: {reference: hostTypeReference, diDeps: [], lifecycleHooks: []},
    template: new CompileTemplateMetadata({
      encapsulation: ViewEncapsulation.None,
      template: template,
      templateUrl: '',
      styles: [],
      styleUrls: [],
      ngContentSelectors: [],
      animations: []
    }),
    changeDetection: ChangeDetectionStrategy.Default,
    inputs: [],
    outputs: [],
    host: {},
    isComponent: true,
    selector: '*',
    providers: [],
    viewProviders: [],
    queries: [],
    viewQueries: [],
    componentViewType: hostViewType
  });
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
    type?: CompileTypeMetadata,
    name?: string,
    pure?: boolean,
  } = {}) {
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
  id: string;

  transitiveModule: TransitiveCompileNgModuleMetadata;

  constructor(
      {type, providers, declaredDirectives, exportedDirectives, declaredPipes, exportedPipes,
       entryComponents, bootstrapComponents, importedModules, exportedModules, schemas,
       transitiveModule, id}: {
        type?: CompileTypeMetadata,
        providers?: CompileProviderMetadata[],
        declaredDirectives?: CompileIdentifierMetadata[],
        exportedDirectives?: CompileIdentifierMetadata[],
        declaredPipes?: CompileIdentifierMetadata[],
        exportedPipes?: CompileIdentifierMetadata[],
        entryComponents?: CompileEntryComponentMetadata[],
        bootstrapComponents?: CompileIdentifierMetadata[],
        importedModules?: CompileNgModuleSummary[],
        exportedModules?: CompileNgModuleSummary[],
        transitiveModule?: TransitiveCompileNgModuleMetadata,
        schemas?: SchemaMetadata[],
        id?: string
      } = {}) {
    this.type = type;
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
    this.id = id;
    this.transitiveModule = transitiveModule;
  }

  toSummary(): CompileNgModuleSummary {
    return {
      summaryKind: CompileSummaryKind.NgModule,
      type: this.type,
      entryComponents: this.transitiveModule.entryComponents,
      providers: this.transitiveModule.providers,
      modules: this.transitiveModule.modules,
      exportedDirectives: this.transitiveModule.exportedDirectives,
      exportedPipes: this.transitiveModule.exportedPipes
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

function _normalizeArray(obj: any[]): any[] {
  return obj || [];
}

export class ProviderMeta {
  token: any;
  useClass: Type<any>;
  useValue: any;
  useExisting: any;
  useFactory: Function;
  dependencies: Object[];
  multi: boolean;

  constructor(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
    useClass?: Type<any>,
    useValue?: any,
    useExisting?: any,
    useFactory?: Function,
    deps?: Object[],
    multi?: boolean
  }) {
    this.token = token;
    this.useClass = useClass;
    this.useValue = useValue;
    this.useExisting = useExisting;
    this.useFactory = useFactory;
    this.dependencies = deps;
    this.multi = !!multi;
  }
}
