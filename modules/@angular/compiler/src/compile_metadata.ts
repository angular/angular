/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, SchemaMetadata, ViewEncapsulation} from '@angular/core';

import {LifecycleHooks, reflector} from '../core_private';
import {ListWrapper, StringMapWrapper} from './facade/collection';
import {BaseException, unimplemented} from './facade/exceptions';
import {RegExpWrapper, Type, isBlank, isPresent, isStringMap, normalizeBlank, normalizeBool} from './facade/lang';

import {CssSelector} from './selector';
import {getUrlScheme} from './url_resolver';
import {sanitizeIdentifier, splitAtColon} from './util';



// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
const HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/g;
const UNDEFINED = new Object();

export abstract class CompileMetadataWithIdentifier {
  get identifier(): CompileIdentifierMetadata { return <CompileIdentifierMetadata>unimplemented(); }

  get runtimeCacheKey(): any { return unimplemented(); }

  get assetCacheKey(): any { return unimplemented(); }

  equalsTo(id2: CompileMetadataWithIdentifier): boolean { return unimplemented(); }
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
  runtime: any;
  name: string;
  prefix: string;
  moduleUrl: string;
  value: any;
  private _assetCacheKey: any = UNDEFINED;

  constructor(
      {runtime, name, moduleUrl, prefix, value}:
          {runtime?: any, name?: string, moduleUrl?: string, prefix?: string, value?: any} = {}) {
    this.runtime = runtime;
    this.name = name;
    this.prefix = prefix;
    this.moduleUrl = moduleUrl;
    this.value = value;
  }

  get identifier(): CompileIdentifierMetadata { return this; }

  get runtimeCacheKey(): any { return this.identifier.runtime; }

  get assetCacheKey(): any {
    if (this._assetCacheKey === UNDEFINED) {
      if (isPresent(this.moduleUrl) && isPresent(getUrlScheme(this.moduleUrl))) {
        var uri = reflector.importUri({'filePath': this.moduleUrl, 'name': this.name});
        this._assetCacheKey = `${this.name}|${uri}`;
      } else {
        this._assetCacheKey = null;
      }
    }
    return this._assetCacheKey;
  }

  equalsTo(id2: CompileIdentifierMetadata): boolean {
    var rk = this.runtimeCacheKey;
    var ak = this.assetCacheKey;
    return (isPresent(rk) && rk == id2.runtimeCacheKey) ||
        (isPresent(ak) && ak == id2.assetCacheKey);
  }
}

export class CompileDiDependencyMetadata {
  isAttribute: boolean;
  isSelf: boolean;
  isHost: boolean;
  isSkipSelf: boolean;
  isOptional: boolean;
  isValue: boolean;
  query: CompileQueryMetadata;
  viewQuery: CompileQueryMetadata;
  token: CompileTokenMetadata;
  value: any;

  constructor(
      {isAttribute, isSelf, isHost, isSkipSelf, isOptional, isValue, query, viewQuery, token,
       value}: {
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
    this.isAttribute = normalizeBool(isAttribute);
    this.isSelf = normalizeBool(isSelf);
    this.isHost = normalizeBool(isHost);
    this.isSkipSelf = normalizeBool(isSkipSelf);
    this.isOptional = normalizeBool(isOptional);
    this.isValue = normalizeBool(isValue);
    this.query = query;
    this.viewQuery = viewQuery;
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
    this.deps = normalizeBlank(deps);
    this.multi = normalizeBool(multi);
  }
}

export class CompileFactoryMetadata extends CompileIdentifierMetadata {
  diDeps: CompileDiDependencyMetadata[];

  constructor({runtime, name, moduleUrl, prefix, diDeps, value}: {
    runtime?: Function,
    name?: string,
    prefix?: string,
    moduleUrl?: string,
    value?: boolean,
    diDeps?: CompileDiDependencyMetadata[]
  }) {
    super({runtime: runtime, name: name, prefix: prefix, moduleUrl: moduleUrl, value: value});
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
    this.identifierIsInstance = normalizeBool(identifierIsInstance);
  }

  get runtimeCacheKey(): any {
    if (isPresent(this.identifier)) {
      return this.identifier.runtimeCacheKey;
    } else {
      return this.value;
    }
  }

  get assetCacheKey(): any {
    if (isPresent(this.identifier)) {
      return this.identifier.assetCacheKey;
    } else {
      return this.value;
    }
  }

  equalsTo(token2: CompileTokenMetadata): boolean {
    var rk = this.runtimeCacheKey;
    var ak = this.assetCacheKey;
    return (isPresent(rk) && rk == token2.runtimeCacheKey) ||
        (isPresent(ak) && ak == token2.assetCacheKey);
  }

  get name(): string {
    return isPresent(this.value) ? sanitizeIdentifier(this.value) : this.identifier.name;
  }
}

/**
 * Note: We only need this in places where we need to support identifiers that
 * don't have a `runtime` value given by the `StaticReflector`. E.g. see the `identifiers`
 * file where we have some identifiers hard coded by name/module path.
 *
 * TODO(tbosch): Eventually, all of these places should go through the static reflector
 * as well, providing them with a valid `StaticSymbol` that is again a singleton.
 */
export class CompileIdentifierMap<KEY extends CompileMetadataWithIdentifier, VALUE> {
  private _valueMap = new Map<any, VALUE>();
  private _values: VALUE[] = [];
  private _tokens: KEY[] = [];

  add(token: KEY, value: VALUE) {
    var existing = this.get(token);
    if (isPresent(existing)) {
      throw new BaseException(
          `Cannot overwrite in a CompileIdentifierMap! Token: ${token.identifier.name}`);
    }
    this._tokens.push(token);
    this._values.push(value);
    var rk = token.runtimeCacheKey;
    if (isPresent(rk)) {
      this._valueMap.set(rk, value);
    }
    var ak = token.assetCacheKey;
    if (isPresent(ak)) {
      this._valueMap.set(ak, value);
    }
  }
  get(token: KEY): VALUE {
    var rk = token.runtimeCacheKey;
    var ak = token.assetCacheKey;
    var result: VALUE;
    if (isPresent(rk)) {
      result = this._valueMap.get(rk);
    }
    if (isBlank(result) && isPresent(ak)) {
      result = this._valueMap.get(ak);
    }
    return result;
  }
  keys(): KEY[] { return this._tokens; }
  values(): VALUE[] { return this._values; }
  get size(): number { return this._values.length; }
}

/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata extends CompileIdentifierMetadata {
  isHost: boolean;
  diDeps: CompileDiDependencyMetadata[];
  lifecycleHooks: LifecycleHooks[];

  constructor({runtime, name, moduleUrl, prefix, isHost, value, diDeps, lifecycleHooks}: {
    runtime?: Type,
    name?: string,
    moduleUrl?: string,
    prefix?: string,
    isHost?: boolean,
    value?: any,
    diDeps?: CompileDiDependencyMetadata[],
    lifecycleHooks?: LifecycleHooks[];
  } = {}) {
    super({runtime: runtime, name: name, moduleUrl: moduleUrl, prefix: prefix, value: value});
    this.isHost = normalizeBool(isHost);
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
    this.descendants = normalizeBool(descendants);
    this.first = normalizeBool(first);
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
    this.animations = isPresent(animations) ? ListWrapper.flatten(animations) : [];
    this.ngContentSelectors = isPresent(ngContentSelectors) ? ngContentSelectors : [];
    if (isPresent(interpolation) && interpolation.length != 2) {
      throw new BaseException(`'interpolation' should have a start and an end symbol.`);
    }
    this.interpolation = interpolation;
  }
}

/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata implements CompileMetadataWithIdentifier {
  static create(
      {type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, providers,
       viewProviders, queries, viewQueries, entryComponents, viewDirectives, viewPipes, template}: {
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
        entryComponents?: CompileTypeMetadata[],
        viewDirectives?: CompileTypeMetadata[],
        viewPipes?: CompileTypeMetadata[],
        template?: CompileTemplateMetadata
      } = {}): CompileDirectiveMetadata {
    var hostListeners: {[key: string]: string} = {};
    var hostProperties: {[key: string]: string} = {};
    var hostAttributes: {[key: string]: string} = {};
    if (isPresent(host)) {
      StringMapWrapper.forEach(host, (value: string, key: string) => {
        var matches = RegExpWrapper.firstMatch(HOST_REG_EXP, key);
        if (isBlank(matches)) {
          hostAttributes[key] = value;
        } else if (isPresent(matches[1])) {
          hostProperties[matches[1]] = value;
        } else if (isPresent(matches[2])) {
          hostListeners[matches[2]] = value;
        } else if (isPresent(matches[3])) {
          hostProperties[matches[3]] = value;
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
      isComponent: normalizeBool(isComponent), selector, exportAs, changeDetection,
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
      viewDirectives,
      viewPipes,
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
  // Note: Need to keep types here to prevent cycles!
  entryComponents: CompileTypeMetadata[];
  // Note: Need to keep types here to prevent cycles!
  viewDirectives: CompileTypeMetadata[];
  // Note: Need to keep types here to prevent cycles!
  viewPipes: CompileTypeMetadata[];

  template: CompileTemplateMetadata;

  constructor(
      {type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners,
       hostProperties, hostAttributes, providers, viewProviders, queries, viewQueries,
       entryComponents, viewDirectives, viewPipes, template}: {
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
        entryComponents?: CompileTypeMetadata[],
        viewDirectives?: CompileTypeMetadata[],
        viewPipes?: CompileTypeMetadata[],
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
    this.viewDirectives = _normalizeArray(viewDirectives);
    this.viewPipes = _normalizeArray(viewPipes);

    this.template = template;
  }

  get identifier(): CompileIdentifierMetadata { return this.type; }

  get runtimeCacheKey(): any { return this.type.runtimeCacheKey; }

  get assetCacheKey(): any { return this.type.assetCacheKey; }

  equalsTo(other: CompileMetadataWithIdentifier): boolean {
    return this.type.equalsTo(other.identifier);
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
      runtime: Object,
      name: `${compMeta.type.name}_Host`,
      moduleUrl: compMeta.type.moduleUrl,
      isHost: true
    }),
    template: new CompileTemplateMetadata({
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
    this.pure = normalizeBool(pure);
  }
  get identifier(): CompileIdentifierMetadata { return this.type; }
  get runtimeCacheKey(): any { return this.type.runtimeCacheKey; }

  get assetCacheKey(): any { return this.type.assetCacheKey; }

  equalsTo(other: CompileMetadataWithIdentifier): boolean {
    return this.type.equalsTo(other.identifier);
  }
}

/**
 * Metadata regarding compilation of a directive.
 */
export class CompileNgModuleMetadata implements CompileMetadataWithIdentifier {
  type: CompileTypeMetadata;
  declaredDirectives: CompileDirectiveMetadata[];
  exportedDirectives: CompileDirectiveMetadata[];
  declaredPipes: CompilePipeMetadata[];
  exportedPipes: CompilePipeMetadata[];
  // Note: See CompileDirectiveMetadata.entryComponents why this has to be a type.
  entryComponents: CompileTypeMetadata[];
  providers: CompileProviderMetadata[];

  importedModules: CompileNgModuleMetadata[];
  exportedModules: CompileNgModuleMetadata[];
  schemas: SchemaMetadata[];

  transitiveModule: TransitiveCompileNgModuleMetadata;

  constructor(
      {type, providers, declaredDirectives, exportedDirectives, declaredPipes, exportedPipes,
       entryComponents, importedModules, exportedModules, schemas, transitiveModule}: {
        type?: CompileTypeMetadata,
        providers?:
            Array<CompileProviderMetadata|CompileTypeMetadata|CompileIdentifierMetadata|any[]>,
        declaredDirectives?: CompileDirectiveMetadata[],
        exportedDirectives?: CompileDirectiveMetadata[],
        declaredPipes?: CompilePipeMetadata[],
        exportedPipes?: CompilePipeMetadata[],
        entryComponents?: CompileTypeMetadata[],
        importedModules?: CompileNgModuleMetadata[],
        exportedModules?: CompileNgModuleMetadata[],
        transitiveModule?: TransitiveCompileNgModuleMetadata,
        schemas?: SchemaMetadata[]
      } = {}) {
    this.type = type;
    this.declaredDirectives = _normalizeArray(declaredDirectives);
    this.exportedDirectives = _normalizeArray(exportedDirectives);
    this.declaredPipes = _normalizeArray(declaredPipes);
    this.exportedPipes = _normalizeArray(exportedPipes);
    this.providers = _normalizeArray(providers);
    this.entryComponents = _normalizeArray(entryComponents);
    this.importedModules = _normalizeArray(importedModules);
    this.exportedModules = _normalizeArray(exportedModules);
    this.schemas = _normalizeArray(schemas);
    this.transitiveModule = transitiveModule;
  }

  get identifier(): CompileIdentifierMetadata { return this.type; }
  get runtimeCacheKey(): any { return this.type.runtimeCacheKey; }

  get assetCacheKey(): any { return this.type.assetCacheKey; }

  equalsTo(other: CompileMetadataWithIdentifier): boolean {
    return this.type.equalsTo(other.identifier);
  }
}

export class TransitiveCompileNgModuleMetadata {
  directivesSet = new Set<Type>();
  pipesSet = new Set<Type>();
  constructor(
      public modules: CompileNgModuleMetadata[], public providers: CompileProviderMetadata[],
      public entryComponents: CompileTypeMetadata[], public directives: CompileDirectiveMetadata[],
      public pipes: CompilePipeMetadata[]) {
    directives.forEach(dir => this.directivesSet.add(dir.type.runtime));
    pipes.forEach(pipe => this.pipesSet.add(pipe.type.runtime));
  }
}

export function removeIdentifierDuplicates<T extends CompileMetadataWithIdentifier>(items: T[]):
    T[] {
  const map = new CompileIdentifierMap<T, T>();
  items.forEach((item) => {
    if (!map.get(item)) {
      map.add(item, item);
    }
  });
  return map.keys();
}

function _normalizeArray(obj: any[]): any[] {
  return isPresent(obj) ? obj : [];
}

export function isStaticSymbol(value: any): value is StaticSymbol {
  return isStringMap(value) && isPresent(value['name']) && isPresent(value['filePath']);
}

export interface StaticSymbol {
  name: string;
  filePath: string;
}
