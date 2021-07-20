/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_ID, Inject, Injectable, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2, ViewEncapsulation} from '@angular/core';

import {EventManager} from './events/event_manager';
import {DomSharedStylesHost} from './shared_styles_host';

export const NAMESPACE_URIS: {[ns: string]: string} = {
  'svg': 'http://www.w3.org/2000/svg',
  'xhtml': 'http://www.w3.org/1999/xhtml',
  'xlink': 'http://www.w3.org/1999/xlink',
  'xml': 'http://www.w3.org/XML/1998/namespace',
  'xmlns': 'http://www.w3.org/2000/xmlns/',
};

const COMPONENT_REGEX = /%COMP%/g;
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

export const COMPONENT_VARIABLE = '%COMP%';
export const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
export const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

export function shimContentAttribute(componentShortId: string): string {
  return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function shimHostAttribute(componentShortId: string): string {
  return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function flattenStyles(
    compId: string, styles: Array<any|any[]>, target: string[]): string[] {
  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (Array.isArray(style)) {
      flattenStyles(compId, style, target);
    } else {
      style = style.replace(COMPONENT_REGEX, compId);
      target.push(style);
    }
  }
  return target;
}

function decoratePreventDefault(eventHandler: Function): Function {
  // `DebugNode.triggerEventHandler` needs to know if the listener was created with
  // decoratePreventDefault or is a listener added outside the Angular context so it can handle the
  // two differently. In the first case, the special '__ngUnwrap__' token is passed to the unwrap
  // the listener (see below).
  return (event: any) => {
    // Ivy uses '__ngUnwrap__' as a special token that allows us to unwrap the function
    // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`. The debug_node
    // can inspect the listener toString contents for the existence of this special token. Because
    // the token is a string literal, it is ensured to not be modified by compiled code.
    if (event === '__ngUnwrap__') {
      return eventHandler;
    }

    const allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      // TODO(tbosch): move preventDefault into event plugins...
      event.preventDefault();
      event.returnValue = false;
    }

    return undefined;
  };
}

let hasLoggedNativeEncapsulationWarning = false;

@Injectable()
export class DomRendererFactory2 implements RendererFactory2 {
  private rendererByCompId = new Map<string, Renderer2>();
  private defaultRenderer: Renderer2;

  constructor(
      private eventManager: EventManager, private sharedStylesHost: DomSharedStylesHost,
      @Inject(APP_ID) private appId: string) {
    this.defaultRenderer = new DefaultDomRenderer2(eventManager);
  }

  createRenderer(element: any, type: RendererType2|null): Renderer2 {
    if (!element || !type) {
      return this.defaultRenderer;
    }
    switch (type.encapsulation) {
      case ViewEncapsulation.Emulated: {
        let renderer = this.rendererByCompId.get(type.id);
        if (!renderer) {
          renderer = new EmulatedEncapsulationDomRenderer2(
              this.eventManager, this.sharedStylesHost, type, this.appId);
          this.rendererByCompId.set(type.id, renderer);
        }
        (<EmulatedEncapsulationDomRenderer2>renderer).applyToHost(element);
        return renderer;
      }
      // @ts-ignore TODO: Remove as part of FW-2290. TS complains about us dealing with an enum
      // value that is not known (but previously was the value for ViewEncapsulation.Native)
      case 1:
      case ViewEncapsulation.ShadowDom:
        // TODO(FW-2290): remove the `case 1:` fallback logic and the warning in v12.
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            // @ts-ignore TODO: Remove as part of FW-2290. TS complains about us dealing with an
            // enum value that is not known (but previously was the value for
            // ViewEncapsulation.Native)
            !hasLoggedNativeEncapsulationWarning && type.encapsulation === 1) {
          hasLoggedNativeEncapsulationWarning = true;
          console.warn(
              'ViewEncapsulation.Native is no longer supported. Falling back to ViewEncapsulation.ShadowDom. The fallback will be removed in v12.');
        }

        return new ShadowDomRenderer(this.eventManager, this.sharedStylesHost, element, type);
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

class DefaultDomRenderer2 implements Renderer2 {
  data: {[key: string]: any} = Object.create(null);

  constructor(private eventManager: EventManager) {}

  destroy(): void {}

  destroyNode: null;

  createElement(name: string, namespace?: string): any {
    if (namespace) {
      // In cases where Ivy (not ViewEngine) is giving us the actual namespace, the look up by key
      // will result in undefined, so we just return the namespace here.
      return document.createElementNS(NAMESPACE_URIS[namespace] || namespace, name);
    }

    return document.createElement(name);
  }

  createComment(value: string): any {
    return document.createComment(value);
  }

  createText(value: string): any {
    return document.createTextNode(value);
  }

  appendChild(parent: any, newChild: any): void {
    parent.appendChild(newChild);
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (parent) {
      parent.insertBefore(newChild, refChild);
    }
  }

  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      parent.removeChild(oldChild);
    }
  }

  selectRootElement(selectorOrNode: string|any, preserveContent?: boolean): any {
    let el: any = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
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
      // TODO(FW-811): Ivy may cause issues here because it's passing around
      // full URIs for namespaces, therefore this lookup will fail.
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
      // TODO(FW-811): Ivy may cause issues here because it's passing around
      // full URIs for namespaces, therefore this lookup will fail.
      const namespaceUri = NAMESPACE_URIS[namespace];
      if (namespaceUri) {
        el.removeAttributeNS(namespaceUri, name);
      } else {
        // TODO(FW-811): Since ivy is passing around full URIs for namespaces
        // this could result in properties like `http://www.w3.org/2000/svg:cx="123"`,
        // which is wrong.
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
      el.style.removeProperty(style);
    } else {
      // IE requires '' instead of null
      // see https://github.com/angular/angular/issues/7916
      el.style[style] = '';
    }
  }

  setProperty(el: any, name: string, value: any): void {
    NG_DEV_MODE && checkNoSyntheticProp(name, 'property');
    el[name] = value;
  }

  setValue(node: any, value: string): void {
    node.nodeValue = value;
  }

  listen(target: 'window'|'document'|'body'|any, event: string, callback: (event: any) => boolean):
      () => void {
    NG_DEV_MODE && checkNoSyntheticProp(event, 'listener');
    if (typeof target === 'string') {
      return <() => void>this.eventManager.addGlobalEventListener(
          target, event, decoratePreventDefault(callback));
    }
    return <() => void>this.eventManager.addEventListener(
               target, event, decoratePreventDefault(callback)) as () => void;
  }
}

const AT_CHARCODE = (() => '@'.charCodeAt(0))();
function checkNoSyntheticProp(name: string, nameKind: string) {
  if (name.charCodeAt(0) === AT_CHARCODE) {
    throw new Error(`Found the synthetic ${nameKind} ${
        name}. Please include either "BrowserAnimationsModule" or "NoopAnimationsModule" in your application.`);
  }
}

class EmulatedEncapsulationDomRenderer2 extends DefaultDomRenderer2 {
  private contentAttr: string;
  private hostAttr: string;

  constructor(
      eventManager: EventManager, sharedStylesHost: DomSharedStylesHost,
      private component: RendererType2, appId: string) {
    super(eventManager);
    const styles = flattenStyles(appId + '-' + component.id, component.styles, []);
    sharedStylesHost.addStyles(styles);

    this.contentAttr = shimContentAttribute(appId + '-' + component.id);
    this.hostAttr = shimHostAttribute(appId + '-' + component.id);
  }

  applyToHost(element: any) {
    super.setAttribute(element, this.hostAttr, '');
  }

  override createElement(parent: any, name: string): Element {
    const el = super.createElement(parent, name);
    super.setAttribute(el, this.contentAttr, '');
    return el;
  }
}

class ShadowDomRenderer extends DefaultDomRenderer2 {
  private shadowRoot: any;

  constructor(
      eventManager: EventManager, private sharedStylesHost: DomSharedStylesHost,
      private hostEl: any, component: RendererType2) {
    super(eventManager);
    this.shadowRoot = (hostEl as any).attachShadow({mode: 'open'});
    this.sharedStylesHost.addHost(this.shadowRoot);
    const styles = flattenStyles(component.id, component.styles, []);
    for (let i = 0; i < styles.length; i++) {
      const styleEl = document.createElement('style');
      styleEl.textContent = styles[i];
      this.shadowRoot.appendChild(styleEl);
    }
  }

  private nodeOrShadowRoot(node: any): any {
    return node === this.hostEl ? this.shadowRoot : node;
  }

  override destroy() {
    this.sharedStylesHost.removeHost(this.shadowRoot);
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
}
