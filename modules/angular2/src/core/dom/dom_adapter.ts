import {isBlank, Type} from 'angular2/src/core/facade/lang';

export var DOM: DomAdapter;

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
  abstract hasProperty(element, name: string): boolean;
  abstract setProperty(el: Element, name: string, value: any);
  abstract getProperty(el: Element, name: string): any;
  abstract invoke(el: Element, methodName: string, args: any[]): any;

  abstract logError(error);
  abstract log(error);
  abstract logGroup(error);
  abstract logGroupEnd();

  abstract getXHR(): Type;

  /**
   * Maps attribute names to their corresponding property names for cases
   * where attribute name doesn't match property name.
   */
  attrToPropMap: {[key: string]: string};

  abstract parse(templateHtml: string);
  abstract query(selector: string): any;
  abstract querySelector(el, selector: string): HTMLElement;
  abstract querySelectorAll(el, selector: string): any[];
  abstract on(el, evt, listener);
  abstract onAndCancel(el, evt, listener): Function;
  abstract dispatchEvent(el, evt);
  abstract createMouseEvent(eventType): any;
  abstract createEvent(eventType: string): any;
  abstract preventDefault(evt);
  abstract isPrevented(evt): boolean;
  abstract getInnerHTML(el): string;
  abstract getOuterHTML(el): string;
  abstract nodeName(node): string;
  abstract nodeValue(node): string;
  abstract type(node): string;
  abstract content(node): any;
  abstract firstChild(el): Node;
  abstract nextSibling(el): Node;
  abstract parentElement(el): Node;
  abstract childNodes(el): Node[];
  abstract childNodesAsList(el): Node[];
  abstract clearNodes(el);
  abstract appendChild(el, node);
  abstract removeChild(el, node);
  abstract replaceChild(el, newNode, oldNode);
  abstract remove(el): Node;
  abstract insertBefore(el, node);
  abstract insertAllBefore(el, nodes);
  abstract insertAfter(el, node);
  abstract setInnerHTML(el, value);
  abstract getText(el): string;
  abstract setText(el, value: string);
  abstract getValue(el): string;
  abstract setValue(el, value: string);
  abstract getChecked(el): boolean;
  abstract setChecked(el, value: boolean);
  abstract createComment(text: string): any;
  abstract createTemplate(html): HTMLElement;
  abstract createElement(tagName, doc?): HTMLElement;
  abstract createTextNode(text: string, doc?): Text;
  abstract createScriptTag(attrName: string, attrValue: string, doc?): HTMLElement;
  abstract createStyleElement(css: string, doc?): HTMLStyleElement;
  abstract createShadowRoot(el): any;
  abstract getShadowRoot(el): any;
  abstract getHost(el): any;
  abstract getDistributedNodes(el): Node[];
  abstract clone /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/;
  abstract getElementsByClassName(element, name: string): HTMLElement[];
  abstract getElementsByTagName(element, name: string): HTMLElement[];
  abstract classList(element): any[];
  abstract addClass(element, classname: string);
  abstract removeClass(element, classname: string);
  abstract hasClass(element, classname: string): boolean;
  abstract setStyle(element, stylename: string, stylevalue: string);
  abstract removeStyle(element, stylename: string);
  abstract getStyle(element, stylename: string): string;
  abstract tagName(element): string;
  abstract attributeMap(element): Map<string, string>;
  abstract hasAttribute(element, attribute: string): boolean;
  abstract getAttribute(element, attribute: string): string;
  abstract setAttribute(element, name: string, value: string);
  abstract removeAttribute(element, attribute: string);
  abstract templateAwareRoot(el);
  abstract createHtmlDocument(): HTMLDocument;
  abstract defaultDoc(): HTMLDocument;
  abstract getBoundingClientRect(el);
  abstract getTitle(): string;
  abstract setTitle(newTitle: string);
  abstract elementMatches(n, selector: string): boolean;
  abstract isTemplateElement(el: any): boolean;
  abstract isTextNode(node): boolean;
  abstract isCommentNode(node): boolean;
  abstract isElementNode(node): boolean;
  abstract hasShadowRoot(node): boolean;
  abstract isShadowRoot(node): boolean;
  abstract importIntoDoc /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/;
  abstract adoptNode /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/;
  abstract isPageRule(rule): boolean;
  abstract isStyleRule(rule): boolean;
  abstract isMediaRule(rule): boolean;
  abstract isKeyframesRule(rule): boolean;
  abstract getHref(element): string;
  abstract getEventKey(event): string;
  abstract resolveAndSetHref(element, baseUrl: string, href: string);
  abstract cssToRules(css: string): any[];
  abstract supportsDOMEvents(): boolean;
  abstract supportsNativeShadowDOM(): boolean;
  abstract supportsUnprefixedCssAnimation(): boolean;
  abstract getGlobalEventTarget(target: string): any;
  abstract getHistory(): History;
  abstract getLocation(): Location;
  abstract getBaseHref(): string;
  abstract resetBaseElement(): void;
  abstract getUserAgent(): string;
  abstract setData(element, name: string, value: string);
  abstract getComputedStyle(element): any;
  abstract getData(element, name: string): string;
  abstract setGlobalVar(name: string, value: any);
  abstract requestAnimationFrame(callback): number;
  abstract cancelAnimationFrame(id);
  abstract performanceNow(): number;
  abstract getAnimationPrefix(): string;
  abstract getTransitionEnd(): string;
  abstract supportsAnimation(): boolean;
}
