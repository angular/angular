/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, SchemaMetadata, Type, ViewEncapsulation} from '@angular/core';

import {ListWrapper} from './facade/collection';
import {isPresent} from './facade/lang';
import {LifecycleHooks} from './private_import_core';
import {CssSelector} from './selector';
import {sanitizeIdentifier, splitAtColon} from './util';

function unimplemented(): any {
  throw new Error('unimplemented');
}

// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
const HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;

export abstract class CompileMetadataWithIdentifier {
  get identifier(): CompileIdentifierMetadata { return <CompileIdentifierMetadata>unimplemented(); }
}

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
  constructor(public stateChangeExpr: string, public steps: CompileAnimationMetadata) { super(); }
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

export class CompileIdentifierMetadata implements CompileMetadataWithIdentifier {
  reference: any;
  name: string;
  prefix: string;
  moduleUrl: string;
  value: any;

  constructor(
      {reference, name, moduleUrl, prefix, value}:
          {reference?: any, name?: string, moduleUrl?: string, prefix?: string, value?: any} = {}) {
    this.reference = reference;
    this.name = name;
    this.prefix = prefix;
    this.moduleUrl = moduleUrl;
    this.value = value;
  }

  get identifier(): CompileIdentifierMetadata { return this; }
}

/**
 * A CompileSummary is the data needed to use a directive / pipe / module
 * in other modules / components. However, this data is not enough to compile
 * the directive / module itself.
 */
export interface CompileSummary {
  isSummary: boolean /* TODO: `true` when we drop TS 1.8 support */;
}

export class CompileDiDependencyMetadata {
  isAttribute: boolean;
  isSelf: boolean;
  isHost: boolean;
  isSkipSelf: boolean;
  isOptional: boolean;
  isValue: boolean;
  token: CompileTokenMetadata;
  value: any;

  constructor({isAttribute, isSelf, isHost, isSkipSelf, isOptional, isValue, token, value}: {
    isAttribute?: boolean,
    isSelf?: boolean,
    isHost?: boolean,
    isSkipSelf?: boolean,
    isOptional?: boolean,
    isValue?: boolean,
    query?: CompileQueryMetadata,
    viewQuery?: CompileQueryMetadata,
    token?: CompileTokenMetadata,
    value?: any
  } = {}) {
    this.isAttribute = !!isAttribute;
    this.isSelf = !!isSelf;
    this.isHost = !!isHost;
    this.isSkipSelf = !!isSkipSelf;
    this.isOptional = !!isOptional;
    this.isValue = !!isValue;
    this.token = token;
    this.value = value;
  }
}

export class CompileProviderMetadata {
  token: CompileTokenMetadata;
  useClass: CompileTypeMetadata;
  useValue: any;
  useExisting: CompileTokenMetadata;
  useFactory: CompileFactoryMetadata;
  deps: CompileDiDependencyMetadata[];
  multi: boolean;

  constructor({token, useClass, useValue, useExisting, useFactory, deps, multi}: {
    token?: CompileTokenMetadata,
    useClass?: CompileTypeMetadata,
    useValue?: any,
    useExisting?: CompileTokenMetadata,
    useFactory?: CompileFactoryMetadata,
    deps?: CompileDiDependencyMetadata[],
    multi?: boolean
  }) {
    this.token = token;
    this.useClass = useClass;
    this.useValue = useValue;
    this.useExisting = useExisting;
    this.useFactory = useFactory;
    this.deps = deps || null;
    this.multi = !!multi;
  }
}

export class CompileFactoryMetadata extends CompileIdentifierMetadata {
  diDeps: CompileDiDependencyMetadata[];

  constructor({reference, name, moduleUrl, prefix, diDeps, value}: {
    reference?: Function,
    name?: string,
    prefix?: string,
    moduleUrl?: string,
    value?: boolean,
    diDeps?: CompileDiDependencyMetadata[]
  }) {
    super({reference: reference, name: name, prefix: prefix, moduleUrl: moduleUrl, value: value});
    this.diDeps = _normalizeArray(diDeps);
  }
}

export class CompileTokenMetadata implements CompileMetadataWithIdentifier {
  value: any;
  identifier: CompileIdentifierMetadata;
  identifierIsInstance: boolean;

  constructor(
      {value, identifier, identifierIsInstance}:
          {value?: any, identifier?: CompileIdentifierMetadata, identifierIsInstance?: boolean}) {
    this.value = value;
    this.identifier = identifier;
    this.identifierIsInstance = !!identifierIsInstance;
  }

  get reference(): any {
    if (isPresent(this.identifier)) {
      return this.identifier.reference;
    } else {
      return this.value;
    }
  }

  get name(): string {
    return isPresent(this.value) ? sanitizeIdentifier(this.value) : this.identifier.name;
  }
}

/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata extends CompileIdentifierMetadata {
  isHost: boolean;
  diDeps: CompileDiDependencyMetadata[];
  lifecycleHooks: LifecycleHooks[];

  constructor({reference, name, moduleUrl, prefix, isHost, value, diDeps, lifecycleHooks}: {
    reference?: Type<any>,
    name?: string,
    moduleUrl?: string,
    prefix?: string,
    isHost?: boolean,
    value?: any,
    diDeps?: CompileDiDependencyMetadata[],
    lifecycleHooks?: LifecycleHooks[];
  } = {}) {
    super({reference: reference, name: name, moduleUrl: moduleUrl, prefix: prefix, value: value});
    this.isHost = !!isHost;
    this.diDeps = _normalizeArray(diDeps);
    this.lifecycleHooks = _normalizeArray(lifecycleHooks);
  }
}

export class CompileQueryMetadata {
  selectors: Array<CompileTokenMetadata>;
  descendants: boolean;
  first: boolean;
  propertyName: string;
  read: CompileTokenMetadata;

  constructor({selectors, descendants, first, propertyName, read}: {
    selectors?: Array<CompileTokenMetadata>,
    descendants?: boolean,
    first?: boolean,
    propertyName?: string,
    read?: CompileTokenMetadata
  } = {}) {
    this.selectors = selectors;
    this.descendants = !!descendants;
    this.first = !!first;
    this.propertyName = propertyName;
    this.read = read;
  }
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
export interface CompileTemplateSummary extends CompileSummary {
  isSummary: boolean /* TODO: `true` when we drop TS 1.8 support */;
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
        interpolation?: [string, string]
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
      isSummary: true,
      animations: this.animations.map(anim => anim.name),
      ngContentSelectors: this.ngContentSelectors,
      encapsulation: this.encapsulation
    };
  }
}

export interface CompileDirectiveSummary extends CompileSummary {
  isSummary: boolean /* TODO: `true` when we drop TS 1.8 support */;
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
  entryComponents: CompileIdentifierMetadata[];
  changeDetection: ChangeDetectionStrategy;
  template: CompileTemplateSummary;
}

/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata implements CompileMetadataWithIdentifier {
  static create(
      {type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, providers,
       viewProviders, queries, viewQueries, entryComponents, template}: {
        type?: CompileTypeMetadata,
        isComponent?: boolean,
        selector?: string,
        exportAs?: string,
        changeDetection?: ChangeDetectionStrategy,
        inputs?: string[],
        outputs?: string[],
        host?: {[key: string]: string},
        providers?:
            Array<CompileProviderMetadata|CompileTypeMetadata|CompileIdentifierMetadata|any[]>,
        viewProviders?:
            Array<CompileProviderMetadata|CompileTypeMetadata|CompileIdentifierMetadata|any[]>,
        queries?: CompileQueryMetadata[],
        viewQueries?: CompileQueryMetadata[],
        entryComponents?: CompileIdentifierMetadata[],
        template?: CompileTemplateMetadata
      } = {}): CompileDirectiveMetadata {
    var hostListeners: {[key: string]: string} = {};
    var hostProperties: {[key: string]: string} = {};
    var hostAttributes: {[key: string]: string} = {};
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
    var inputsMap: {[key: string]: string} = {};
    if (isPresent(inputs)) {
      inputs.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        inputsMap[parts[0]] = parts[1];
      });
    }
    var outputsMap: {[key: string]: string} = {};
    if (isPresent(outputs)) {
      outputs.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        outputsMap[parts[0]] = parts[1];
      });
    }

    return new CompileDirectiveMetadata({
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
    });
  }
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
  entryComponents: CompileIdentifierMetadata[];

  template: CompileTemplateMetadata;

  constructor(
      {type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners,
       hostProperties, hostAttributes, providers, viewProviders, queries, viewQueries,
       entryComponents, template}: {
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
        providers?:
            Array<CompileProviderMetadata|CompileTypeMetadata|CompileIdentifierMetadata|any[]>,
        viewProviders?:
            Array<CompileProviderMetadata|CompileTypeMetadata|CompileIdentifierMetadata|any[]>,
        queries?: CompileQueryMetadata[],
        viewQueries?: CompileQueryMetadata[],
        entryComponents?: CompileIdentifierMetadata[],
        template?: CompileTemplateMetadata,
      } = {}) {
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
  }

  get identifier(): CompileIdentifierMetadata { return this.type; }

  toSummary(): CompileDirectiveSummary {
    return {
      isSummary: true,
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
      template: this.template && this.template.toSummary()
    };
  }
}

/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export function createHostComponentMeta(compMeta: CompileDirectiveMetadata):
    CompileDirectiveMetadata {
  var template = CssSelector.parse(compMeta.selector)[0].getMatchingElementTemplate();
  return CompileDirectiveMetadata.create({
    type: new CompileTypeMetadata({
      reference: Object,
      name: `${compMeta.type.name}_Host`,
      moduleUrl: compMeta.type.moduleUrl,
      isHost: true
    }),
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
    viewQueries: []
  });
}

export interface CompilePipeSummary extends CompileSummary {
  isSummary: boolean /* TODO: `true` when we drop TS 1.8 support */;
  type: CompileTypeMetadata;
  name: string;
  pure: boolean;
}

export class CompilePipeMetadata implements CompileMetadataWithIdentifier {
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
  get identifier(): CompileIdentifierMetadata { return this.type; }

  toSummary(): CompilePipeSummary {
    return {isSummary: true, type: this.type, name: this.name, pure: this.pure};
  }
}

export interface CompileNgModuleInjectorSummary extends CompileSummary {
  isSummary: boolean /* TODO: `true` when we drop TS 1.8 support */;
  type: CompileTypeMetadata;
  entryComponents: CompileIdentifierMetadata[];
  providers: CompileProviderMetadata[];
  importedModules: CompileNgModuleInjectorSummary[];
  exportedModules: CompileNgModuleInjectorSummary[];
}

export interface CompileNgModuleDirectiveSummary extends CompileSummary {
  isSummary: boolean /* TODO: `true` when we drop TS 1.8 support */;
  type: CompileTypeMetadata;
  exportedDirectives: CompileIdentifierMetadata[];
  exportedPipes: CompileIdentifierMetadata[];
  exportedModules: CompileNgModuleDirectiveSummary[];
  loadingPromises: Promise<any>[];
}

export type CompileNgModuleSummary =
    CompileNgModuleInjectorSummary & CompileNgModuleDirectiveSummary;

/**
 * Metadata regarding compilation of a module.
 */
export class CompileNgModuleMetadata implements CompileMetadataWithIdentifier {
  type: CompileTypeMetadata;
  declaredDirectives: CompileIdentifierMetadata[];
  exportedDirectives: CompileIdentifierMetadata[];
  declaredPipes: CompileIdentifierMetadata[];
  exportedPipes: CompileIdentifierMetadata[];
  entryComponents: CompileIdentifierMetadata[];
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
        providers?:
            Array<CompileProviderMetadata|CompileTypeMetadata|CompileIdentifierMetadata|any[]>,
        declaredDirectives?: CompileIdentifierMetadata[],
        exportedDirectives?: CompileIdentifierMetadata[],
        declaredPipes?: CompileIdentifierMetadata[],
        exportedPipes?: CompileIdentifierMetadata[],
        entryComponents?: CompileIdentifierMetadata[],
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

  get identifier(): CompileIdentifierMetadata { return this.type; }

  toSummary(): CompileNgModuleSummary {
    return {
      isSummary: true,
      type: this.type,
      entryComponents: this.entryComponents,
      providers: this.providers,
      importedModules: this.importedModules,
      exportedModules: this.exportedModules,
      exportedDirectives: this.exportedDirectives,
      exportedPipes: this.exportedPipes,
      loadingPromises: this.transitiveModule.loadingPromises
    };
  }

  toInjectorSummary(): CompileNgModuleInjectorSummary {
    return {
      isSummary: true,
      type: this.type,
      entryComponents: this.entryComponents,
      providers: this.providers,
      importedModules: this.importedModules,
      exportedModules: this.exportedModules
    };
  }
  toDirectiveSummary(): CompileNgModuleDirectiveSummary {
    return {
      isSummary: true,
      type: this.type,
      exportedDirectives: this.exportedDirectives,
      exportedPipes: this.exportedPipes,
      exportedModules: this.exportedModules,
      loadingPromises: this.transitiveModule.loadingPromises
    };
  }
}

export class TransitiveCompileNgModuleMetadata {
  directivesSet = new Set<any>();
  pipesSet = new Set<any>();

  constructor(
      public modules: CompileNgModuleInjectorSummary[], public providers: CompileProviderMetadata[],
      public entryComponents: CompileIdentifierMetadata[],
      public directives: CompileIdentifierMetadata[], public pipes: CompileIdentifierMetadata[],
      public loadingPromises: Promise<any>[]) {
    directives.forEach(dir => this.directivesSet.add(dir.reference));
    pipes.forEach(pipe => this.pipesSet.add(pipe.reference));
  }
}

export function removeIdentifierDuplicates<T extends CompileMetadataWithIdentifier>(items: T[]):
    T[] {
  const map = new Map<any, T>();

  items.forEach((item) => {
    if (!map.get(item.identifier.reference)) {
      map.set(item.identifier.reference, item);
    }
  });

  return Array.from(map.values());
}

function _normalizeArray(obj: any[]): any[] {
  return obj || [];
}

export function isStaticSymbol(value: any): value is StaticSymbol {
  return typeof value === 'object' && value !== null && value['name'] && value['filePath'];
}

export interface StaticSymbol {
  name: string;
  filePath: string;
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
