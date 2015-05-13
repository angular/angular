import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {AST, Locals, ChangeDispatcher, ProtoChangeDetector, ChangeDetector,
  ChangeRecord, BindingRecord, DirectiveRecord, DirectiveIndex, ChangeDetectorRef} from 'angular2/change_detection';

import {ProtoElementInjector, ElementInjector, PreBuiltObjects, DirectiveBinding} from './element_injector';
import {ElementBinder} from './element_binder';
import {IMPLEMENTS, int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as renderApi from 'angular2/src/render/api';

export class AppViewContainer {
  views: List<AppView>;

  constructor() {
    // The order in this list matches the DOM order.
    this.views = [];
  }
}

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
@IMPLEMENTS(ChangeDispatcher)
// TODO(tbosch): this is not supported in dart2js (no '.' is allowed)
// @IMPLEMENTS(renderApi.EventDispatcher)
export class AppView {
  render:renderApi.RenderViewRef;
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  rootElementInjectors:List<ElementInjector>;
  elementInjectors:List<ElementInjector>;
  changeDetector:ChangeDetector;
  componentChildViews: List<AppView>;
  /// Host views that were added by an imperative view.
  /// This is a dynamically growing / shrinking array.
  inPlaceHostViews: List<AppView>;
  viewContainers: List<AppViewContainer>;
  preBuiltObjects: List<PreBuiltObjects>;
  proto: AppProtoView;
  renderer: renderApi.Renderer;

  /**
   * The context against which data-binding expressions in this view are evaluated against.
   * This is always a component instance.
   */

  context: any;

  /**
   * Variables, local to this view, that can be used in binding expressions (in addition to the
   * context). This is used for thing like `<video #player>` or
   * `<li template="for #item of items">`, where "player" and "item" are locals, respectively.
   */
  locals:Locals;

  constructor(renderer:renderApi.Renderer, proto:AppProtoView, protoLocals:Map) {
    this.render = null;
    this.proto = proto;
    this.changeDetector = null;
    this.elementInjectors = null;
    this.rootElementInjectors = null;
    this.componentChildViews = null;
    this.viewContainers = ListWrapper.createFixedSize(this.proto.elementBinders.length);
    this.preBuiltObjects = null;
    this.context = null;
    this.locals = new Locals(null, MapWrapper.clone(protoLocals)); //TODO optimize this
    this.renderer = renderer;
    this.inPlaceHostViews = [];
  }

  init(changeDetector:ChangeDetector, elementInjectors:List, rootElementInjectors:List,
      preBuiltObjects:List, componentChildViews:List) {
    this.changeDetector = changeDetector;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.preBuiltObjects = preBuiltObjects;
    this.componentChildViews = componentChildViews;
  }

  setLocal(contextName: string, value):void {
    if (!this.hydrated()) throw new BaseException('Cannot set locals on dehydrated view.');
    if (!MapWrapper.contains(this.proto.variableBindings, contextName)) {
      return;
    }
    var templateName = MapWrapper.get(this.proto.variableBindings, contextName);
    this.locals.set(templateName, value);
  }

  hydrated():boolean {
    return isPresent(this.context);
  }

  /**
   * Triggers the event handlers for the element and the directives.
   *
   * This method is intended to be called from directive EventEmitters.
   *
   * @param {string} eventName
   * @param {*} eventObj
   * @param {int} binderIndex
   */
  triggerEventHandlers(eventName: string, eventObj, binderIndex: int): void {
    var locals = MapWrapper.create();
    MapWrapper.set(locals, '$event', eventObj);
    this.dispatchEvent(binderIndex, eventName, locals);
  }

  // dispatch to element injector or text nodes based on context
  notifyOnBinding(b:BindingRecord, currentValue:any): void {
    if (b.isElement()) {
      this.renderer.setElementProperty(
        this.render, b.elementIndex, b.propertyName, currentValue
      );
    } else {
      // we know it refers to _textNodes.
      this.renderer.setText(this.render, b.elementIndex, currentValue);
    }
  }

  getDirectiveFor(directive:DirectiveIndex) {
    var elementInjector = this.elementInjectors[directive.elementIndex];
    return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
  }

  getDetectorFor(directive:DirectiveIndex) {
    var childView = this.componentChildViews[directive.elementIndex];
    return isPresent(childView) ? childView.changeDetector : null;
  }

  callAction(elementIndex:number, actionExpression:string, action:Object) {
    this.renderer.callAction(this.render, elementIndex, actionExpression, action);
  }

  // implementation of EventDispatcher#dispatchEvent
  // returns false if preventDefault must be applied to the DOM event
  dispatchEvent(elementIndex:number, eventName:string, locals:Map<string, any>): boolean {
    // Most of the time the event will be fired only when the view is in the live document.
    // However, in a rare circumstance the view might get dehydrated, in between the event
    // queuing up and firing.
    var allowDefaultBehavior = true;
    if (this.hydrated()) {
      var elBinder = this.proto.elementBinders[elementIndex];
      if (isBlank(elBinder.hostListeners)) return allowDefaultBehavior;
      var eventMap = elBinder.hostListeners[eventName];
      if (isBlank(eventMap)) return allowDefaultBehavior;
      MapWrapper.forEach(eventMap, (expr, directiveIndex) => {
        var context;
        if (directiveIndex === -1) {
          context = this.context;
        } else {
          context = this.elementInjectors[elementIndex].getDirectiveAtIndex(directiveIndex);
        }
        var result = expr.eval(context, new Locals(this.locals, locals));
        if (isPresent(result)) {
          allowDefaultBehavior = allowDefaultBehavior && result == true;
        }
      });
    }
    return allowDefaultBehavior;
  }
}

/**
 *
 */
export class AppProtoView {
  elementBinders:List<ElementBinder>;
  protoChangeDetector:ProtoChangeDetector;
  variableBindings: Map;
  protoLocals:Map;
  bindings:List;
  variableNames:List;
  render:renderApi.RenderProtoViewRef;

  constructor(
      render:renderApi.RenderProtoViewRef,
      protoChangeDetector:ProtoChangeDetector,
      variableBindings:Map,
      protoLocals:Map,
      variableNames:List) {
    this.render = render;
    this.elementBinders = [];
    this.variableBindings = variableBindings;
    this.protoLocals = protoLocals;
    this.variableNames = variableNames;
    this.protoChangeDetector = protoChangeDetector;
  }

  bindElement(parent:ElementBinder, distanceToParent:int, protoElementInjector:ProtoElementInjector,
      componentDirective:DirectiveBinding = null):ElementBinder {
    var elBinder = new ElementBinder(this.elementBinders.length, parent, distanceToParent,
        protoElementInjector, componentDirective);
    ListWrapper.push(this.elementBinders, elBinder);
    return elBinder;
  }

  /**
   * Adds an event binding for the last created ElementBinder via bindElement.
   *
   * If the directive index is a positive integer, the event is evaluated in the context of
   * the given directive.
   *
   * If the directive index is -1, the event is evaluated in the context of the enclosing view.
   *
   * @param {string} eventName
   * @param {AST} expression
   * @param {int} directiveIndex The directive index in the binder or -1 when the event is not bound
   *                             to a directive
   */
  bindEvent(eventBindings: List<renderApi.EventBinding>, boundElementIndex:number, directiveIndex: int = -1): void {
    var elBinder = this.elementBinders[boundElementIndex];
    var events = elBinder.hostListeners;
    if (isBlank(events)) {
      events = StringMapWrapper.create();
      elBinder.hostListeners = events;
    }
    for (var i = 0; i < eventBindings.length; i++) {
      var eventBinding = eventBindings[i];
      var eventName = eventBinding.fullName;
      var event = StringMapWrapper.get(events, eventName);
      if (isBlank(event)) {
        event = MapWrapper.create();
        StringMapWrapper.set(events, eventName, event);
      }
      MapWrapper.set(event, directiveIndex, eventBinding.source);
    }
  }
}
