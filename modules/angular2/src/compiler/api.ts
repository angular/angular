import {isPresent, normalizeBool, serializeEnum, Type} from 'angular2/src/core/facade/lang';
import {
  ChangeDetectionStrategy,
  changeDetectionStrategyFromJson
} from 'angular2/src/core/change_detection/change_detection';
import {ViewEncapsulation, viewEncapsulationFromJson} from 'angular2/src/core/render/api';

export class TypeMetadata {
  id: number;
  type: Type;
  typeName: string;
  typeUrl: string;
  constructor({id, type, typeName, typeUrl}:
                  {id?: number, type?: Type, typeName?: string, typeUrl?: string} = {}) {
    this.id = id;
    this.type = type;
    this.typeName = typeName;
    this.typeUrl = typeUrl;
  }

  static fromJson(data: StringMap<string, any>): TypeMetadata {
    return new TypeMetadata(
        {id: data['id'], type: data['type'], typeName: data['typeName'], typeUrl: data['typeUrl']});
  }

  toJson(): StringMap<string, any> {
    return {
      // Note: Runtime type can't be serialized...
      'id': this.id,
      'typeName': this.typeName,
      'typeUrl': this.typeUrl
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
    this.properties = properties;
    this.events = events;
    this.hostListeners = hostListeners;
    this.hostProperties = hostProperties;
    this.callAfterContentInit = callAfterContentInit;
    this.callAfterContentChecked = callAfterContentChecked;
    this.callAfterViewInit = callAfterViewInit;
    this.callAfterViewChecked = callAfterViewChecked;
    this.callOnChanges = callOnChanges;
    this.callDoCheck = callDoCheck;
    this.callOnInit = callOnInit;
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
  styles: string[];
  styleAbsUrls: string[];
  ngContentSelectors: string[];
  constructor({encapsulation, template, styles, styleAbsUrls, ngContentSelectors}: {
    encapsulation?: ViewEncapsulation,
    template?: string,
    styles?: string[],
    styleAbsUrls?: string[],
    ngContentSelectors?: string[]
  } = {}) {
    this.encapsulation = encapsulation;
    this.template = template;
    this.styles = styles;
    this.styleAbsUrls = styleAbsUrls;
    this.ngContentSelectors = ngContentSelectors;
  }

  static fromJson(data: StringMap<string, any>):TemplateMetadata {
    return new TemplateMetadata({
      encapsulation: isPresent(data['encapsulation']) ?
                         viewEncapsulationFromJson(data['encapsulation']) :
                         data['encapsulation'],
      template: data['template'],
      styles: data['styles'],
      styleAbsUrls: data['styleAbsUrls'],
      ngContentSelectors: data['ngContentSelectors'],
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
    };
  }
}


export class DirectiveMetadata {
  type: TypeMetadata;
  isComponent: boolean;
  selector: string;
  hostAttributes: StringMap<string, string>;
  changeDetection: ChangeDetectionMetadata;
  template: TemplateMetadata;
  constructor({type, isComponent, selector, hostAttributes, changeDetection, template}: {
    type?: TypeMetadata,
    isComponent?: boolean,
    selector?: string,
    hostAttributes?: StringMap<string, string>,
    changeDetection?: ChangeDetectionMetadata,
    template?: TemplateMetadata
  } = {}) {
    this.type = type;
    this.isComponent = normalizeBool(isComponent);
    this.selector = selector;
    this.hostAttributes = hostAttributes;
    this.changeDetection = changeDetection;
    this.template = template;
  }

  static fromJson(data: StringMap<string, any>): DirectiveMetadata {
    return new DirectiveMetadata({
      type: isPresent(data['type']) ? TypeMetadata.fromJson(data['type']) : data['type'],
      isComponent: data['isComponent'],
      selector: data['selector'],
      hostAttributes: data['hostAttributes'],
      changeDetection: isPresent(data['changeDetection']) ?
                           ChangeDetectionMetadata.fromJson(data['changeDetection']) :
                           data['changeDetection'],
      template: isPresent(data['template']) ? TemplateMetadata.fromJson(data['template']) :
                                              data['template']
    });
  }

  toJson(): StringMap<string, any> {
    return {
      'type': isPresent(this.type) ? this.type.toJson() : this.type,
      'isComponent': this.isComponent,
      'selector': this.selector,
      'hostAttributes': this.hostAttributes,
      'changeDetection':
          isPresent(this.changeDetection) ? this.changeDetection.toJson() : this.changeDetection,
      'template': isPresent(this.template) ? this.template.toJson() : this.template
    };
  }
}

export class SourceModule {
  constructor(public moduleName: string, public source: string, public imports: string[][]) {}
}
