/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {
  APP_ID,
  CSP_NONCE,
  Inject,
  Injectable,
  InjectionToken,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  RendererStyleFlags2,
  RendererType2,
  ViewEncapsulation,
  ɵRuntimeError as RuntimeError,
  type ListenerOptions,
  ɵTracingService as TracingService,
  ɵTracingSnapshot as TracingSnapshot,
  Optional,
  ɵallLeavingAnimations as allLeavingAnimations,
} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

import {EventManager} from './events/event_manager';
import {createLinkElement, SharedStylesHost} from './shared_styles_host';

export const NAMESPACE_URIS: {[ns: string]: string} = {
  'svg': 'http://www.w3.org/2000/svg',
  'xhtml': 'http://www.w3.org/1999/xhtml',
  'xlink': 'http://www.w3.org/1999/xlink',
  'xml': 'http://www.w3.org/XML/1998/namespace',
  'xmlns': 'http://www.w3.org/2000/xmlns/',
  'math': 'http://www.w3.org/1998/Math/MathML',
};

const COMPONENT_REGEX = /%COMP%/g;
const SOURCEMAP_URL_REGEXP = /\/\*#\s*sourceMappingURL=(.+?)\s*\*\//;
const PROTOCOL_REGEXP = /^https?:/;

export const COMPONENT_VARIABLE = '%COMP%';
export const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
export const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

/**
 * The default value for the `REMOVE_STYLES_ON_COMPONENT_DESTROY` DI token.
 */
const REMOVE_STYLES_ON_COMPONENT_DESTROY_DEFAULT = true;

/**
 * A DI token that indicates whether styles
 * of destroyed components should be removed from DOM.
 *
 * By default, the value is set to `true`.
 * @publicApi
 */
export const REMOVE_STYLES_ON_COMPONENT_DESTROY = new InjectionToken<boolean>(
  ngDevMode ? 'RemoveStylesOnCompDestroy' : '',
  {
    providedIn: 'root',
    factory: () => REMOVE_STYLES_ON_COMPONENT_DESTROY_DEFAULT,
  },
);

export function shimContentAttribute(componentShortId: string): string {
  return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function shimHostAttribute(componentShortId: string): string {
  return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function shimStylesContent(compId: string, styles: string[]): string[] {
  return styles.map((s) => s.replace(COMPONENT_REGEX, compId));
}

/**
 * Prepends a baseHref to the `sourceMappingURL` within the provided CSS content.
 * If the `sourceMappingURL` contains an inline (encoded) map, the function skips processing.
 *
 * @note For inline stylesheets, the `sourceMappingURL` is relative to the page's origin
 * and not the provided baseHref. This function is needed as when accessing the page with a URL
 * containing two or more segments.
 * For example, if the baseHref is set to `/`, and you visit a URL like `http://localhost/foo/bar`,
 * the map would be requested from `http://localhost/foo/bar/comp.css.map` instead of what you'd expect,
 * which is `http://localhost/comp.css.map`. This behavior is corrected by modifying the `sourceMappingURL`
 * to ensure external source maps are loaded relative to the baseHref.
 *

 * @param baseHref - The base URL to prepend to the `sourceMappingURL`.
 * @param styles - An array of CSS content strings, each potentially containing a `sourceMappingURL`.
 * @returns The updated array of CSS content strings with modified `sourceMappingURL` values,
 * or the original content if no modification is needed.
 */
export function addBaseHrefToCssSourceMap(baseHref: string, styles: string[]): string[] {
  if (!baseHref) {
    return styles;
  }

  const absoluteBaseHrefUrl = new URL(baseHref, 'http://localhost');

  return styles.map((cssContent) => {
    if (!cssContent.includes('sourceMappingURL=')) {
      return cssContent;
    }

    return cssContent.replace(SOURCEMAP_URL_REGEXP, (_, sourceMapUrl) => {
      if (
        sourceMapUrl[0] === '/' ||
        sourceMapUrl.startsWith('data:') ||
        PROTOCOL_REGEXP.test(sourceMapUrl)
      ) {
        return `/*# sourceMappingURL=${sourceMapUrl} */`;
      }

      const {pathname: resolvedSourceMapUrl} = new URL(sourceMapUrl, absoluteBaseHrefUrl);

      return `/*# sourceMappingURL=${resolvedSourceMapUrl} */`;
    });
  });
}

@Injectable()
export class DomRendererFactory2 implements RendererFactory2, OnDestroy {
  private readonly rendererByCompId = new Map<
    string,
    EmulatedEncapsulationDomRenderer2 | NoneEncapsulationDomRenderer
  >();
  private readonly defaultRenderer: Renderer2;
  private readonly platformIsServer: boolean;

  constructor(
    private readonly eventManager: EventManager,
    private readonly sharedStylesHost: SharedStylesHost,
    @Inject(APP_ID) private readonly appId: string,
    @Inject(REMOVE_STYLES_ON_COMPONENT_DESTROY) private removeStylesOnCompDestroy: boolean,
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(PLATFORM_ID) readonly platformId: Object,
    readonly ngZone: NgZone,
    @Inject(CSP_NONCE) private readonly nonce: string | null = null,
    @Inject(TracingService)
    @Optional()
    private readonly tracingService: TracingService<TracingSnapshot> | null = null,
  ) {
    this.platformIsServer = typeof ngServerMode !== 'undefined' && ngServerMode;
    this.defaultRenderer = new DefaultDomRenderer2(
      eventManager,
      doc,
      ngZone,
      this.platformIsServer,
      this.tracingService,
    );
  }

  createRenderer(element: any, type: RendererType2 | null): Renderer2 {
    if (!element || !type) {
      return this.defaultRenderer;
    }

    if (
      typeof ngServerMode !== 'undefined' &&
      ngServerMode &&
      (type.encapsulation === ViewEncapsulation.ShadowDom ||
        type.encapsulation === ViewEncapsulation.IsolatedShadowDom)
    ) {
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
      const removeStylesOnCompDestroy = this.removeStylesOnCompDestroy;
      const platformIsServer = this.platformIsServer;
      const tracingService = this.tracingService;

      switch (type.encapsulation) {
        case ViewEncapsulation.Emulated:
          renderer = new EmulatedEncapsulationDomRenderer2(
            eventManager,
            sharedStylesHost,
            type,
            this.appId,
            removeStylesOnCompDestroy,
            doc,
            ngZone,
            platformIsServer,
            tracingService,
          );
          break;
        case ViewEncapsulation.ShadowDom:
          return new ShadowDomRenderer(
            eventManager,
            element,
            type,
            doc,
            ngZone,
            this.nonce,
            platformIsServer,
            tracingService,
            sharedStylesHost,
          );
        case ViewEncapsulation.IsolatedShadowDom:
          return new ShadowDomRenderer(
            eventManager,
            element,
            type,
            doc,
            ngZone,
            this.nonce,
            platformIsServer,
            tracingService,
          );

        default:
          renderer = new NoneEncapsulationDomRenderer(
            eventManager,
            sharedStylesHost,
            type,
            removeStylesOnCompDestroy,
            doc,
            ngZone,
            platformIsServer,
            tracingService,
          );
          break;
      }

      rendererByCompId.set(type.id, renderer);
    }

    return renderer;
  }

  ngOnDestroy() {
    this.rendererByCompId.clear();
  }

  /**
   * Used during HMR to clear any cached data about a component.
   * @param componentId ID of the component that is being replaced.
   */
  protected componentReplaced(componentId: string) {
    this.rendererByCompId.delete(componentId);
  }
}

class DefaultDomRenderer2 implements Renderer2 {
  data: {[key: string]: any} = Object.create(null);

  /**
   * By default this renderer throws when encountering synthetic properties
   * This can be disabled for example by the AsyncAnimationRendererFactory
   */
  throwOnSyntheticProps = true;

  constructor(
    private readonly eventManager: EventManager,
    private readonly doc: Document,
    protected readonly ngZone: NgZone,
    private readonly platformIsServer: boolean,
    private readonly tracingService: TracingService<TracingSnapshot> | null,
  ) {}

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

  removeChild(_parent: any, oldChild: any): void {
    // child was removed
    oldChild.remove();
  }

  selectRootElement(selectorOrNode: string | any, preserveContent?: boolean): any {
    let el: any =
      typeof selectorOrNode === 'string' ? this.doc.querySelector(selectorOrNode) : selectorOrNode;
    if (!el) {
      throw new RuntimeError(
        RuntimeErrorCode.ROOT_NODE_NOT_FOUND,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `The selector "${selectorOrNode}" did not match any elements`,
      );
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
    if (el == null) {
      return;
    }

    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      this.throwOnSyntheticProps &&
      checkNoSyntheticProp(name, 'property');
    el[name] = value;
  }

  setValue(node: any, value: string): void {
    node.nodeValue = value;
  }

  listen(
    target: 'window' | 'document' | 'body' | any,
    event: string,
    callback: (event: any) => boolean,
    options?: ListenerOptions,
  ): () => void {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      this.throwOnSyntheticProps &&
      checkNoSyntheticProp(event, 'listener');
    if (typeof target === 'string') {
      target = getDOM().getGlobalEventTarget(this.doc, target);
      if (!target) {
        throw new RuntimeError(
          RuntimeErrorCode.UNSUPPORTED_EVENT_TARGET,
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
            `Unsupported event target ${target} for event ${event}`,
        );
      }
    }

    let wrappedCallback = this.decoratePreventDefault(callback);

    if (this.tracingService?.wrapEventListener) {
      wrappedCallback = this.tracingService.wrapEventListener(target, event, wrappedCallback);
    }

    return this.eventManager.addEventListener(
      target,
      event,
      wrappedCallback,
      options,
    ) as VoidFunction;
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
      const allowDefaultBehavior =
        typeof ngServerMode !== 'undefined' && ngServerMode
          ? this.ngZone.runGuarded(() => eventHandler(event))
          : eventHandler(event);
      if (allowDefaultBehavior === false) {
        event.preventDefault();
      }

      return undefined;
    };
  }
}

const AT_CHARCODE = (() => '@'.charCodeAt(0))();

function checkNoSyntheticProp(name: string, nameKind: string) {
  if (name.charCodeAt(0) === AT_CHARCODE) {
    throw new RuntimeError(
      RuntimeErrorCode.UNEXPECTED_SYNTHETIC_PROPERTY,
      `Unexpected synthetic ${nameKind} ${name} found. Please make sure that:
  - Make sure \`provideAnimationsAsync()\`, \`provideAnimations()\` or \`provideNoopAnimations()\` call was added to a list of providers used to bootstrap an application.
  - There is a corresponding animation configuration named \`${name}\` defined in the \`animations\` field of the \`@Component\` decorator (see https://angular.dev/api/core/Component#animations).`,
    );
  }
}

function isTemplateNode(node: any): node is HTMLTemplateElement {
  return node.tagName === 'TEMPLATE' && node.content !== undefined;
}

class ShadowDomRenderer extends DefaultDomRenderer2 {
  private shadowRoot: any;

  constructor(
    eventManager: EventManager,
    private hostEl: any,
    component: RendererType2,
    doc: Document,
    ngZone: NgZone,
    nonce: string | null,
    platformIsServer: boolean,
    tracingService: TracingService<TracingSnapshot> | null,
    private sharedStylesHost?: SharedStylesHost,
  ) {
    super(eventManager, doc, ngZone, platformIsServer, tracingService);
    this.shadowRoot = (hostEl as any).attachShadow({mode: 'open'});

    // SharedStylesHost is used to add styles to the shadow root by ShadowDom.
    // This is optional as it is not used by IsolatedShadowDom.
    if (this.sharedStylesHost) {
      this.sharedStylesHost.addHost(this.shadowRoot);
    }
    let styles = component.styles;
    if (ngDevMode) {
      // We only do this in development, as for production users should not add CSS sourcemaps to components.
      const baseHref = getDOM().getBaseHref(doc) ?? '';
      styles = addBaseHrefToCssSourceMap(baseHref, styles);
    }

    styles = shimStylesContent(component.id, styles);

    for (const style of styles) {
      const styleEl = document.createElement('style');

      if (nonce) {
        styleEl.setAttribute('nonce', nonce);
      }

      styleEl.textContent = style;
      this.shadowRoot.appendChild(styleEl);
    }

    // Apply any external component styles to the shadow root for the component's element.
    // The ShadowDOM renderer uses an alternative execution path for component styles that
    // does not use the SharedStylesHost that other encapsulation modes leverage. Much like
    // the manual addition of embedded styles directly above, any external stylesheets
    // must be manually added here to ensure ShadowDOM components are correctly styled.
    // TODO: Consider reworking the DOM Renderers to consolidate style handling.
    const styleUrls = component.getExternalStyles?.();
    if (styleUrls) {
      for (const styleUrl of styleUrls) {
        const linkEl = createLinkElement(styleUrl, doc);
        if (nonce) {
          linkEl.setAttribute('nonce', nonce);
        }
        this.shadowRoot.appendChild(linkEl);
      }
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

  override removeChild(_parent: any, oldChild: any): void {
    return super.removeChild(null, oldChild);
  }

  override parentNode(node: any): any {
    return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(node)));
  }

  override destroy() {
    if (this.sharedStylesHost) {
      this.sharedStylesHost.removeHost(this.shadowRoot);
    }
  }
}

class NoneEncapsulationDomRenderer extends DefaultDomRenderer2 {
  private readonly styles: string[];
  private readonly styleUrls?: string[];

  constructor(
    eventManager: EventManager,
    private readonly sharedStylesHost: SharedStylesHost,
    component: RendererType2,
    private removeStylesOnCompDestroy: boolean,
    doc: Document,
    ngZone: NgZone,
    platformIsServer: boolean,
    tracingService: TracingService<TracingSnapshot> | null,
    compId?: string,
  ) {
    super(eventManager, doc, ngZone, platformIsServer, tracingService);
    let styles = component.styles;
    if (ngDevMode) {
      // We only do this in development, as for production users should not add CSS sourcemaps to components.
      const baseHref = getDOM().getBaseHref(doc) ?? '';
      styles = addBaseHrefToCssSourceMap(baseHref, styles);
    }

    this.styles = compId ? shimStylesContent(compId, styles) : styles;
    this.styleUrls = component.getExternalStyles?.(compId);
  }

  applyStyles(): void {
    this.sharedStylesHost.addStyles(this.styles, this.styleUrls);
  }

  override destroy(): void {
    if (!this.removeStylesOnCompDestroy) {
      return;
    }
    if (allLeavingAnimations.size === 0) {
      this.sharedStylesHost.removeStyles(this.styles, this.styleUrls);
    }
  }
}

class EmulatedEncapsulationDomRenderer2 extends NoneEncapsulationDomRenderer {
  private contentAttr: string;
  private hostAttr: string;

  constructor(
    eventManager: EventManager,
    sharedStylesHost: SharedStylesHost,
    component: RendererType2,
    appId: string,
    removeStylesOnCompDestroy: boolean,
    doc: Document,
    ngZone: NgZone,
    platformIsServer: boolean,
    tracingService: TracingService<TracingSnapshot> | null,
  ) {
    const compId = appId + '-' + component.id;
    super(
      eventManager,
      sharedStylesHost,
      component,
      removeStylesOnCompDestroy,
      doc,
      ngZone,
      platformIsServer,
      tracingService,
      compId,
    );
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
