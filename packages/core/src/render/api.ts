/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../di/injection_token';
import {Injector} from '../di/injector';
import {ViewEncapsulation} from '../metadata/view';
import {injectRenderer2 as render3InjectRenderer2} from '../render3/view_engine_compatibility';
import {noop} from '../util/noop';


/**
 * @deprecated Use `RendererType2` (and `Renderer2`) instead.
 * @publicApi
 */
export class RenderComponentType {
  constructor(
      public id: string, public templateUrl: string, public slotCount: number,
      public encapsulation: ViewEncapsulation, public styles: Array<string|any[]>,
      public animations: any) {}
}

/**
 * @deprecated Debug info is handled internally in the view engine now.
 */
export abstract class RenderDebugInfo {
  abstract get injector(): Injector;
  abstract get component(): any;
  abstract get providerTokens(): any[];
  abstract get references(): {[key: string]: any};
  abstract get context(): any;
  abstract get source(): string;
}

/**
 * @deprecated Use the `Renderer2` instead.
 */
export interface DirectRenderer {
  remove(node: any): void;
  appendChild(node: any, parent: any): void;
  insertBefore(node: any, refNode: any): void;
  nextSibling(node: any): any;
  parentElement(node: any): any;
}

/**
 * @deprecated Use the `Renderer2` instead.
 * @publicApi
 */
export abstract class Renderer {
  abstract selectRootElement(selectorOrNode: string|any, debugInfo?: RenderDebugInfo): any;

  abstract createElement(parentElement: any, name: string, debugInfo?: RenderDebugInfo): any;

  abstract createViewRoot(hostElement: any): any;

  abstract createTemplateAnchor(parentElement: any, debugInfo?: RenderDebugInfo): any;

  abstract createText(parentElement: any, value: string, debugInfo?: RenderDebugInfo): any;

  abstract projectNodes(parentElement: any, nodes: any[]): void;

  abstract attachViewAfter(node: any, viewRootNodes: any[]): void;

  abstract detachView(viewRootNodes: any[]): void;

  abstract destroyView(hostElement: any, viewAllNodes: any[]): void;

  abstract listen(renderElement: any, name: string, callback: Function): Function;

  abstract listenGlobal(target: string, name: string, callback: Function): Function;

  abstract setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;

  abstract setElementAttribute(renderElement: any, attributeName: string, attributeValue?: string):
      void;

  /**
   * Used only in debug mode to serialize property changes to dom nodes as attributes.
   */
  abstract setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string):
      void;

  abstract setElementClass(renderElement: any, className: string, isAdd: boolean): void;

  abstract setElementStyle(renderElement: any, styleName: string, styleValue?: string): void;

  abstract invokeElementMethod(renderElement: any, methodName: string, args?: any[]): void;

  abstract setText(renderNode: any, text: string): void;

  abstract animate(
      element: any, startingStyles: any, keyframes: any[], duration: number, delay: number,
      easing: string, previousPlayers?: any[]): any;
}

export const Renderer2Interceptor = new InjectionToken<Renderer2[]>('Renderer2Interceptor');

/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link Renderer#setElementProperty setElementProperty} or
 * {@link Renderer#setElementAttribute setElementAttribute} respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 *
 * @deprecated Use `RendererFactory2` instead.
 * @publicApi
 */
export abstract class RootRenderer {
  abstract renderComponent(componentType: RenderComponentType): Renderer;
}

/**
 * Used by `RendererFactory2` to associate custom rendering data and styles
 * with a rendering implementation.
 *  @publicApi
 */
export interface RendererType2 {
  /**
   * A unique identifying string for the new renderer, used when creating
   * unique styles for encapsulation.
   */
  id: string;
  /**
   * The view encapsulation type, which determines how styles are applied to
   * DOM elements. One of
   * - `Emulated` (default): Emulate native scoping of styles.
   * - `Native`: Use the native encapsulation mechanism of the renderer.
   * - `ShadowDom`: Use modern [Shadow
   * DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
   * create a ShadowRoot for component's host element.
   * - `None`: Do not provide any template or style encapsulation.
   */
  encapsulation: ViewEncapsulation;
  /**
   * Defines CSS styles to be stored on a renderer instance.
   */
  styles: (string|any[])[];
  /**
   * Defines arbitrary developer-defined data to be stored on a renderer instance.
   * This is useful for renderers that delegate to other renderers.
   */
  data: {[kind: string]: any};
}

/**
 * Creates and initializes a custom renderer that implements the `Renderer2` base class.
 *
 * @publicApi
 */
export abstract class RendererFactory2 {
  /**
   * Creates and initializes a custom renderer for a host DOM element.
   * @param hostElement The element to render.
   * @param type The base class to implement.
   * @returns The new custom renderer instance.
   */
  abstract createRenderer(hostElement: any, type: RendererType2|null): Renderer2;
  /**
   * A callback invoked when rendering has begun.
   */
  abstract begin?(): void;
  /**
   * A callback invoked when rendering has completed.
   */
  abstract end?(): void;
  /**
   * Use with animations test-only mode. Notifies the test when rendering has completed.
   * @returns The asynchronous result of the developer-defined function.
   */
  abstract whenRenderingDone?(): Promise<any>;
}

/**
 * Flags for renderer-specific style modifiers.
 * @publicApi
 */
export enum RendererStyleFlags2 {
  /**
   * Marks a style as important.
   */
  Important = 1 << 0,
  /**
   * Marks a style as using dash case naming (this-is-dash-case).
   */
  DashCase = 1 << 1
}

/**
 * Extend this base class to implement custom rendering. By default, Angular
 * renders a template into DOM. You can use custom rendering to intercept
 * rendering calls, or to render to something other than DOM.
 *
 * Create your custom renderer using `RendererFactory2`.
 *
 * Use a custom renderer to bypass Angular's templating and
 * make custom UI changes that can't be expressed declaratively.
 * For example if you need to set a property or an attribute whose name is
 * not statically known, use the `setProperty()` or
 * `setAttribute()` method.
 *
 * @publicApi
 */
export abstract class Renderer2 {
  /**
   * Use to store arbitrary developer-defined data on a renderer instance,
   * as an object containing key-value pairs.
   * This is useful for renderers that delegate to other renderers.
   */
  abstract get data(): {[key: string]: any};

  /**
   * Implement this callback to destroy the renderer or the host element.
   */
  abstract destroy(): void;
  /**
   * Implement this callback to create an instance of the host element.
   * @param name An identifying name for the new element, unique within the namespace.
   * @param namespace The namespace for the new element.
   * @returns The new element.
   */
  abstract createElement(name: string, namespace?: string|null): any;
  /**
   * Implement this callback to add a comment to the DOM of the host element.
   * @param value The comment text.
   * @returns The modified element.
   */
  abstract createComment(value: string): any;

  /**
   * Implement this callback to add text to the DOM of the host element.
   * @param value The text string.
   * @returns The modified element.
   */
  abstract createText(value: string): any;
  /**
   * If null or undefined, the view engine won't call it.
   * This is used as a performance optimization for production mode.
   */
  // TODO(issue/24571): remove '!'.
  destroyNode !: ((node: any) => void) | null;
  /**
   * Appends a child to a given parent node in the host element DOM.
   * @param parent The parent node.
   * @param newChild The new child node.
   */
  abstract appendChild(parent: any, newChild: any): void;
  /**
   * Implement this callback to insert a child node at a given position in a parent node
   * in the host element DOM.
   * @param parent The parent node.
   * @param newChild The new child nodes.
   * @param refChild The existing child node that should precede the new node.
   */
  abstract insertBefore(parent: any, newChild: any, refChild: any): void;
  /**
   * Implement this callback to remove a child node from the host element's DOM.
   * @param parent The parent node.
   * @param oldChild The child node to remove.
   */
  abstract removeChild(parent: any, oldChild: any): void;
  /**
   * Implement this callback to prepare an element to be bootstrapped
   * as a root element, and return the element instance.
   * @param selectorOrNode The DOM element.
   * @param preserveContent Whether the contents of the root element
   * should be preserved, or cleared upon bootstrap (default behavior).
   * Use with `ViewEncapsulation.ShadowDom` to allow simple native
   * content projection via `<slot>` elements.
   * @returns The root element.
   */
  abstract selectRootElement(selectorOrNode: string|any, preserveContent?: boolean): any;
  /**
   * Implement this callback to get the parent of a given node
   * in the host element's DOM.
   * @param node The child node to query.
   * @returns The parent node, or null if there is no parent.
   * For WebWorkers, always returns true.
   * This is because the check is synchronous,
   * and the caller can't rely on checking for null.
   */
  abstract parentNode(node: any): any;
  /**
   * Implement this callback to get the next sibling node of a given node
   * in the host element's DOM.
   * @returns The sibling node, or null if there is no sibling.
   * For WebWorkers, always returns a value.
   * This is because the check is synchronous,
   * and the caller can't rely on checking for null.
   */
  abstract nextSibling(node: any): any;
  /**
   * Implement this callback to set an attribute value for an element in the DOM.
   * @param el The element.
   * @param name The attribute name.
   * @param value The new value.
   * @param namespace The namespace.
   */
  abstract setAttribute(el: any, name: string, value: string, namespace?: string|null): void;

  /**
   * Implement this callback to remove an attribute from an element in the DOM.
   * @param el The element.
   * @param name The attribute name.
   * @param namespace The namespace.
   */
  abstract removeAttribute(el: any, name: string, namespace?: string|null): void;
  /**
   * Implement this callback to add a class to an element in the DOM.
   * @param el The element.
   * @param name The class name.
   */
  abstract addClass(el: any, name: string): void;

  /**
   * Implement this callback to remove a class from an element in the DOM.
   * @param el The element.
   * @param name The class name.
   */
  abstract removeClass(el: any, name: string): void;

  /**
   * Implement this callback to set a CSS style for an element in the DOM.
   * @param el The element.
   * @param style The name of the style.
   * @param value The new value.
   * @param flags Flags for style variations. No flags are set by default.
   */
  abstract setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2): void;

  /**
   * Implement this callback to remove the value from a CSS style for an element in the DOM.
   * @param el The element.
   * @param style The name of the style.
   * @param flags Flags for style variations to remove, if set. ???
   */
  abstract removeStyle(el: any, style: string, flags?: RendererStyleFlags2): void;

  /**
   * Implement this callback to set the value of a property of an element in the DOM.
   * @param el The element.
   * @param name The property name.
   * @param value The new value.
   */
  abstract setProperty(el: any, name: string, value: any): void;

  /**
   * Implement this callback to set the value of a node in the host element.
   * @param node The node.
   * @param value The new value.
   */
  abstract setValue(node: any, value: string): void;

  /**
   * Implement this callback to start an event listener.
   * @param target The context in which to listen for events. Can be
   * the entire window or document, the body of the document, or a specific
   * DOM element.
   * @param eventName The event to listen for.
   * @param callback A handler function to invoke when the event occurs.
   * @returns An "unlisten" function for disposing of this handler.
   */
  abstract listen(
      target: 'window'|'document'|'body'|any, eventName: string,
      callback: (event: any) => boolean | void): () => void;

  /** @internal */
  static __NG_ELEMENT_ID__: () => Renderer2 = () => SWITCH_RENDERER2_FACTORY();
}


export const SWITCH_RENDERER2_FACTORY__POST_R3__ = render3InjectRenderer2;
const SWITCH_RENDERER2_FACTORY__PRE_R3__ = noop;
const SWITCH_RENDERER2_FACTORY: typeof render3InjectRenderer2 = SWITCH_RENDERER2_FACTORY__PRE_R3__;
