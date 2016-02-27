import {isBlank, Type} from 'angular2/src/facade/lang';

export var DOM: DomAdapter = null;

export function setRootDomAdapter(adapter: DomAdapter) {
  if (isBlank(DOM)) {
    DOM = adapter;
  }
}

/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 */
export abstract class DomAdapter {
  abstract hasProperty(element: any, name: string): boolean;

  abstract setProperty(el: Element, name: string, value: any): void;

  abstract getProperty(el: Element, name: string): any;

  abstract invoke(el: Element, methodName: string, args: any[]): any;

  abstract logError(error: any): void;

  abstract log(error: any): void;

  abstract logGroup(error: any): void;

  abstract logGroupEnd(): void;

  /** @deprecated */
  abstract getXHR(): Type;

  /**
   * Maps attribute names to their corresponding property names for cases
   * where attribute name doesn't match property name.
   */
  get attrToPropMap(): {[key: string]: string} {
    return this._attrToPropMap;
  };

  set attrToPropMap(value: {[key: string]: string}) {
    this._attrToPropMap = value;
  };

  /** @internal */
  _attrToPropMap: {[key: string]: string};

  abstract parse(templateHtml: string): any;

  abstract query(selector: string): any;

  abstract querySelector(el: any, selector: string): HTMLElement;

  abstract querySelectorAll(el: any, selector: string): any[];

  abstract on(el: any, evt: any, listener: any): void;

  abstract onAndCancel(el: any, evt: any, listener: any): Function;

  abstract dispatchEvent(el: any, evt: any): void;

  abstract createMouseEvent(eventType: any): any;

  abstract createEvent(eventType: string): any;

  abstract preventDefault(evt: any): void;

  abstract isPrevented(evt: any): boolean;

  abstract getInnerHTML(el: any): string;

  abstract getOuterHTML(el: any): string;

  abstract nodeName(node: any): string;

  abstract nodeValue(node: any): string;

  abstract type(node: any): string;

  abstract content(node: any): any;

  abstract firstChild(el: any): Node;

  abstract nextSibling(el: any): Node;

  abstract parentElement(el: any): Node;

  abstract childNodes(el: any): Node[];

  abstract childNodesAsList(el: any): Node[];

  abstract clearNodes(el: any): void;

  abstract appendChild(el: any, node: any): void;

  abstract removeChild(el: any, node: any): void;

  abstract replaceChild(el: any, newNode: any, oldNode: any): void;

  abstract remove(el: any): Node;

  abstract insertBefore(el: any, node: any): void;

  abstract insertAllBefore(el: any, nodes: any): void;

  abstract insertAfter(el: any, node: any): void;

  abstract setInnerHTML(el: any, value: any): void;

  abstract getText(el: any): string;

  abstract setText(el: any, value: string): void;

  abstract getValue(el: any): string;

  abstract setValue(el: any, value: string): void;

  abstract getChecked(el: any): boolean;

  abstract setChecked(el: any, value: boolean): void;

  abstract createComment(text: string): any;

  abstract createTemplate(html: any): HTMLElement;

  abstract createElement(tagName: any, doc?: any): HTMLElement;

  abstract createElementNS(ns: string, tagName: string, doc?: any): Element;

  abstract createTextNode(text: string, doc?: any): Text;

  abstract createScriptTag(attrName: string, attrValue: string, doc?: any): HTMLElement;

  abstract createStyleElement(css: string, doc?: any): HTMLStyleElement;

  abstract createShadowRoot(el: any): any;

  abstract getShadowRoot(el: any): any;

  abstract getHost(el: any): any;

  abstract getDistributedNodes(el: any): Node[];

  abstract clone /*<T extends Node>*/(node: Node /*T*/): Node /*T*/;

  abstract getElementsByClassName(element: any, name: string): HTMLElement[];

  abstract getElementsByTagName(element: any, name: string): HTMLElement[];

  abstract classList(element: any): any[];

  abstract addClass(element: any, className: string): void;

  abstract removeClass(element: any, className: string): void;

  abstract hasClass(element: any, className: string): boolean;

  abstract setStyle(element: any, styleName: string, styleValue: string): void;

  abstract removeStyle(element: any, styleName: string): void;

  abstract getStyle(element: any, styleName: string): string;

  abstract hasStyle(element: any, styleName: string, styleValue?: string): boolean;

  abstract tagName(element: any): string;

  abstract attributeMap(element: any): Map<string, string>;

  abstract hasAttribute(element: any, attribute: string): boolean;

  abstract hasAttributeNS(element: any, ns: string, attribute: string): boolean;

  abstract getAttribute(element: any, attribute: string): string;

  abstract getAttributeNS(element: any, ns: string, attribute: string): string;

  abstract setAttribute(element: any, name: string, value: string): void;

  abstract setAttributeNS(element: any, ns: string, name: string, value: string): void;

  abstract removeAttribute(element: any, attribute: string): void;

  abstract removeAttributeNS(element: any, ns: string, attribute: string): void;

  abstract templateAwareRoot(el: any): any;

  abstract createHtmlDocument(): HTMLDocument;

  abstract defaultDoc(): HTMLDocument;

  abstract getBoundingClientRect(el: any): any;

  abstract getTitle(): string;

  abstract setTitle(newTitle: string): void;

  abstract elementMatches(n: any, selector: string): boolean;

  abstract isTemplateElement(el: any): boolean;

  abstract isTextNode(node: any): boolean;

  abstract isCommentNode(node: any): boolean;

  abstract isElementNode(node: any): boolean;

  abstract hasShadowRoot(node: any): boolean;

  abstract isShadowRoot(node: any): boolean;

  abstract importIntoDoc /*<T extends Node>*/(node: Node /*T*/): Node /*T*/;

  abstract adoptNode /*<T extends Node>*/(node: Node /*T*/): Node /*T*/;

  abstract getHref(element: any): string;

  abstract getEventKey(event: any): string;

  abstract resolveAndSetHref(element: any, baseUrl: string, href: string): any;

  abstract supportsDOMEvents(): boolean;

  abstract supportsNativeShadowDOM(): boolean;

  abstract getGlobalEventTarget(target: string): any;

  abstract getHistory(): History;

  abstract getLocation(): Location;

  abstract getBaseHref(): string;

  abstract resetBaseElement(): void;

  abstract getUserAgent(): string;

  abstract setData(element: any, name: string, value: string): void;

  abstract getComputedStyle(element: any): any;

  abstract getData(element: any, name: string): string;

  abstract setGlobalVar(name: string, value: any): void;

  abstract requestAnimationFrame(callback: any): number;

  abstract cancelAnimationFrame(id: any): void;

  abstract performanceNow(): number;

  abstract getAnimationPrefix(): string;

  abstract getTransitionEnd(): string;

  abstract supportsAnimation(): boolean;
}
