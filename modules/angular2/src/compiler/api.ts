import {isPresent} from 'angular2/src/core/facade/lang';
import {HtmlAst} from './html_ast';

export class TypeMeta {
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

export class TemplateMeta {
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
  type: TypeMeta;
  isComponent: boolean;
  selector: string;
  template: TemplateMeta;
  constructor({type, isComponent, selector, template}: {
    type?: TypeMeta,
    isComponent?: boolean,
    selector?: string,
    template?: TemplateMeta
  } = {}) {
    this.type = type;
    this.isComponent = isPresent(isComponent) ? isComponent : false;
    this.selector = selector;
    this.template = template;
  }
}
