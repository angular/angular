import {Map} from 'angular2/src/core/facade/collection';

export enum ViewType {
  // A view that contains the host element with bound component directive.
  // Contains a COMPONENT view
  HOST,
  // The view of the component
  // Can contain 0 to n EMBEDDED views
  COMPONENT,
  // A view that is embedded into another View via a <template> element
  // inside of a COMPONENT view
  EMBEDDED
}

// An opaque reference to a render proto view
export class RenderProtoViewRef {}

// An opaque reference to a part of a view
export class RenderFragmentRef {}

// An opaque reference to a view
export class RenderViewRef {}

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

export var VIEW_ENCAPSULATION_VALUES =
    [ViewEncapsulation.Emulated, ViewEncapsulation.Native, ViewEncapsulation.None];

export interface RenderTemplateCmd { visit(visitor: RenderCommandVisitor, context: any): any; }

export interface RenderBeginCmd extends RenderTemplateCmd {
  ngContentIndex: number;
  isBound: boolean;
}

export interface RenderTextCmd extends RenderBeginCmd { value: string; }

export interface RenderNgContentCmd { ngContentIndex: number; }

export interface RenderBeginElementCmd extends RenderBeginCmd {
  name: string;
  attrNameAndValues: string[];
  eventTargetAndNames: string[];
}

export interface RenderBeginComponentCmd extends RenderBeginElementCmd {
  nativeShadow: boolean;
  templateId: number;
}

export interface RenderEmbeddedTemplateCmd extends RenderBeginElementCmd {
  isMerged: boolean;
  children: RenderTemplateCmd[];
}

export interface RenderCommandVisitor {
  visitText(cmd: RenderTextCmd, context: any): any;
  visitNgContent(cmd: RenderNgContentCmd, context: any): any;
  visitBeginElement(cmd: RenderBeginElementCmd, context: any): any;
  visitEndElement(context: any): any;
  visitBeginComponent(cmd: RenderBeginComponentCmd, context: any): any;
  visitEndComponent(context: any): any;
  visitEmbeddedTemplate(cmd: RenderEmbeddedTemplateCmd, context: any): any;
}


export class RenderViewWithFragments {
  constructor(public viewRef: RenderViewRef, public fragmentRefs: RenderFragmentRef[]) {}
}

/**
 * Abstract reference to the element which can be marshaled across web-worker boundary.
 *
 * This interface is used by the Renderer API.
 */
export interface RenderElementRef {
  /**
   * Reference to the `RenderViewRef` where the `RenderElementRef` is inside of.
   */
  renderView: RenderViewRef;
  /**
   * Index of the element inside the `RenderViewRef`.
   *
   * This is used internally by the Angular framework to locate elements.
   */
  boundElementIndex: number;
}

export class Renderer {
  /**
   * Registers the template of a component
   */
  registerComponentTemplate(templateId: number, commands: RenderTemplateCmd[], styles: string[]) {}

  /**
   * Creates a new RenderProtoViewRef gfrom RenderTemplateCmds.
   */
  createProtoView(cmds: RenderTemplateCmd[]): RenderProtoViewRef { return null; }

  /**
   * Creates a root host view that includes the given element.
   * Note that the fragmentCount needs to be passed in so that we can create a result
   * synchronously even when dealing with webworkers!
   *
   * @param {RenderProtoViewRef} hostProtoViewRef a RenderProtoViewRef of type
   * ProtoViewDto.HOST_VIEW_TYPE
   * @param {any} hostElementSelector css selector for the host element (will be queried against the
   * main document)
   * @return {RenderViewWithFragments} the created view including fragments
   */
  createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                     hostElementSelector: string): RenderViewWithFragments {
    return null;
  }

  /**
   * Creates a regular view out of the given ProtoView.
   * Note that the fragmentCount needs to be passed in so that we can create a result
   * synchronously even when dealing with webworkers!
   */
  createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments {
    return null;
  }

  /**
   * Destroys the given view after it has been dehydrated and detached
   */
  destroyView(viewRef: RenderViewRef) {}

  /**
   * Attaches a fragment after another fragment.
   */
  attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef,
                              fragmentRef: RenderFragmentRef) {}

  /**
   * Attaches a fragment after an element.
   */
  attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef) {}

  /**
   * Detaches a fragment.
   */
  detachFragment(fragmentRef: RenderFragmentRef) {}

  /**
   * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  hydrateView(viewRef: RenderViewRef) {}

  /**
   * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  dehydrateView(viewRef: RenderViewRef) {}

  /**
   * Returns the native element at the given location.
   * Attention: In a WebWorker scenario, this should always return null!
   */
  getNativeElementSync(location: RenderElementRef): any { return null; }

  /**
   * Sets a property on an element.
   */
  setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any) {}

  /**
   * Sets an attribute on an element.
   */
  setElementAttribute(location: RenderElementRef, attributeName: string, attributeValue: string) {}

  /**
   * Sets a class on an element.
   */
  setElementClass(location: RenderElementRef, className: string, isAdd: boolean) {}

  /**
   * Sets a style on an element.
   */
  setElementStyle(location: RenderElementRef, styleName: string, styleValue: string) {}

  /**
   * Calls a method on an element.
   */
  invokeElementMethod(location: RenderElementRef, methodName: string, args: any[]) {}

  /**
   * Sets the value of a text node.
   */
  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string) {}

  /**
   * Sets the dispatcher for all events of the given view
   */
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher) {}
}


/**
 * A dispatcher for all events happening in a view.
 */
export interface RenderEventDispatcher {
  /**
   * Called when an event was triggered for a on-* attribute on an element.
   * @param {Map<string, any>} locals Locals to be used to evaluate the
   *   event expressions
   * @return {boolean} False if `preventDefault` should be called on the DOM event.
   */
  dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>): boolean;
}
