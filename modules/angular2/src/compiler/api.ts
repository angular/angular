import {isPresent, normalizeBool} from 'angular2/src/core/facade/lang';
import {HtmlAst} from './html_ast';
import {ChangeDetectionStrategy} from 'angular2/src/core/change_detection/change_detection';

export class TypeMetadata {
  type: any;
  typeName: string;
  typeUrl: string;
  constructor({type, typeName, typeUrl}:
                  {type?: string, typeName?: string, typeUrl?: string} = {}) {
    this.type = type;
    this.typeName = typeName;
    this.typeUrl = typeUrl;
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
  }) {
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
}

export class TemplateMetadata {
  encapsulation: ViewEncapsulation;
  nodes: HtmlAst[];
  styles: string[];
  styleAbsUrls: string[];
  ngContentSelectors: string[];
  constructor({encapsulation, nodes, styles, styleAbsUrls, ngContentSelectors}: {
    encapsulation: ViewEncapsulation,
    nodes: HtmlAst[],
    styles: string[],
    styleAbsUrls: string[],
    ngContentSelectors: string[]
  }) {
    this.encapsulation = encapsulation;
    this.nodes = nodes;
    this.styles = styles;
    this.styleAbsUrls = styleAbsUrls;
    this.ngContentSelectors = ngContentSelectors;
  }
}

/**
 * How the template and styles of a view should be encapsulated.
 */
export enum ViewEncapsulation {
  /**
   * Emulate scoping of styles by preprocessing the style rules
   * and adding additional attributes to elements. This is the default.
   */
  Emulated,
  /**
   * Uses the native mechanism of the renderer. For the DOM this means creating a ShadowRoot.
   */
  Native,
  /**
   * Don't scope the template nor the styles.
   */
  None
}

export class DirectiveMetadata {
  type: TypeMetadata;
  isComponent: boolean;
  selector: string;
  hostAttributes: Map<string, string>;
  changeDetection: ChangeDetectionMetadata;
  template: TemplateMetadata;
  constructor({type, isComponent, selector, hostAttributes, changeDetection, template}: {
    type?: TypeMetadata,
    isComponent?: boolean,
    selector?: string,
    hostAttributes?: Map<string, string>,
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
}
