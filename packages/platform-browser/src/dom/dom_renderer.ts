/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2, ViewEncapsulation} from '@angular/core';

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
  return (event: any) => {
    const allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      // TODO(tbosch): move preventDefault into event plugins...
      event.preventDefault();
      event.returnValue = false;
    }
  };
}

@Injectable()
export class DomRendererFactory2 implements RendererFactory2 {
  private rendererByCompId = new Map<string, Renderer2>();
  private defaultRenderer: Renderer2;

  constructor(private eventManager: EventManager, private sharedStylesHost: DomSharedStylesHost) {
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
          renderer =
              new EmulatedEncapsulationDomRenderer2(this.eventManager, this.sharedStylesHost, type);
          this.rendererByCompId.set(type.id, renderer);
        }
        (<EmulatedEncapsulationDomRenderer2>renderer).applyToHost(element);
        return renderer;
      }
      case ViewEncapsulation.Native:
      case ViewEncapsulation.ShadowDom:
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
      return document.createElementNS(NAMESPACE_URIS[namespace], name);
    }

    return document.createElement(name);
  }

  createComment(value: string): any { return document.createComment(value); }

  createText(value: string): any { return document.createTextNode(value); }

  appendChild(parent: any, newChild: any): void { parent.appendChild(newChild); }

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

  parentNode(node: any): any { return node.parentNode; }

  nextSibling(node: any): any { return node.nextSibling; }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    if (namespace) {
      name = `${namespace}:${name}`;
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

  addClass(el: any, name: string): void { el.classList.add(name); }

  removeClass(el: any, name: string): void { el.classList.remove(name); }

  setStyle(el: any, style: string, value: any, flags: RendererStyleFlags2): void {
    if (flags & RendererStyleFlags2.DashCase) {
      el.style.setProperty(
          style, value, !!(flags & RendererStyleFlags2.Important) ? 'important' : '');
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
    checkNoSyntheticProp(name, 'property');
    el[name] = value;
  }

  setValue(node: any, value: string): void { node.nodeValue = value; }

  listen(target: 'window'|'document'|'body'|any, event: string, callback: (event: any) => boolean):
      () => void {
    checkNoSyntheticProp(event, 'listener');
    if (typeof target === 'string') {
      return <() => void>this.eventManager.addGlobalEventListener(
          target, event, decoratePreventDefault(callback));
    }
    return <() => void>this.eventManager.addEventListener(
               target, event, decoratePreventDefault(callback)) as() => void;
  }
}

const AT_CHARCODE = '@'.charCodeAt(0);
function checkNoSyntheticProp(name: string, nameKind: string) {
  if (name.charCodeAt(0) === AT_CHARCODE) {
    throw new Error(
        `Found the synthetic ${nameKind} ${name}. Please include either "BrowserAnimationsModule" or "NoopAnimationsModule" in your application.`);
  }
}

class EmulatedEncapsulationDomRenderer2 extends DefaultDomRenderer2 {
  private contentAttr: string;
  private hostAttr: string;

  constructor(
      eventManager: EventManager, sharedStylesHost: DomSharedStylesHost,
      private component: RendererType2) {
    super(eventManager);
    const styles = flattenStyles(component.id, component.styles, []);
    sharedStylesHost.addStyles(styles);

    this.contentAttr = shimContentAttribute(component.id);
    this.hostAttr = shimHostAttribute(component.id);
  }

  applyToHost(element: any) { super.setAttribute(element, this.hostAttr, ''); }

  createElement(parent: any, name: string): Element {
    const el = super.createElement(parent, name);
    super.setAttribute(el, this.contentAttr, '');
    return el;
  }
}

class ShadowDomRenderer extends DefaultDomRenderer2 {
  private shadowRoot: any;

  constructor(
      eventManager: EventManager, private sharedStylesHost: DomSharedStylesHost,
      private hostEl: any, private component: RendererType2) {
    super(eventManager);
    if (component.encapsulation === ViewEncapsulation.ShadowDom) {
      this.shadowRoot = (hostEl as any).attachShadow({mode: 'open'});
    } else {
      this.shadowRoot = (hostEl as any).createShadowRoot();
    }
    this.sharedStylesHost.addHost(this.shadowRoot);
    const styles = flattenStyles(component.id, component.styles, []);
    for (let i = 0; i < styles.length; i++) {
      const styleEl = document.createElement('style');
      styleEl.textContent = styles[i];
      this.shadowRoot.appendChild(styleEl);
    }
  }

  private nodeOrShadowRoot(node: any): any { return node === this.hostEl ? this.shadowRoot : node; }

  destroy() { this.sharedStylesHost.removeHost(this.shadowRoot); }

  appendChild(parent: any, newChild: any): void {
    return super.appendChild(this.nodeOrShadowRoot(parent), newChild);
  }
  insertBefore(parent: any, newChild: any, refChild: any): void {
    return super.insertBefore(this.nodeOrShadowRoot(parent), newChild, refChild);
  }
  removeChild(parent: any, oldChild: any): void {
    return super.removeChild(this.nodeOrShadowRoot(parent), oldChild);
  }
  parentNode(node: any): any {
    return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(node)));
  }
}
