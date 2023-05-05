/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, isPlatformServer, ɵgetDOM as getDOM} from '@angular/common';
import {APP_ID, CSP_NONCE, Inject, Injectable, InjectionToken, NgZone, OnDestroy, PLATFORM_ID, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2, ViewEncapsulation} from '@angular/core';

import {EventManager} from './events/event_manager';
import {SharedStylesHost} from './shared_styles_host';

export const NAMESPACE_URIS: {[ns: string]: string} = {
  'svg': 'http://www.w3.org/2000/svg',
  'xhtml': 'http://www.w3.org/1999/xhtml',
  'xlink': 'http://www.w3.org/1999/xlink',
  'xml': 'http://www.w3.org/XML/1998/namespace',
  'xmlns': 'http://www.w3.org/2000/xmlns/',
  'math': 'http://www.w3.org/1998/MathML/',
};

const COMPONENT_REGEX = /%COMP%/g;

export const COMPONENT_VARIABLE = '%COMP%';
export const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
export const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

/**
 * The default value for the `REMOVE_STYLES_ON_COMPONENT_DESTROY` DI token.
 */
const REMOVE_STYLES_ON_COMPONENT_DESTROY_DEFAULT = false;

/**
 * A [DI token](guide/glossary#di-token "DI token definition") that indicates whether styles
 * of destroyed components should be removed from DOM.
 *
 * By default, the value is set to `false`. This will be changed in the next major version.
 * @publicApi
 */
export const REMOVE_STYLES_ON_COMPONENT_DESTROY =
    new InjectionToken<boolean>('RemoveStylesOnCompDestory', {
      providedIn: 'root',
      factory: () => REMOVE_STYLES_ON_COMPONENT_DESTROY_DEFAULT,
    });

export function shimContentAttribute(componentShortId: string): string {
  return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function shimHostAttribute(componentShortId: string): string {
  return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function shimStylesContent(compId: string, styles: string[]): string[] {
  return styles.map(s => s.replace(COMPONENT_REGEX, compId));
}

@Injectable()
export class DomRendererFactory2 implements RendererFactory2, OnDestroy {
  private readonly rendererByCompId =
      new Map<string, EmulatedEncapsulationDomRenderer2|NoneEncapsulationDomRenderer>();
  private readonly defaultRenderer: Renderer2;
  private readonly platformIsServer: boolean;

  constructor(
      private readonly eventManager: EventManager,
      private readonly sharedStylesHost: SharedStylesHost,
      @Inject(APP_ID) private readonly appId: string,
      @Inject(REMOVE_STYLES_ON_COMPONENT_DESTROY) private removeStylesOnCompDestory: boolean,
      @Inject(DOCUMENT) private readonly doc: Document,
      @Inject(PLATFORM_ID) readonly platformId: Object,
      readonly ngZone: NgZone,
      @Inject(CSP_NONCE) private readonly nonce: string|null = null,
  ) {
    this.platformIsServer = isPlatformServer(platformId);
    this.defaultRenderer =
        new DefaultDomRenderer2(eventManager, doc, ngZone, this.platformIsServer);
  }

  createRenderer(element: any, type: RendererType2|null): Renderer2 {
    if (!element || !type) {
      return this.defaultRenderer;
    }

    if (this.platformIsServer && type.encapsulation === ViewEncapsulation.ShadowDom) {
      // Domino does not support shadow DOM.
      type = {...type, encapsulation: ViewEncapsulation.Emulated};
    }

    const renderer = this.getOrCreateRenderer(element, type);
    // Renderers have different logic due to different encapsulation behaviours.
    // Ex: for emulated, an attribute is added to the element.
    if (renderer instanceof EmulatedEncapsulationDomRenderer2) {
      renderer.applyToHost(element);
    } else if (renderer instanceof NoneEncapsulationDomRenderer) {
      renderer.applyStyles();
    }

    return renderer;
  }

  private getOrCreateRenderer(element: any, type: RendererType2): Renderer2 {
    const rendererByCompId = this.rendererByCompId;
    let renderer = rendererByCompId.get(type.id);

    if (!renderer) {
      const doc = this.doc;
      const ngZone = this.ngZone;
      const eventManager = this.eventManager;
      const sharedStylesHost = this.sharedStylesHost;
      const removeStylesOnCompDestory = this.removeStylesOnCompDestory;
      const platformIsServer = this.platformIsServer;

      switch (type.encapsulation) {
        case ViewEncapsulation.Emulated:
          renderer = new EmulatedEncapsulationDomRenderer2(
              eventManager, sharedStylesHost, type, this.appId, removeStylesOnCompDestory, doc,
              ngZone, platformIsServer);
          break;
        case ViewEncapsulation.ShadowDom:
          return new ShadowDomRenderer(
              eventManager, sharedStylesHost, element, type, doc, ngZone, this.nonce,
              platformIsServer);
        default:
          renderer = new NoneEncapsulationDomRenderer(
              eventManager, sharedStylesHost, type, removeStylesOnCompDestory, doc, ngZone,
              platformIsServer);
          break;
      }

      renderer.onDestroy = () => rendererByCompId.delete(type.id);
      rendererByCompId.set(type.id, renderer);
    }

    return renderer;
  }

  ngOnDestroy() {
    this.rendererByCompId.clear();
  }
}

class DefaultDomRenderer2 implements Renderer2 {
  data: {[key: string]: any} = Object.create(null);

  constructor(
      private readonly eventManager: EventManager, private readonly doc: Document,
      private readonly ngZone: NgZone, private readonly platformIsServer: boolean) {}

  destroy(): void {}

  destroyNode = null;

  createElement(name: string, namespace?: string): any {
    if (namespace) {
      // TODO: `|| namespace` was added in
      // https://github.com/angular/angular/commit/2b9cc8503d48173492c29f5a271b61126104fbdb to
      // support how Ivy passed around the namespace URI rather than short name at the time. It did
      // not, however extend the support to other parts of the system (setAttribute, setAttribute,
      // and the ServerRenderer). We should decide what exactly the semantics for dealing with
      // namespaces should be and make it consistent.
      // Related issues:
      // https://github.com/angular/angular/issues/44028
      // https://github.com/angular/angular/issues/44883
      return this.doc.createElementNS(NAMESPACE_URIS[namespace] || namespace, name);
    }

    return this.doc.createElement(name);
  }

  createComment(value: string): any {
    return this.doc.createComment(value);
  }

  createText(value: string): any {
    return this.doc.createTextNode(value);
  }

  appendChild(parent: any, newChild: any): void {
    const targetParent = isTemplateNode(parent) ? parent.content : parent;
    targetParent.appendChild(newChild);
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (parent) {
      const targetParent = isTemplateNode(parent) ? parent.content : parent;
      targetParent.insertBefore(newChild, refChild);
    }
  }

  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      parent.removeChild(oldChild);
    }
  }

  selectRootElement(selectorOrNode: string|any, preserveContent?: boolean): any {
    let el: any = typeof selectorOrNode === 'string' ? this.doc.querySelector(selectorOrNode) :
                                                       selectorOrNode;
    if (!el) {
      throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
    }
    if (!preserveContent) {
      el.textContent = '';
    }
    return el;
  }

  parentNode(node: any): any {
    return node.parentNode;
  }

  nextSibling(node: any): any {
    return node.nextSibling;
  }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (namespace) {
      name = namespace + ':' + name;
      const namespaceUri = NAMESPACE_URIS[namespace];
      if (namespaceUri) {
        el.setAttributeNS(namespaceUri, name, value);
      } else {
        el.setAttribute(name, value);
      }
    } else {
      el.setAttribute(name, value);
    }
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    if (namespace) {
      const namespaceUri = NAMESPACE_URIS[namespace];
      if (namespaceUri) {
        el.removeAttributeNS(namespaceUri, name);
      } else {
        el.removeAttribute(`${namespace}:${name}`);
      }
    } else {
      el.removeAttribute(name);
    }
  }

  addClass(el: any, name: string): void {
    el.classList.add(name);
  }

  removeClass(el: any, name: string): void {
    el.classList.remove(name);
  }

  setStyle(el: any, style: string, value: any, flags: RendererStyleFlags2): void {
    if (flags & (RendererStyleFlags2.DashCase | RendererStyleFlags2.Important)) {
      el.style.setProperty(style, value, flags & RendererStyleFlags2.Important ? 'important' : '');
    } else {
      el.style[style] = value;
    }
  }

  removeStyle(el: any, style: string, flags: RendererStyleFlags2): void {
    if (flags & RendererStyleFlags2.DashCase) {
      // removeProperty has no effect when used on camelCased properties.
      el.style.removeProperty(style);
    } else {
      el.style[style] = '';
    }
  }

  setProperty(el: any, name: string, value: any): void {
    (typeof ngDevMode === 'undefined' || ngDevMode) && checkNoSyntheticProp(name, 'property');
    el[name] = value;
  }

  setValue(node: any, value: string): void {
    node.nodeValue = value;
  }

  listen(target: 'window'|'document'|'body'|any, event: string, callback: (event: any) => boolean):
      () => void {
    (typeof ngDevMode === 'undefined' || ngDevMode) && checkNoSyntheticProp(event, 'listener');
    if (typeof target === 'string') {
      target = getDOM().getGlobalEventTarget(this.doc, target);
      if (!target) {
        throw new Error(`Unsupported event target ${target} for event ${event}`);
      }
    }

    return this.eventManager.addEventListener(
               target, event, this.decoratePreventDefault(callback)) as VoidFunction;
  }

  private decoratePreventDefault(eventHandler: Function): Function {
    // `DebugNode.triggerEventHandler` needs to know if the listener was created with
    // decoratePreventDefault or is a listener added outside the Angular context so it can handle
    // the two differently. In the first case, the special '__ngUnwrap__' token is passed to the
    // unwrap the listener (see below).
    return (event: any) => {
      // Ivy uses '__ngUnwrap__' as a special token that allows us to unwrap the function
      // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`. The
      // debug_node can inspect the listener toString contents for the existence of this special
      // token. Because the token is a string literal, it is ensured to not be modified by compiled
      // code.
      if (event === '__ngUnwrap__') {
        return eventHandler;
      }

      // Run the event handler inside the ngZone because event handlers are not patched
      // by Zone on the server. This is required only for tests.
      const allowDefaultBehavior = this.platformIsServer ?
          this.ngZone.runGuarded(() => eventHandler(event)) :
          eventHandler(event);
      if (allowDefaultBehavior === false) {
        event.preventDefault();
        event.returnValue = false;
      }

      return undefined;
    };
  }
}

const AT_CHARCODE = (() => '@'.charCodeAt(0))();
function checkNoSyntheticProp(name: string, nameKind: string) {
  if (name.charCodeAt(0) === AT_CHARCODE) {
    throw new Error(`Unexpected synthetic ${nameKind} ${name} found. Please make sure that:
  - Either \`BrowserAnimationsModule\` or \`NoopAnimationsModule\` are imported in your application.
  - There is corresponding configuration for the animation named \`${
        name}\` defined in the \`animations\` field of the \`@Component\` decorator (see https://angular.io/api/core/Component#animations).`);
  }
}


function isTemplateNode(node: any): node is HTMLTemplateElement {
  return node.tagName === 'TEMPLATE' && node.content !== undefined;
}

class ShadowDomRenderer extends DefaultDomRenderer2 {
  private shadowRoot: any;

  constructor(
      eventManager: EventManager,
      private sharedStylesHost: SharedStylesHost,
      private hostEl: any,
      component: RendererType2,
      doc: Document,
      ngZone: NgZone,
      nonce: string|null,
      platformIsServer: boolean,
  ) {
    super(eventManager, doc, ngZone, platformIsServer);
    this.shadowRoot = (hostEl as any).attachShadow({mode: 'open'});

    this.sharedStylesHost.addHost(this.shadowRoot);
    const styles = shimStylesContent(component.id, component.styles);

    for (const style of styles) {
      const styleEl = document.createElement('style');

      if (nonce) {
        styleEl.setAttribute('nonce', nonce);
      }

      styleEl.textContent = style;
      this.shadowRoot.appendChild(styleEl);
    }
  }

  private nodeOrShadowRoot(node: any): any {
    return node === this.hostEl ? this.shadowRoot : node;
  }

  override appendChild(parent: any, newChild: any): void {
    return super.appendChild(this.nodeOrShadowRoot(parent), newChild);
  }
  override insertBefore(parent: any, newChild: any, refChild: any): void {
    return super.insertBefore(this.nodeOrShadowRoot(parent), newChild, refChild);
  }
  override removeChild(parent: any, oldChild: any): void {
    return super.removeChild(this.nodeOrShadowRoot(parent), oldChild);
  }
  override parentNode(node: any): any {
    return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(node)));
  }

  override destroy() {
    this.sharedStylesHost.removeHost(this.shadowRoot);
  }
}

class NoneEncapsulationDomRenderer extends DefaultDomRenderer2 {
  private readonly styles: string[];
  private rendererUsageCount = 0;
  onDestroy: VoidFunction|undefined;

  constructor(
      eventManager: EventManager,
      private readonly sharedStylesHost: SharedStylesHost,
      component: RendererType2,
      private removeStylesOnCompDestory: boolean,
      doc: Document,
      ngZone: NgZone,
      platformIsServer: boolean,
      compId?: string,
  ) {
    super(eventManager, doc, ngZone, platformIsServer);
    this.styles = compId ? shimStylesContent(compId, component.styles) : component.styles;
  }

  applyStyles(): void {
    this.sharedStylesHost.addStyles(this.styles);
    this.rendererUsageCount++;
  }

  override destroy(): void {
    if (!this.removeStylesOnCompDestory) {
      return;
    }

    this.sharedStylesHost.removeStyles(this.styles);
    this.rendererUsageCount--;
    if (this.rendererUsageCount === 0) {
      this.onDestroy?.();
    }
  }
}

class EmulatedEncapsulationDomRenderer2 extends NoneEncapsulationDomRenderer {
  private contentAttr: string;
  private hostAttr: string;

  constructor(
      eventManager: EventManager, sharedStylesHost: SharedStylesHost, component: RendererType2,
      appId: string, removeStylesOnCompDestory: boolean, doc: Document, ngZone: NgZone,
      platformIsServer: boolean) {
    const compId = appId + '-' + component.id;
    super(
        eventManager, sharedStylesHost, component, removeStylesOnCompDestory, doc, ngZone,
        platformIsServer, compId);
    this.contentAttr = shimContentAttribute(compId);
    this.hostAttr = shimHostAttribute(compId);
  }

  applyToHost(element: any): void {
    this.applyStyles();
    this.setAttribute(element, this.hostAttr, '');
  }

  override createElement(parent: any, name: string): Element {
    const el = super.createElement(parent, name);
    super.setAttribute(el, this.contentAttr, '');
    return el;
  }
}
