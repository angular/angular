import {
  isPresent,
  isBlank,
  normalizeBool,
  serializeEnum,
  Type,
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

export abstract class CompileMetadataWithType {
  static fromJson(data: {[key: string]: any}): CompileMetadataWithType {
    return _COMPILE_METADATA_FROM_JSON[data['class']](data);
  }

  abstract toJson(): {[key: string]: any};

  get type(): CompileTypeMetadata { return unimplemented(); }
}

/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata {
  runtime: Type;
  name: string;
  moduleUrl: string;
  isHost: boolean;
  constructor({runtime, name, moduleUrl, isHost}:
                  {runtime?: Type, name?: string, moduleUrl?: string, isHost?: boolean} = {}) {
    this.runtime = runtime;
    this.name = name;
    this.moduleUrl = moduleUrl;
    this.isHost = normalizeBool(isHost);
  }

  static fromJson(data: {[key: string]: any}): CompileTypeMetadata {
    return new CompileTypeMetadata(
        {name: data['name'], moduleUrl: data['moduleUrl'], isHost: data['isHost']});
  }

  toJson(): {[key: string]: any} {
    return {
      // Note: Runtime type can't be serialized...
      'name': this.name,
      'moduleUrl': this.moduleUrl,
      'isHost': this.isHost
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
                 outputs, host, lifecycleHooks, template}: {
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
  template: CompileTemplateMetadata;
  constructor({type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs,
               outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, template}: {
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
    this.template = template;
  }

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
                                              data['template']
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
      'template': isPresent(this.template) ? this.template.toJson() : this.template
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
    selector: '*'
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
  'Pipe': CompilePipeMetadata.fromJson
};
