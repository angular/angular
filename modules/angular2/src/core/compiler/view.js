import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {AST, Locals, ChangeDispatcher, ProtoChangeDetector, ChangeDetector,
  ChangeRecord, BindingRecord, DirectiveRecord, ChangeDetectorRef} from 'angular2/change_detection';

import {ProtoElementInjector, ElementInjector, PreBuiltObjects, DirectiveBinding} from './element_injector';
import {ElementBinder} from './element_binder';
import {SetterFn} from 'angular2/src/reflection/types';
import {IMPLEMENTS, int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ViewContainer} from './view_container';
import * as renderApi from 'angular2/src/render/api';
import * as vfModule from './view_factory';
import * as vhModule from './view_hydrator';

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
@IMPLEMENTS(ChangeDispatcher)
// TODO(tbosch): this is not supported in dart2js (no '.' is allowed)
// @IMPLEMENTS(renderApi.EventDispatcher)
export class AppView {
  render:renderApi.ViewRef;
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  rootElementInjectors:List<ElementInjector>;
  elementInjectors:List<ElementInjector>;
  changeDetector:ChangeDetector;
  componentChildViews: List<AppView>;
  viewContainers: List<ViewContainer>;
  preBuiltObjects: List<PreBuiltObjects>;
  proto: AppProtoView;
  renderer: renderApi.Renderer;
  viewFactory: vfModule.ViewFactory;
  viewHydrator: vhModule.AppViewHydrator;

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

  constructor(renderer:renderApi.Renderer, viewFactory:vfModule.ViewFactory, viewHydrator:vhModule.AppViewHydrator, proto:AppProtoView, protoLocals:Map) {
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
    this.viewFactory = viewFactory;
    this.viewHydrator = viewHydrator;
  }

  init(changeDetector:ChangeDetector, elementInjectors:List, rootElementInjectors:List,
      preBuiltObjects:List, componentChildViews:List) {
    this.changeDetector = changeDetector;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.preBuiltObjects = preBuiltObjects;
    this.componentChildViews = componentChildViews;
  }

  getOrCreateViewContainer(boundElementIndex:number) {
    var viewContainer = this.viewContainers[boundElementIndex];
    if (isBlank(viewContainer)) {
      viewContainer = new ViewContainer(this, this.proto.elementBinders[boundElementIndex].nestedProtoView, this.elementInjectors[boundElementIndex]);
      this.viewContainers[boundElementIndex] = viewContainer;
    }
    return viewContainer;
  }

  setLocal(contextName: string, value) {
    if (!this.hydrated()) throw new BaseException('Cannot set locals on dehydrated view.');
    if (!MapWrapper.contains(this.proto.variableBindings, contextName)) {
      return;
    }
    var templateName = MapWrapper.get(this.proto.variableBindings, contextName);
    this.locals.set(templateName, value);
  }

  hydrated() {
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
  triggerEventHandlers(eventName: string, eventObj, binderIndex: int) {
    var locals = MapWrapper.create();
    MapWrapper.set(locals, '$event', eventObj);
    this.dispatchEvent(binderIndex, eventName, locals);
  }

  // dispatch to element injector or text nodes based on context
  notifyOnBinding(b:BindingRecord, currentValue:any) {
    if (b.isElement()) {
      this.renderer.setElementProperty(
        this.render, b.elementIndex, b.propertyName, currentValue
      );
    } else {
      // we know it refers to _textNodes.
      this.renderer.setText(this.render, b.elementIndex, currentValue);
    }
  }

  getDirectiveFor(directive:DirectiveRecord) {
    var elementInjector = this.elementInjectors[directive.elementIndex];
    return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
  }

  getDetectorFor(directive:DirectiveRecord) {
    var elementInjector = this.elementInjectors[directive.elementIndex];
    return elementInjector.getChangeDetector();
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
          allowDefaultBehavior = allowDefaultBehavior && result;  
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
  textNodesWithBindingCount:int;
  bindings:List;
  parentProtoView:AppProtoView;
  _variableBindings:List;

  _directiveRecordsMap:Map;
  _directiveRecords:List;
  render:renderApi.ProtoViewRef;

  constructor(
      render:renderApi.ProtoViewRef,
      protoChangeDetector:ProtoChangeDetector) {
    this.render = render;
    this.elementBinders = [];
    this.variableBindings = MapWrapper.create();
    this.protoLocals = MapWrapper.create();
    this.protoChangeDetector = protoChangeDetector;
    this.parentProtoView = null;
    this.textNodesWithBindingCount = 0;
    this.bindings = [];
    this._directiveRecordsMap = MapWrapper.create();
    this._variableBindings = null;
    this._directiveRecords = null;
  }

  //TODO: Tobias or Victor. Moving it into the constructor.
  // this work should be done the constructor of AppProtoView once we separate
  // AppProtoView and ProtoViewBuilder
  getVariableBindings() {
    if (isPresent(this._variableBindings)) {
      return this._variableBindings;
    }

    this._variableBindings = isPresent(this.parentProtoView) ?
      ListWrapper.clone(this.parentProtoView.getVariableBindings()) : [];

    MapWrapper.forEach(this.protoLocals, (v, local) => {
      ListWrapper.push(this._variableBindings, local);
    });

    return this._variableBindings;
  }

  //TODO: Tobias or Victor. Moving it into the constructor.
  // this work should be done the constructor of ProtoView once we separate
  // AppProtoView and ProtoViewBuilder
  getdirectiveRecords() {
    if (isPresent(this._directiveRecords)) {
      return this._directiveRecords;
    }

    this._directiveRecords = [];

    for (var injectorIndex = 0; injectorIndex < this.elementBinders.length; ++injectorIndex) {
      var pei = this.elementBinders[injectorIndex].protoElementInjector;
      if (isPresent(pei)) {
        for (var directiveIndex = 0; directiveIndex < pei.numberOfDirectives; ++directiveIndex) {
          ListWrapper.push(this._directiveRecords, this._getDirectiveRecord(injectorIndex, directiveIndex));
        }
      }
    }

    return this._directiveRecords;
  }

  bindVariable(contextName:string, templateName:string) {
    MapWrapper.set(this.variableBindings, contextName, templateName);
    MapWrapper.set(this.protoLocals, templateName, null);
  }

  bindElement(parent:ElementBinder, distanceToParent:int, protoElementInjector:ProtoElementInjector,
      componentDirective:DirectiveBinding = null, viewportDirective:DirectiveBinding = null):ElementBinder {
    var elBinder = new ElementBinder(this.elementBinders.length, parent, distanceToParent,
        protoElementInjector, componentDirective, viewportDirective);
    ListWrapper.push(this.elementBinders, elBinder);
    return elBinder;
  }

  /**
   * Adds a text node binding for the last created ElementBinder via bindElement
   */
  bindTextNode(expression:AST) {
    var textNodeIndex = this.textNodesWithBindingCount++;
    var b = BindingRecord.createForTextNode(expression, textNodeIndex);
    ListWrapper.push(this.bindings, b);
  }

  /**
   * Adds an element property binding for the last created ElementBinder via bindElement
   */
  bindElementProperty(expression:AST, setterName:string) {
    var elementIndex = this.elementBinders.length-1;
    var b = BindingRecord.createForElement(expression, elementIndex, setterName);
    ListWrapper.push(this.bindings, b);
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
  bindEvent(eventBindings: List<renderApi.EventBinding>, directiveIndex: int = -1) {
    var elBinder = this.elementBinders[this.elementBinders.length - 1];
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

  /**
   * Adds a directive property binding for the last created ElementBinder via bindElement
   */
  bindDirectiveProperty(
    directiveIndex:number,
    expression:AST,
    setterName:string,
    setter:SetterFn) {

    var elementIndex = this.elementBinders.length-1;
    var directiveRecord = this._getDirectiveRecord(elementIndex, directiveIndex);
    var b = BindingRecord.createForDirective(expression, setterName, setter, directiveRecord);
    ListWrapper.push(this.bindings, b);
  }

  _getDirectiveRecord(elementInjectorIndex:number, directiveIndex:number) {
    var id = elementInjectorIndex * 100 + directiveIndex;
    var protoElementInjector = this.elementBinders[elementInjectorIndex].protoElementInjector;

    if (!MapWrapper.contains(this._directiveRecordsMap, id)) {
      var binding = protoElementInjector.getDirectiveBindingAtIndex(directiveIndex);
      var changeDetection = binding.changeDetection;

      MapWrapper.set(this._directiveRecordsMap, id,
        new DirectiveRecord(elementInjectorIndex, directiveIndex,
          binding.callOnAllChangesDone, binding.callOnChange, changeDetection));
    }

    return MapWrapper.get(this._directiveRecordsMap, id);
  }
}
