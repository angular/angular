import {isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {List, Map} from 'angular2/src/facade/collection';
import {ASTWithSource} from 'angular2/change_detection';

/**
 * General notes:
 *
 * The methods for creating / destroying views in this API are used in the AppViewHydrator
 * and RenderViewHydrator as well.
 *
 * We are already parsing expressions on the render side:
 * - this makes the ElementBinders more compact
 *   (e.g. no need to distinguish interpolations from regular expressions from literals)
 * - allows to retrieve which properties should be accessed from the event
 *   by looking at the expression
 * - we need the parse at least for the `template` attribute to match
 *   directives in it
 * - render compiler is not on the critical path as
 *   its output will be stored in precompiled templates.
 */
export class EventBinding {
  fullName: string; // name/target:name, e.g "click", "window:resize"
  source: ASTWithSource;

  constructor(fullName :string, source: ASTWithSource) {
    this.fullName = fullName;
    this.source = source;
  }
}

export class ElementBinder {
  index:number;
  parentIndex:number;
  distanceToParent:number;
  directives:List<DirectiveBinder>;
  nestedProtoView:ProtoViewDto;
  propertyBindings: Map<string, ASTWithSource>;
  variableBindings: Map<string, ASTWithSource>;
  // Note: this contains a preprocessed AST
  // that replaced the values that should be extracted from the element
  // with a local name
  eventBindings: List<EventBinding>;
  textBindings: List<ASTWithSource>;
  readAttributes: Map<string, string>;

  constructor({
    index, parentIndex, distanceToParent,
    directives, nestedProtoView,
    propertyBindings, variableBindings,
    eventBindings, textBindings,
    readAttributes
  }) {
    this.index = index;
    this.parentIndex = parentIndex;
    this.distanceToParent = distanceToParent;
    this.directives = directives;
    this.nestedProtoView = nestedProtoView;
    this.propertyBindings = propertyBindings;
    this.variableBindings = variableBindings;
    this.eventBindings = eventBindings;
    this.textBindings = textBindings;
    this.readAttributes = readAttributes;
  }
}

export class DirectiveBinder {
  // Index into the array of directives in the View instance
  directiveIndex:any;
  propertyBindings: Map<string, ASTWithSource>;
  // Note: this contains a preprocessed AST
  // that replaced the values that should be extracted from the element
  // with a local name
  eventBindings: List<EventBinding>;
  hostPropertyBindings: Map<string, ASTWithSource>;
  constructor({
    directiveIndex, propertyBindings, eventBindings, hostPropertyBindings
  }) {
    this.directiveIndex = directiveIndex;
    this.propertyBindings = propertyBindings;
    this.eventBindings = eventBindings;
    this.hostPropertyBindings = hostPropertyBindings;
  }
}

export class ProtoViewDto {
  // A view that contains the host element with bound
  // component directive.
  // Contains a view of type #COMPONENT_VIEW_TYPE.
  static get HOST_VIEW_TYPE() { return 0; }
  // The view of the component
  // Can contain 0 to n views of type #EMBEDDED_VIEW_TYPE
  static get COMPONENT_VIEW_TYPE() { return 1; }
  // A view that is included via a Viewport directive
  // inside of a component view
  static get EMBEDDED_VIEW_TYPE() { return 1; }

  render: ProtoViewRef;
  elementBinders:List<ElementBinder>;
  variableBindings: Map<string, string>;
  type: number;

  constructor({render, elementBinders, variableBindings, type}={}) {
    this.render = render;
    this.elementBinders = elementBinders;
    this.variableBindings = variableBindings;
    this.type = type;
  }
}

export class DirectiveMetadata {
  static get DECORATOR_TYPE() { return 0; }
  static get COMPONENT_TYPE() { return 1; }
  static get VIEWPORT_TYPE() { return 2; }
  id:any;
  selector:string;
  compileChildren:boolean;
  hostListeners:Map<string, string>;
  hostProperties:Map<string, string>;
  properties:Map<string, string>;
  readAttributes:List<string>;
  type:number;
  constructor({id, selector, compileChildren, hostListeners, hostProperties, properties, readAttributes, type}) {
    this.id = id;
    this.selector = selector;
    this.compileChildren = isPresent(compileChildren) ? compileChildren : true;
    this.hostListeners = hostListeners;
    this.hostProperties = hostProperties;
    this.properties = properties;
    this.readAttributes = readAttributes;
    this.type = type;
  }
}

// An opaque reference to a RenderProtoView
export class ProtoViewRef {}

// An opaque reference to a RenderView
export class ViewRef {}

export class RenderViewContainerRef {
  view:ViewRef;
  elementIndex:number;
  constructor(view:ViewRef, elementIndex: number) {
    this.view = view;
    this.elementIndex = elementIndex;
  }
}

export class ViewDefinition {
  componentId: string;
  absUrl: string;
  template: string;
  directives: List<DirectiveMetadata>;

  constructor({componentId, absUrl, template, directives}) {
    this.componentId = componentId;
    this.absUrl = absUrl;
    this.template = template;
    this.directives = directives;
  }
}

export class Renderer {
  /**
   * Creats a ProtoViewDto that contains a single nested component with the given componentId.
   */
  createHostProtoView(componentId):Promise<ProtoViewDto> { return null; }

  /**
   * Creats a ProtoViewDto for a component that will use an imperative View using the given
   * renderer.
   * Note: Rigth now, the renderer argument is ignored, but will be used in the future to define
   * a custom handler.
   */
  createImperativeComponentProtoView(rendererId):Promise<ProtoViewDto> { return null; }

  /**
   * Compiles a single RenderProtoView. Non recursive so that
   * we don't need to serialize all possible components over the wire,
   * but only the needed ones based on previous calls.
   */
  compile(template:ViewDefinition):Promise<ProtoViewDto> { return null; }

  /**
   * Sets the preset nested components,
   * which will be instantiated when this protoView is instantiated.
   * Note: We can't create new ProtoViewRefs here as we need to support cycles / recursive components.
   * @param {List<ProtoViewRef>} protoViewRefs
   *    RenderProtoView for every element with a component in this protoView or in a view container's protoView
   */
  mergeChildComponentProtoViews(protoViewRef:ProtoViewRef, componentProtoViewRefs:List<ProtoViewRef>) { return null; }

  /**
   * Creates a view and inserts it into a ViewContainer.
   * @param {RenderViewContainerRef} viewContainerRef
   * @param {ProtoViewRef} protoViewRef A ProtoViewRef of type ProtoViewDto.HOST_VIEW_TYPE or ProtoViewDto.EMBEDDED_VIEW_TYPE
   * @param {number} atIndex
   * @return {List<ViewRef>} the view and all of its nested child component views
   */
  createViewInContainer(vcRef:RenderViewContainerRef, atIndex:number, protoViewRef:ProtoViewRef):List<ViewRef> { return null; }

  /**
   * Destroys the view in the given ViewContainer
   */
  destroyViewInContainer(vcRef:RenderViewContainerRef, atIndex:number):void {}

  /**
   * Inserts a detached view into a viewContainer.
   */
  insertViewIntoContainer(vcRef:RenderViewContainerRef, atIndex:number, view:ViewRef):void {}

  /**
   * Detaches a view from a container so that it can be inserted later on
   */
  detachViewFromContainer(vcRef:RenderViewContainerRef, atIndex:number):void {}

  /**
   * Creates a view and
   * installs it as a shadow view for an element.
   *
   * Note: only allowed if there is a dynamic component directive at this place.
   * @param {ViewRef} hostView
   * @param {number} elementIndex
   * @param {ProtoViewRef} componentProtoViewRef A ProtoViewRef of type ProtoViewDto.COMPONENT_VIEW_TYPE
   * @return {List<ViewRef>} the view and all of its nested child component views
   */
  createDynamicComponentView(hostViewRef:ViewRef, elementIndex:number, componentProtoViewRef:ProtoViewRef):List<ViewRef> { return null; }

  /**
   * Destroys the component view at the given index
   *
   * Note: only allowed if there is a dynamic component directive at this place.
   */
  destroyDynamicComponentView(hostViewRef:ViewRef, elementIndex:number):void {}

  /**
   * Creates a host view that includes the given element.
   * @param {ViewRef} parentViewRef (might be null)
   * @param {any} hostElementSelector element or css selector for the host element
   * @param {ProtoViewRef} hostProtoView a ProtoViewRef of type ProtoViewDto.HOST_VIEW_TYPE
   * @return {List<ViewRef>} the view and all of its nested child component views
   */
  createInPlaceHostView(parentViewRef:ViewRef, hostElementSelector, hostProtoViewRef:ProtoViewRef):List<ViewRef> { return null; }

  /**
   * Destroys the given host view in the given parent view.
   */
  destroyInPlaceHostView(parentViewRef:ViewRef, hostViewRef:ViewRef):void {}

  /**
   * Sets a property on an element.
   * Note: This will fail if the property was not mentioned previously as a host property
   * in the View.
   */
  setElementProperty(view:ViewRef, elementIndex:number, propertyName:string, propertyValue:any):void {}

  /**
   * This will set the value for a text node.
   * Note: This needs to be separate from setElementProperty as we don't have ElementBinders
   * for text nodes in the RenderProtoView either.
   */
  setText(view:ViewRef, textNodeIndex:number, text:string):void {}

  /**
   * Sets the dispatcher for all events that have been defined in the template or in directives
   * in the given view.
   */
  setEventDispatcher(viewRef:ViewRef, dispatcher:any/*EventDispatcher*/):void {}

  /**
   * To be called at the end of the VmTurn so the API can buffer calls
   */
  flush():void {}
}


/**
 * A dispatcher for all events happening in a view.
 */
export class EventDispatcher {
  /**
   * Called when an event was triggered for a on-* attribute on an element.
   * @param {Map<string, any>} locals Locals to be used to evaluate the
   *   event expressions
   */
  dispatchEvent(
    elementIndex:number, eventName:string, locals:Map<string, any>
  ):void {}
}
