import {isPresent, normalizeBool, serializeEnum, Type} from 'angular2/src/core/facade/lang';
import {
  ChangeDetectionStrategy,
  changeDetectionStrategyFromJson
} from 'angular2/src/core/change_detection/change_detection';
import {ViewEncapsulation, viewEncapsulationFromJson} from 'angular2/src/core/render/api';
import {CssSelector} from 'angular2/src/core/render/dom/compiler/selector';

export class TypeMetadata {
  id: number;
  runtime: Type;
  name: string;
  moduleId: string;
  constructor({id, runtime, name, moduleId}:
                  {id?: number, runtime?: Type, name?: string, moduleId?: string} = {}) {
    this.id = id;
    this.runtime = runtime;
    this.name = name;
    this.moduleId = moduleId;
  }

  static fromJson(data: StringMap<string, any>): TypeMetadata {
    return new TypeMetadata({id: data['id'], name: data['name'], moduleId: data['moduleId']});
  }

  toJson(): StringMap<string, any> {
    return {
      // Note: Runtime type can't be serialized...
      'id': this.id,
      'name': this.name,
      'moduleId': this.moduleId
    };
  }
}

export class ChangeDetectionMetadata {
  changeDetection: ChangeDetectionStrategy;
  properties: string[];
  events: string[];
  hostListeners: StringMap<string, string>;
  hostProperties: StringMap<string, string>;
  callAfterContentInit: boolean;
  callAfterContentChecked: boolean;
  callAfterViewInit: boolean;
  callAfterViewChecked: boolean;
  callOnChanges: boolean;
  callDoCheck: boolean;
  callOnInit: boolean;
  constructor({changeDetection, properties, events, hostListeners, hostProperties,
               callAfterContentInit, callAfterContentChecked, callAfterViewInit,
               callAfterViewChecked, callOnChanges, callDoCheck, callOnInit}: {
    changeDetection?: ChangeDetectionStrategy,
    properties?: string[],
    events?: string[],
    hostListeners?: StringMap<string, string>,
    hostProperties?: StringMap<string, string>,
    callAfterContentInit?: boolean,
    callAfterContentChecked?: boolean,
    callAfterViewInit?: boolean,
    callAfterViewChecked?: boolean,
    callOnChanges?: boolean,
    callDoCheck?: boolean,
    callOnInit?: boolean
  } = {}) {
    this.changeDetection = changeDetection;
    this.properties = isPresent(properties) ? properties : [];
    this.events = isPresent(events) ? events : [];
    this.hostListeners = isPresent(hostListeners) ? hostListeners : {};
    this.hostProperties = isPresent(hostProperties) ? hostProperties : {};
    this.callAfterContentInit = normalizeBool(callAfterContentInit);
    this.callAfterContentChecked = normalizeBool(callAfterContentChecked);
    this.callAfterViewInit = normalizeBool(callAfterViewInit);
    this.callAfterViewChecked = normalizeBool(callAfterViewChecked);
    this.callOnChanges = normalizeBool(callOnChanges);
    this.callDoCheck = normalizeBool(callDoCheck);
    this.callOnInit = normalizeBool(callOnInit);
  }

  static fromJson(data: StringMap<string, any>): ChangeDetectionMetadata {
    return new ChangeDetectionMetadata({
      changeDetection: isPresent(data['changeDetection']) ?
                           changeDetectionStrategyFromJson(data['changeDetection']) :
                           data['changeDetection'],
      properties: data['properties'],
      events: data['events'],
      hostListeners: data['hostListeners'],
      hostProperties: data['hostProperties'],
      callAfterContentInit: data['callAfterContentInit'],
      callAfterContentChecked: data['callAfterContentChecked'],
      callAfterViewInit: data['callAfterViewInit'],
      callAfterViewChecked: data['callAfterViewChecked'],
      callOnChanges: data['callOnChanges'],
      callDoCheck: data['callDoCheck'],
      callOnInit: data['callOnInit']
    });
  }

  toJson(): StringMap<string, any> {
    return {
      'changeDetection': isPresent(this.changeDetection) ? serializeEnum(this.changeDetection) :
                                                           this.changeDetection,
      'properties': this.properties,
      'events': this.events,
      'hostListeners': this.hostListeners,
      'hostProperties': this.hostProperties,
      'callAfterContentInit': this.callAfterContentInit,
      'callAfterContentChecked': this.callAfterContentChecked,
      'callAfterViewInit': this.callAfterViewInit,
      'callAfterViewChecked': this.callAfterViewChecked,
      'callOnChanges': this.callOnChanges,
      'callDoCheck': this.callDoCheck,
      'callOnInit': this.callOnInit
    };
  }
}

export class TemplateMetadata {
  encapsulation: ViewEncapsulation;
  template: string;
  templateUrl: string;
  styles: string[];
  styleUrls: string[];
  hostAttributes: StringMap<string, string>;
  constructor({encapsulation, template, templateUrl, styles, styleUrls, hostAttributes}: {
    encapsulation?: ViewEncapsulation,
    template?: string,
    templateUrl?: string,
    styles?: string[],
    styleUrls?: string[],
    hostAttributes?: StringMap<string, string>
  } = {}) {
    this.encapsulation = isPresent(encapsulation) ? encapsulation : ViewEncapsulation.None;
    this.template = template;
    this.templateUrl = templateUrl;
    this.styles = isPresent(styles) ? styles : [];
    this.styleUrls = isPresent(styleUrls) ? styleUrls : [];
    this.hostAttributes = isPresent(hostAttributes) ? hostAttributes : {};
  }
}


export class DirectiveMetadata {
  type: TypeMetadata;
  isComponent: boolean;
  dynamicLoadable: boolean;
  selector: string;
  changeDetection: ChangeDetectionMetadata;
  template: TemplateMetadata;
  constructor({type, isComponent, dynamicLoadable, selector, changeDetection, template}: {
    type?: TypeMetadata,
    isComponent?: boolean,
    dynamicLoadable?: boolean,
    selector?: string,
    changeDetection?: ChangeDetectionMetadata,
    template?: TemplateMetadata
  } = {}) {
    this.type = type;
    this.isComponent = normalizeBool(isComponent);
    this.dynamicLoadable = normalizeBool(dynamicLoadable);
    this.selector = selector;
    this.changeDetection = changeDetection;
    this.template = template;
  }
}

export class NormalizedTemplateMetadata {
  encapsulation: ViewEncapsulation;
  template: string;
  styles: string[];
  styleAbsUrls: string[];
  ngContentSelectors: string[];
  hostAttributes: StringMap<string, string>;
  constructor({encapsulation, template, styles, styleAbsUrls, ngContentSelectors, hostAttributes}: {
    encapsulation?: ViewEncapsulation,
    template?: string,
    styles?: string[],
    styleAbsUrls?: string[],
    ngContentSelectors?: string[],
    hostAttributes?: StringMap<string, string>
  } = {}) {
    this.encapsulation = encapsulation;
    this.template = template;
    this.styles = styles;
    this.styleAbsUrls = styleAbsUrls;
    this.ngContentSelectors = ngContentSelectors;
    this.hostAttributes = hostAttributes;
  }

  static fromJson(data: StringMap<string, any>): NormalizedTemplateMetadata {
    return new NormalizedTemplateMetadata({
      encapsulation: isPresent(data['encapsulation']) ?
                         viewEncapsulationFromJson(data['encapsulation']) :
                         data['encapsulation'],
      template: data['template'],
      styles: data['styles'],
      styleAbsUrls: data['styleAbsUrls'],
      ngContentSelectors: data['ngContentSelectors'],
      hostAttributes: data['hostAttributes']
    });
  }

  toJson(): StringMap<string, any> {
    return {
      'encapsulation':
          isPresent(this.encapsulation) ? serializeEnum(this.encapsulation) : this.encapsulation,
      'template': this.template,
      'styles': this.styles,
      'styleAbsUrls': this.styleAbsUrls,
      'ngContentSelectors': this.ngContentSelectors,
      'hostAttributes': this.hostAttributes
    };
  }
}

export interface INormalizedDirectiveMetadata {}

export class NormalizedDirectiveMetadata implements INormalizedDirectiveMetadata {
  type: TypeMetadata;
  isComponent: boolean;
  dynamicLoadable: boolean;
  selector: string;
  changeDetection: ChangeDetectionMetadata;
  template: NormalizedTemplateMetadata;
  constructor({type, isComponent, dynamicLoadable, selector, changeDetection, template}: {
    id?: number,
    type?: TypeMetadata,
    isComponent?: boolean,
    dynamicLoadable?: boolean,
    selector?: string,
    changeDetection?: ChangeDetectionMetadata,
    template?: NormalizedTemplateMetadata
  } = {}) {
    this.type = type;
    this.isComponent = normalizeBool(isComponent);
    this.dynamicLoadable = normalizeBool(dynamicLoadable);
    this.selector = selector;
    this.changeDetection = changeDetection;
    this.template = template;
  }

  static fromJson(data: StringMap<string, any>): NormalizedDirectiveMetadata {
    return new NormalizedDirectiveMetadata({
      isComponent: data['isComponent'],
      dynamicLoadable: data['dynamicLoadable'],
      selector: data['selector'],
      type: isPresent(data['type']) ? TypeMetadata.fromJson(data['type']) : data['type'],
      changeDetection: isPresent(data['changeDetection']) ?
                           ChangeDetectionMetadata.fromJson(data['changeDetection']) :
                           data['changeDetection'],
      template:
          isPresent(data['template']) ? NormalizedTemplateMetadata.fromJson(data['template']) :
                                        data['template']
    });
  }

  toJson(): StringMap<string, any> {
    return {
      'isComponent': this.isComponent,
      'dynamicLoadable': this.dynamicLoadable,
      'selector': this.selector,
      'type': isPresent(this.type) ? this.type.toJson() : this.type,
      'changeDetection':
          isPresent(this.changeDetection) ? this.changeDetection.toJson() : this.changeDetection,
      'template': isPresent(this.template) ? this.template.toJson() : this.template
    };
  }
}

export function createHostComponentMeta(componentType: TypeMetadata, componentSelector: string):
    NormalizedDirectiveMetadata {
  var template = CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
  return new NormalizedDirectiveMetadata({
    type: new TypeMetadata({
      runtime: Object,
      id: (componentType.id * -1) - 1,
      name: `Host${componentType.name}`,
      moduleId: componentType.moduleId
    }),
    template: new NormalizedTemplateMetadata({
      template: template,
      styles: [],
      styleAbsUrls: [],
      hostAttributes: {},
      ngContentSelectors: []
    }),
    changeDetection: new ChangeDetectionMetadata({
      changeDetection: ChangeDetectionStrategy.Default,
      properties: [],
      events: [],
      hostListeners: {},
      hostProperties: {},
      callAfterContentInit: false,
      callAfterContentChecked: false,
      callAfterViewInit: false,
      callAfterViewChecked: false,
      callOnChanges: false,
      callDoCheck: false,
      callOnInit: false
    }),
    isComponent: true,
    dynamicLoadable: false,
    selector: '*'
  });
}
