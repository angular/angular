/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DomElementSchemaRegistry} from '@angular/compiler';
import {APP_ID, Inject, Injectable, NgZone, RenderComponentType, Renderer, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2, RootRenderer, ViewEncapsulation, ɵstringify as stringify} from '@angular/core';
import {DOCUMENT, EventManager, ɵNAMESPACE_URIS as NAMESPACE_URIS, ɵSharedStylesHost as SharedStylesHost, ɵflattenStyles as flattenStyles, ɵgetDOM as getDOM, ɵshimContentAttribute as shimContentAttribute, ɵshimHostAttribute as shimHostAttribute} from '@angular/platform-browser';

const EMPTY_ARRAY: any[] = [];

@Injectable()
export class ServerRendererFactory2 implements RendererFactory2 {
  private rendererByCompId = new Map<string, Renderer2>();
  private defaultRenderer: Renderer2;
  private schema = new DomElementSchemaRegistry();

  constructor(
      private eventManager: EventManager, private ngZone: NgZone,
      @Inject(DOCUMENT) private document: any, private sharedStylesHost: SharedStylesHost) {
    this.defaultRenderer = new DefaultServerRenderer2(eventManager, document, ngZone, this.schema);
  }

  createRenderer(element: any, type: RendererType2|null): Renderer2 {
    if (!element || !type) {
      return this.defaultRenderer;
    }
    switch (type.encapsulation) {
      case ViewEncapsulation.Native:
      case ViewEncapsulation.Emulated: {
        let renderer = this.rendererByCompId.get(type.id);
        if (!renderer) {
          renderer = new EmulatedEncapsulationServerRenderer2(
              this.eventManager, this.document, this.ngZone, this.sharedStylesHost, this.schema,
              type);
          this.rendererByCompId.set(type.id, renderer);
        }
        (<EmulatedEncapsulationServerRenderer2>renderer).applyToHost(element);
        return renderer;
      }
      case ViewEncapsulation.Native:
        throw new Error('Native encapsulation is not supported on the server!');
      default: {
        if (!this.rendererByCompId.has(type.id)) {
          const styles = flattenStyles(type.id, type.styles, []);
          this.sharedStylesHost.addStyles(styles);
          this.rendererByCompId.set(type.id, this.defaultRenderer);
        }
        return this.defaultRenderer;
      }
    }
  }

  begin() {}
  end() {}
}

class DefaultServerRenderer2 implements Renderer2 {
  data: {[key: string]: any} = Object.create(null);

  constructor(
      private eventManager: EventManager, protected document: any, private ngZone: NgZone,
      private schema: DomElementSchemaRegistry) {}

  destroy(): void {}

  destroyNode: null;

  createElement(name: string, namespace?: string, debugInfo?: any): any {
    if (namespace) {
      return getDOM().createElementNS(NAMESPACE_URIS[namespace], name, this.document);
    }

    return getDOM().createElement(name, this.document);
  }

  createComment(value: string, debugInfo?: any): any { return getDOM().createComment(value); }

  createText(value: string, debugInfo?: any): any { return getDOM().createTextNode(value); }

  appendChild(parent: any, newChild: any): void { getDOM().appendChild(parent, newChild); }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (parent) {
      getDOM().insertBefore(parent, refChild, newChild);
    }
  }

  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      getDOM().removeChild(parent, oldChild);
    }
  }

  selectRootElement(selectorOrNode: string|any, debugInfo?: any): any {
    let el: any;
    if (typeof selectorOrNode === 'string') {
      el = getDOM().querySelector(this.document, selectorOrNode);
      if (!el) {
        throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
      }
    } else {
      el = selectorOrNode;
    }
    getDOM().clearNodes(el);
    return el;
  }

  parentNode(node: any): any { return getDOM().parentElement(node); }

  nextSibling(node: any): any { return getDOM().nextSibling(node); }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (namespace) {
      getDOM().setAttributeNS(el, NAMESPACE_URIS[namespace], namespace + ':' + name, value);
    } else {
      getDOM().setAttribute(el, name, value);
    }
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    if (namespace) {
      getDOM().removeAttributeNS(el, NAMESPACE_URIS[namespace], name);
    } else {
      getDOM().removeAttribute(el, name);
    }
  }

  addClass(el: any, name: string): void { getDOM().addClass(el, name); }

  removeClass(el: any, name: string): void { getDOM().removeClass(el, name); }

  setStyle(el: any, style: string, value: any, flags: RendererStyleFlags2): void {
    getDOM().setStyle(el, style, value);
  }

  removeStyle(el: any, style: string, flags: RendererStyleFlags2): void {
    getDOM().removeStyle(el, style);
  }

  // The value was validated already as a property binding, against the property name.
  // To know this value is safe to use as an attribute, the security context of the
  // attribute with the given name is checked against that security context of the
  // property.
  private _isSafeToReflectProperty(tagName: string, propertyName: string): boolean {
    return this.schema.securityContext(tagName, propertyName, true) ===
        this.schema.securityContext(tagName, propertyName, false);
  }

  setProperty(el: any, name: string, value: any): void {
    checkNoSyntheticProp(name, 'property');
    getDOM().setProperty(el, name, value);
    // Mirror property values for known HTML element properties in the attributes.
    // Skip `innerhtml` which is conservatively marked as an attribute for security
    // purposes but is not actually an attribute.
    const tagName = (el.tagName as string).toLowerCase();
    if (value != null && (typeof value === 'number' || typeof value == 'string') &&
        name.toLowerCase() !== 'innerhtml' && this.schema.hasElement(tagName, EMPTY_ARRAY) &&
        this.schema.hasProperty(tagName, name, EMPTY_ARRAY) &&
        this._isSafeToReflectProperty(tagName, name)) {
      this.setAttribute(el, name, value.toString());
    }
  }

  setValue(node: any, value: string): void { getDOM().setText(node, value); }

  listen(
      target: 'document'|'window'|'body'|any, eventName: string,
      callback: (event: any) => boolean): () => void {
    checkNoSyntheticProp(eventName, 'listener');
    if (typeof target === 'string') {
      return <() => void>this.eventManager.addGlobalEventListener(
          target, eventName, this.decoratePreventDefault(callback));
    }
    return <() => void>this.eventManager.addEventListener(
               target, eventName, this.decoratePreventDefault(callback)) as() => void;
  }

  private decoratePreventDefault(eventHandler: Function): Function {
    return (event: any) => {
      // Run the event handler inside the ngZone because event handlers are not patched
      // by Zone on the server. This is required only for tests.
      const allowDefaultBehavior = this.ngZone.runGuarded(() => eventHandler(event));
      if (allowDefaultBehavior === false) {
        event.preventDefault();
        event.returnValue = false;
      }
    };
  }
}

const AT_CHARCODE = '@'.charCodeAt(0);
function checkNoSyntheticProp(name: string, nameKind: string) {
  if (name.charCodeAt(0) === AT_CHARCODE) {
    throw new Error(
        `Found the synthetic ${nameKind} ${name}. Please include either "BrowserAnimationsModule" or "NoopAnimationsModule" in your application.`);
  }
}

class EmulatedEncapsulationServerRenderer2 extends DefaultServerRenderer2 {
  private contentAttr: string;
  private hostAttr: string;

  constructor(
      eventManager: EventManager, document: any, ngZone: NgZone, sharedStylesHost: SharedStylesHost,
      schema: DomElementSchemaRegistry, private component: RendererType2) {
    super(eventManager, document, ngZone, schema);
    // Add a 's' prefix to style attributes to indicate server.
    const componentId = 's' + component.id;
    const styles = flattenStyles(componentId, component.styles, []);
    sharedStylesHost.addStyles(styles);

    this.contentAttr = shimContentAttribute(componentId);
    this.hostAttr = shimHostAttribute(componentId);
  }

  applyToHost(element: any) { super.setAttribute(element, this.hostAttr, ''); }

  createElement(parent: any, name: string): Element {
    const el = super.createElement(parent, name, this.document);
    super.setAttribute(el, this.contentAttr, '');
    return el;
  }
}
