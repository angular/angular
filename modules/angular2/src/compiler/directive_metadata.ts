import {
  isPresent,
  isBlank,
  normalizeBool,
  normalizeBlank,
  serializeEnum,
  Type,
  isString,
  RegExpWrapper,
  StringWrapper
} from 'angular2/src/facade/lang';
import {unimplemented} from 'angular2/src/facade/exceptions';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {
  ChangeDetectionStrategy,
  CHANGE_DETECTION_STRATEGY_VALUES
} from 'angular2/src/core/change_detection/change_detection';
import {ViewEncapsulation, VIEW_ENCAPSULATION_VALUES} from 'angular2/src/core/metadata/view';
import {CssSelector} from 'angular2/src/compiler/selector';
import {splitAtColon} from './util';
import {LifecycleHooks, LIFECYCLE_HOOKS_VALUES} from 'angular2/src/core/linker/interfaces';

// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;

export abstract class CompileMetadataWithIdentifier {
  static fromJson(data: {[key: string]: any}): CompileMetadataWithIdentifier {
    return _COMPILE_METADATA_FROM_JSON[data['class']](data);
  }

  abstract toJson(): {[key: string]: any};

  get identifier(): CompileIdentifierMetadata { return <CompileIdentifierMetadata>unimplemented(); }
}

export abstract class CompileMetadataWithType extends CompileMetadataWithIdentifier {
  static fromJson(data: {[key: string]: any}): CompileMetadataWithType {
    return _COMPILE_METADATA_FROM_JSON[data['class']](data);
  }

  abstract toJson(): {[key: string]: any};

  get type(): CompileTypeMetadata { return <CompileTypeMetadata>unimplemented(); }

  get identifier(): CompileIdentifierMetadata { return <CompileIdentifierMetadata>unimplemented(); }
}

export class CompileIdentifierMetadata implements CompileMetadataWithIdentifier {
  runtime: any;
  name: string;
  prefix: string;
  moduleUrl: string;
  constConstructor: boolean;
  constructor({runtime, name, moduleUrl, prefix, constConstructor}: {
    runtime?: any,
    name?: string,
    moduleUrl?: string,
    prefix?: string,
    constConstructor?: boolean
  } = {}) {
    this.runtime = runtime;
    this.name = name;
    this.prefix = prefix;
    this.moduleUrl = moduleUrl;
    this.constConstructor = constConstructor;
  }

  static fromJson(data: {[key: string]: any}): CompileIdentifierMetadata {
    return new CompileIdentifierMetadata({
      name: data['name'],
      prefix: data['prefix'],
      moduleUrl: data['moduleUrl'],
      constConstructor: data['constConstructor']
    });
  }

  toJson(): {[key: string]: any} {
    return {
      // Note: Runtime type can't be serialized...
      'class': 'Identifier',
      'name': this.name,
      'moduleUrl': this.moduleUrl,
      'prefix': this.prefix,
      'constConstructor': this.constConstructor
    };
  }

  get identifier(): CompileIdentifierMetadata { return this; }
}

export class CompileDiDependencyMetadata {
  isAttribute: boolean;
  isSelf: boolean;
  isHost: boolean;
  isSkipSelf: boolean;
  isOptional: boolean;
  query: CompileQueryMetadata;
  viewQuery: CompileQueryMetadata;
  token: CompileIdentifierMetadata | string;

  constructor({isAttribute, isSelf, isHost, isSkipSelf, isOptional, query, viewQuery, token}: {
    isAttribute?: boolean,
    isSelf?: boolean,
    isHost?: boolean,
    isSkipSelf?: boolean,
    isOptional?: boolean,
    query?: CompileQueryMetadata,
    viewQuery?: CompileQueryMetadata,
    token?: CompileIdentifierMetadata | string
  } = {}) {
    this.isAttribute = normalizeBool(isAttribute);
    this.isSelf = normalizeBool(isSelf);
    this.isHost = normalizeBool(isHost);
    this.isSkipSelf = normalizeBool(isSkipSelf);
    this.isOptional = normalizeBool(isOptional);
    this.query = query;
    this.viewQuery = viewQuery;
    this.token = token;
  }

  static fromJson(data: {[key: string]: any}): CompileDiDependencyMetadata {
    return new CompileDiDependencyMetadata({
      token: objFromJson(data['token'], CompileIdentifierMetadata.fromJson),
      query: objFromJson(data['query'], CompileQueryMetadata.fromJson),
      viewQuery: objFromJson(data['viewQuery'], CompileQueryMetadata.fromJson),
      isAttribute: data['isAttribute'],
      isSelf: data['isSelf'],
      isHost: data['isHost'],
      isSkipSelf: data['isSkipSelf'],
      isOptional: data['isOptional']
    });
  }

  toJson(): {[key: string]: any} {
    return {
      // Note: Runtime type can't be serialized...
      'token': objToJson(this.token),
      'query': objToJson(this.query),
      'viewQuery': objToJson(this.viewQuery),
      'isAttribute': this.isAttribute,
      'isSelf': this.isSelf,
      'isHost': this.isHost,
      'isSkipSelf': this.isSkipSelf,
      'isOptional': this.isOptional
    };
  }
}

export class CompileProviderMetadata {
  token: CompileIdentifierMetadata | string;
  useClass: CompileTypeMetadata;
  useValue: any;
  useExisting: CompileIdentifierMetadata | string;
  useFactory: CompileFactoryMetadata;
  deps: CompileDiDependencyMetadata[];
  multi: boolean;

  constructor({token, useClass, useValue, useExisting, useFactory, deps, multi}: {
    token?: CompileIdentifierMetadata | string,
    useClass?: CompileTypeMetadata,
    useValue?: any,
    useExisting?: CompileIdentifierMetadata | string,
    useFactory?: CompileFactoryMetadata,
    deps?: CompileDiDependencyMetadata[],
    multi?: boolean
  }) {
    this.token = token;
    this.useClass = useClass;
    this.useValue = useValue;
    this.useExisting = useExisting;
    this.useFactory = useFactory;
    this.deps = deps;
    this.multi = multi;
  }

  static fromJson(data: {[key: string]: any}): CompileProviderMetadata {
    return new CompileProviderMetadata({
      token: objFromJson(data['token'], CompileIdentifierMetadata.fromJson),
      useClass: objFromJson(data['useClass'], CompileTypeMetadata.fromJson)
    });
  }

  toJson(): {[key: string]: any} {
    return {
      // Note: Runtime type can't be serialized...
      'token': objToJson(this.token),
      'useClass': objToJson(this.useClass)
    };
  }
}

export class CompileFactoryMetadata implements CompileIdentifierMetadata {
  runtime: Function;
  name: string;
  prefix: string;
  moduleUrl: string;
  constConstructor: boolean;
  diDeps: CompileDiDependencyMetadata[];

  constructor({runtime, name, moduleUrl, constConstructor, diDeps}: {
    runtime?: Function,
    name?: string,
    moduleUrl?: string,
    constConstructor?: boolean,
    diDeps?: CompileDiDependencyMetadata[]
  }) {
    this.runtime = runtime;
    this.name = name;
    this.moduleUrl = moduleUrl;
    this.diDeps = diDeps;
    this.constConstructor = constConstructor;
  }

  get identifier(): CompileIdentifierMetadata { return this; }

  toJson() { return null; }
}

/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata implements CompileIdentifierMetadata, CompileMetadataWithType {
  runtime: Type;
  name: string;
  prefix: string;
  moduleUrl: string;
  isHost: boolean;
  constConstructor: boolean;
  diDeps: CompileDiDependencyMetadata[];

  constructor({runtime, name, moduleUrl, prefix, isHost, constConstructor, diDeps}: {
    runtime?: Type,
    name?: string,
    moduleUrl?: string,
    prefix?: string,
    isHost?: boolean,
    constConstructor?: boolean,
    diDeps?: CompileDiDependencyMetadata[]
  } = {}) {
    this.runtime = runtime;
    this.name = name;
    this.moduleUrl = moduleUrl;
    this.prefix = prefix;
    this.isHost = normalizeBool(isHost);
    this.constConstructor = constConstructor;
    this.diDeps = normalizeBlank(diDeps);
  }

  static fromJson(data: {[key: string]: any}): CompileTypeMetadata {
    return new CompileTypeMetadata({
      name: data['name'],
      moduleUrl: data['moduleUrl'],
      prefix: data['prefix'],
      isHost: data['isHost'],
      constConstructor: data['constConstructor'],
      diDeps: arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
    });
  }

  get identifier(): CompileIdentifierMetadata { return this; }
  get type(): CompileTypeMetadata { return this; }

  toJson(): {[key: string]: any} {
    return {
      // Note: Runtime type can't be serialized...
      'class': 'Type',
      'name': this.name,
      'moduleUrl': this.moduleUrl,
      'prefix': this.prefix,
      'isHost': this.isHost,
      'constConstructor': this.constConstructor,
      'diDeps': arrayToJson(this.diDeps)
    };
  }
}

export class CompileQueryMetadata {
  selectors: Array<CompileIdentifierMetadata | string>;
  descendants: boolean;
  first: boolean;
  propertyName: string;

  constructor({selectors, descendants, first, propertyName}: {
    selectors?: Array<CompileIdentifierMetadata | string>,
    descendants?: boolean,
    first?: boolean,
    propertyName?: string
  } = {}) {
    this.selectors = selectors;
    this.descendants = descendants;
    this.first = normalizeBool(first);
    this.propertyName = propertyName;
  }

  static fromJson(data: {[key: string]: any}): CompileQueryMetadata {
    return new CompileQueryMetadata({
      selectors: arrayFromJson(data['selectors'], CompileIdentifierMetadata.fromJson),
      descendants: data['descendants'],
      first: data['first'],
      propertyName: data['propertyName']
    });
  }

  toJson(): {[key: string]: any} {
    return {
      // Note: Runtime type can't be serialized...
      'selectors': arrayToJson(this.selectors),
      'descendants': this.descendants,
      'first': this.first,
      'propertyName': this.propertyName
    };
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
  ngContentSelectors: string[];
  constructor({encapsulation, template, templateUrl, styles, styleUrls, ngContentSelectors}: {
    encapsulation?: ViewEncapsulation,
    template?: string,
    templateUrl?: string,
    styles?: string[],
    styleUrls?: string[],
    ngContentSelectors?: string[]
  } = {}) {
    this.encapsulation = isPresent(encapsulation) ? encapsulation : ViewEncapsulation.Emulated;
    this.template = template;
    this.templateUrl = templateUrl;
    this.styles = isPresent(styles) ? styles : [];
    this.styleUrls = isPresent(styleUrls) ? styleUrls : [];
    this.ngContentSelectors = isPresent(ngContentSelectors) ? ngContentSelectors : [];
  }

  static fromJson(data: {[key: string]: any}): CompileTemplateMetadata {
    return new CompileTemplateMetadata({
      encapsulation: isPresent(data['encapsulation']) ?
                         VIEW_ENCAPSULATION_VALUES[data['encapsulation']] :
                         data['encapsulation'],
      template: data['template'],
      templateUrl: data['templateUrl'],
      styles: data['styles'],
      styleUrls: data['styleUrls'],
      ngContentSelectors: data['ngContentSelectors']
    });
  }

  toJson(): {[key: string]: any} {
    return {
      'encapsulation':
          isPresent(this.encapsulation) ? serializeEnum(this.encapsulation) : this.encapsulation,
      'template': this.template,
      'templateUrl': this.templateUrl,
      'styles': this.styles,
      'styleUrls': this.styleUrls,
      'ngContentSelectors': this.ngContentSelectors
    };
  }
}

/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata implements CompileMetadataWithType {
  static create({type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs,
                 outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries,
                 template}: {
    type?: CompileTypeMetadata,
    isComponent?: boolean,
    dynamicLoadable?: boolean,
    selector?: string,
    exportAs?: string,
    changeDetection?: ChangeDetectionStrategy,
    inputs?: string[],
    outputs?: string[],
    host?: {[key: string]: string},
    lifecycleHooks?: LifecycleHooks[],
    providers?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>,
    viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>,
    queries?: CompileQueryMetadata[],
    viewQueries?: CompileQueryMetadata[],
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
      type: type,
      isComponent: normalizeBool(isComponent),
      dynamicLoadable: normalizeBool(dynamicLoadable),
      selector: selector,
      exportAs: exportAs,
      changeDetection: changeDetection,
      inputs: inputsMap,
      outputs: outputsMap,
      hostListeners: hostListeners,
      hostProperties: hostProperties,
      hostAttributes: hostAttributes,
      lifecycleHooks: isPresent(lifecycleHooks) ? lifecycleHooks : [],
      providers: providers,
      viewProviders: viewProviders,
      queries: queries,
      viewQueries: viewQueries,
      template: template
    });
  }
  type: CompileTypeMetadata;
  isComponent: boolean;
  dynamicLoadable: boolean;
  selector: string;
  exportAs: string;
  changeDetection: ChangeDetectionStrategy;
  inputs: {[key: string]: string};
  outputs: {[key: string]: string};
  hostListeners: {[key: string]: string};
  hostProperties: {[key: string]: string};
  hostAttributes: {[key: string]: string};
  lifecycleHooks: LifecycleHooks[];
  providers: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
  viewProviders: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
  queries: CompileQueryMetadata[];
  viewQueries: CompileQueryMetadata[];
  template: CompileTemplateMetadata;
  constructor({type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs,
               outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers,
               viewProviders, queries, viewQueries, template}: {
    type?: CompileTypeMetadata,
    isComponent?: boolean,
    dynamicLoadable?: boolean,
    selector?: string,
    exportAs?: string,
    changeDetection?: ChangeDetectionStrategy,
    inputs?: {[key: string]: string},
    outputs?: {[key: string]: string},
    hostListeners?: {[key: string]: string},
    hostProperties?: {[key: string]: string},
    hostAttributes?: {[key: string]: string},
    lifecycleHooks?: LifecycleHooks[],
    providers?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>,
    viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>,
    queries?: CompileQueryMetadata[],
    viewQueries?: CompileQueryMetadata[],
    template?: CompileTemplateMetadata
  } = {}) {
    this.type = type;
    this.isComponent = isComponent;
    this.dynamicLoadable = dynamicLoadable;
    this.selector = selector;
    this.exportAs = exportAs;
    this.changeDetection = changeDetection;
    this.inputs = inputs;
    this.outputs = outputs;
    this.hostListeners = hostListeners;
    this.hostProperties = hostProperties;
    this.hostAttributes = hostAttributes;
    this.lifecycleHooks = lifecycleHooks;
    this.providers = normalizeBlank(providers);
    this.viewProviders = normalizeBlank(viewProviders);
    this.queries = queries;
    this.viewQueries = viewQueries;
    this.template = template;
  }

  get identifier(): CompileIdentifierMetadata { return this.type; }

  static fromJson(data: {[key: string]: any}): CompileDirectiveMetadata {
    return new CompileDirectiveMetadata({
      isComponent: data['isComponent'],
      dynamicLoadable: data['dynamicLoadable'],
      selector: data['selector'],
      exportAs: data['exportAs'],
      type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
      changeDetection: isPresent(data['changeDetection']) ?
                           CHANGE_DETECTION_STRATEGY_VALUES[data['changeDetection']] :
                           data['changeDetection'],
      inputs: data['inputs'],
      outputs: data['outputs'],
      hostListeners: data['hostListeners'],
      hostProperties: data['hostProperties'],
      hostAttributes: data['hostAttributes'],
      lifecycleHooks:
          (<any[]>data['lifecycleHooks']).map(hookValue => LIFECYCLE_HOOKS_VALUES[hookValue]),
      template: isPresent(data['template']) ? CompileTemplateMetadata.fromJson(data['template']) :
                                              data['template'],
      providers: arrayFromJson(data['providers'], CompileProviderMetadata.fromJson)
    });
  }

  toJson(): {[key: string]: any} {
    return {
      'class': 'Directive',
      'isComponent': this.isComponent,
      'dynamicLoadable': this.dynamicLoadable,
      'selector': this.selector,
      'exportAs': this.exportAs,
      'type': isPresent(this.type) ? this.type.toJson() : this.type,
      'changeDetection': isPresent(this.changeDetection) ? serializeEnum(this.changeDetection) :
                                                           this.changeDetection,
      'inputs': this.inputs,
      'outputs': this.outputs,
      'hostListeners': this.hostListeners,
      'hostProperties': this.hostProperties,
      'hostAttributes': this.hostAttributes,
      'lifecycleHooks': this.lifecycleHooks.map(hook => serializeEnum(hook)),
      'template': isPresent(this.template) ? this.template.toJson() : this.template,
      'providers': arrayToJson(this.providers)
    };
  }
}

/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export function createHostComponentMeta(componentType: CompileTypeMetadata,
                                        componentSelector: string): CompileDirectiveMetadata {
  var template = CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
  return CompileDirectiveMetadata.create({
    type: new CompileTypeMetadata({
      runtime: Object,
      name: `Host${componentType.name}`,
      moduleUrl: componentType.moduleUrl,
      isHost: true
    }),
    template: new CompileTemplateMetadata(
        {template: template, templateUrl: '', styles: [], styleUrls: [], ngContentSelectors: []}),
    changeDetection: ChangeDetectionStrategy.Default,
    inputs: [],
    outputs: [],
    host: {},
    lifecycleHooks: [],
    isComponent: true,
    dynamicLoadable: false,
    selector: '*',
    providers: [],
    viewProviders: [],
    queries: [],
    viewQueries: []
  });
}


export class CompilePipeMetadata implements CompileMetadataWithType {
  type: CompileTypeMetadata;
  name: string;
  pure: boolean;
  constructor({type, name,
               pure}: {type?: CompileTypeMetadata, name?: string, pure?: boolean} = {}) {
    this.type = type;
    this.name = name;
    this.pure = normalizeBool(pure);
  }
  get identifier(): CompileIdentifierMetadata { return this.type; }

  static fromJson(data: {[key: string]: any}): CompilePipeMetadata {
    return new CompilePipeMetadata({
      type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
      name: data['name'],
      pure: data['pure']
    });
  }

  toJson(): {[key: string]: any} {
    return {
      'class': 'Pipe',
      'type': isPresent(this.type) ? this.type.toJson() : null,
      'name': this.name,
      'pure': this.pure
    };
  }
}

var _COMPILE_METADATA_FROM_JSON = {
  'Directive': CompileDirectiveMetadata.fromJson,
  'Pipe': CompilePipeMetadata.fromJson,
  'Type': CompileTypeMetadata.fromJson,
  'Identifier': CompileIdentifierMetadata.fromJson
};

function arrayFromJson(obj: any[], fn: (a: {[key: string]: any}) => any): any {
  return isBlank(obj) ? null : obj.map(o => objFromJson(o, fn));
}

function arrayToJson(obj: any[]): string | {[key: string]: any} {
  return isBlank(obj) ? null : obj.map(objToJson);
}

function objFromJson(obj: any, fn: (a: {[key: string]: any}) => any): any {
  return (isString(obj) || isBlank(obj)) ? obj : fn(obj);
}

function objToJson(obj: any): string | {[key: string]: any} {
  return (isString(obj) || isBlank(obj)) ? obj : obj.toJson();
}
