import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {AST, Locals, ChangeDispatcher, ProtoChangeDetector, ChangeDetector,
  BindingRecord, BindingPropagationConfig, uninitialized} from 'angular2/change_detection';

import {ProtoElementInjector, ElementInjector, PreBuiltObjects, DirectiveBinding} from './element_injector';
import {ElementBinder} from './element_binder';
import {SetterFn} from 'angular2/src/reflection/types';
import {IMPLEMENTS, int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/di';
import {ViewContainer} from './view_container';
import * as renderApi from 'angular2/src/render/api';

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 *
 * @publicModule angular2/template
 */
@IMPLEMENTS(ChangeDispatcher)
// TODO(tbosch): this is not supported in dart2js (no '.' is allowed)
// @IMPLEMENTS(renderApi.EventDispatcher)
export class View {
  render:renderApi.ViewRef;
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  rootElementInjectors:List<ElementInjector>;
  elementInjectors:List<ElementInjector>;
  changeDetector:ChangeDetector;
  componentChildViews: List<View>;
  viewContainers: List<ViewContainer>;
  preBuiltObjects: List<PreBuiltObjects>;
  proto: ProtoView;
  context: any;
  locals:Locals;

  constructor(proto:ProtoView, protoLocals:Map) {
    this.render = null;
    this.proto = proto;
    this.changeDetector = null;
    this.elementInjectors = null;
    this.rootElementInjectors = null;
    this.componentChildViews = null;
    this.viewContainers = null;
    this.preBuiltObjects = null;
    this.context = null;
    this.locals = new Locals(null, MapWrapper.clone(protoLocals)); //TODO optimize this
  }

  init(changeDetector:ChangeDetector, elementInjectors:List, rootElementInjectors:List,
      viewContainers:List, preBuiltObjects:List, componentChildViews:List) {
    this.changeDetector = changeDetector;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.viewContainers = viewContainers;
    this.preBuiltObjects = preBuiltObjects;
    this.componentChildViews = componentChildViews;
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

  _setContextAndLocals(newContext, locals) {
    this.context = newContext;
    this.locals.parent = locals;
    this.changeDetector.hydrate(this.context, this.locals, this.elementInjectors);
  }

  _hydrateChangeDetector() {
    this.changeDetector.hydrate(this.context, this.locals, this.elementInjectors);
  }

  _dehydrateContext() {
    if (isPresent(this.locals)) {
      this.locals.clearValues();
    }
    this.context = null;
    this.changeDetector.dehydrate();
  }

  /**
   * A dehydrated view is a state of the view that allows it to be moved around
   * the view tree, without incurring the cost of recreating the underlying
   * injectors and watch records.
   *
   * A dehydrated view has the following properties:
   *
   * - all element injectors are empty.
   * - all appInjectors are released.
   * - all viewcontainers are empty.
   * - all context locals are set to null.
   * - the view context is null.
   *
   * A call to hydrate/dehydrate does not attach/detach the view from the view
   * tree.
   */
  hydrate(appInjector: Injector, hostElementInjector: ElementInjector,
      context: Object, locals:Locals) {
    var renderComponentViewRefs = this.proto.renderer.createView(this.proto.render);
    this.internalHydrateRecurse(renderComponentViewRefs, 0, appInjector, hostElementInjector, context, locals);
  }

  dehydrate() {
    var render = this.render;
    this.internalDehydrateRecurse();
    this.proto.renderer.destroyView(render);
  }

  internalHydrateRecurse(
      renderComponentViewRefs:List<renderApi.ViewRef>,
      renderComponentIndex:number,
      appInjector: Injector, hostElementInjector: ElementInjector,
      context: Object, locals:Locals):number {
    if (this.hydrated()) throw new BaseException('The view is already hydrated.');

    this.render = renderComponentViewRefs[renderComponentIndex++];

    this._setContextAndLocals(context, locals);

    // viewContainers
    for (var i = 0; i < this.viewContainers.length; i++) {
      var vc = this.viewContainers[i];
      if (isPresent(vc)) {
        vc.internalHydrateRecurse(new renderApi.ViewContainerRef(this.render, i), appInjector, hostElementInjector);
      }
    }

    var binders = this.proto.elementBinders;
    var componentChildViewIndex = 0;
    for (var i = 0; i < binders.length; ++i) {
      var componentDirective = binders[i].componentDirective;
      var shadowDomAppInjector = null;

      // shadowDomAppInjector
      if (isPresent(componentDirective)) {
        var services = componentDirective.annotation.services;
        if (isPresent(services))
          shadowDomAppInjector = appInjector.createChild(services);
        else {
          shadowDomAppInjector = appInjector;
        }
      } else {
        shadowDomAppInjector = null;
      }

      // elementInjectors
      var elementInjector = this.elementInjectors[i];
      if (isPresent(elementInjector)) {
        elementInjector.instantiateDirectives(appInjector, hostElementInjector, shadowDomAppInjector, this.preBuiltObjects[i]);

        // The exporting of $implicit is a special case. Since multiple elements will all export
        // the different values as $implicit, directly assign $implicit bindings to the variable
        // name.
        var exportImplicitName = elementInjector.getExportImplicitName();
        if (elementInjector.isExportingComponent()) {
          this.locals.set(exportImplicitName, elementInjector.getComponent());
        } else if (elementInjector.isExportingElement()) {
          this.locals.set(exportImplicitName, elementInjector.getNgElement());
        }
      }

      if (isPresent(binders[i].nestedProtoView) && isPresent(componentDirective)) {
        renderComponentIndex = this.componentChildViews[componentChildViewIndex].internalHydrateRecurse(
          renderComponentViewRefs,
          renderComponentIndex,
          shadowDomAppInjector,
          elementInjector,
          elementInjector.getComponent(),
          null
        );
        componentChildViewIndex++;
      }
    }
    this._hydrateChangeDetector();
    this.proto.renderer.setEventDispatcher(this.render, this);
    return renderComponentIndex;
  }

  internalDehydrateRecurse() {
    // Note: preserve the opposite order of the hydration process.

    // componentChildViews
    for (var i = 0; i < this.componentChildViews.length; i++) {
      this.componentChildViews[i].internalDehydrateRecurse();
    }

    // elementInjectors
    for (var i = 0; i < this.elementInjectors.length; i++) {
      if (isPresent(this.elementInjectors[i])) {
        this.elementInjectors[i].clearDirectives();
      }
    }

    // viewContainers
    if (isPresent(this.viewContainers)) {
      for (var i = 0; i < this.viewContainers.length; i++) {
        var vc = this.viewContainers[i];
        if (isPresent(vc)) {
          vc.internalDehydrateRecurse();
        }
      }
    }

    this.render = null;

    this._dehydrateContext();
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
  invokeMementoFor(memento:any, currentValue:any) {
    if (memento instanceof ElementBindingMemento) {
      var elementMemento:ElementBindingMemento = memento;
      this.proto.renderer.setElementProperty(
        this.render, elementMemento.elementIndex, elementMemento.propertyName, currentValue
      );
    } else {
      // we know it refers to _textNodes.
      var textNodeIndex:number = memento;
      this.proto.renderer.setText(this.render, textNodeIndex, currentValue);
    }
  }

  // implementation of EventDispatcher#dispatchEvent
  dispatchEvent(
    elementIndex:number, eventName:string, locals:Map<string, any>
  ):void {
    // Most of the time the event will be fired only when the view is in the live document.
    // However, in a rare circumstance the view might get dehydrated, in between the event
    // queuing up and firing.
    if (this.hydrated()) {
      var elBinder = this.proto.elementBinders[elementIndex];
      if (isBlank(elBinder.events)) return;
      var eventMap = elBinder.events[eventName];
      if (isBlank(eventName)) return;
      MapWrapper.forEach(eventMap, (expr, directiveIndex) => {
        var context;
        if (directiveIndex === -1) {
          context = this.context;
        } else {
          context = this.elementInjectors[elementIndex].getDirectiveAtIndex(directiveIndex);
        }
        expr.eval(context, new Locals(this.locals, locals));
      });
    }
  }
}

/**
 *
 * @publicModule angular2/template
 */
export class ProtoView {
  elementBinders:List<ElementBinder>;
  protoChangeDetector:ProtoChangeDetector;
  variableBindings: Map;
  protoLocals:Map;
  textNodesWithBindingCount:int;
  bindingRecords:List;
  parentProtoView:ProtoView;
  _variableBindings:List;

  _directiveMementosMap:Map;
  _directiveMementos:List;
  render:renderApi.ProtoViewRef;
  renderer:renderApi.Renderer;

  constructor(
      renderer:renderApi.Renderer,
      render:renderApi.ProtoViewRef,
      protoChangeDetector:ProtoChangeDetector) {
    this.renderer = renderer;
    this.render = render;
    this.elementBinders = [];
    this.variableBindings = MapWrapper.create();
    this.protoLocals = MapWrapper.create();
    this.protoChangeDetector = protoChangeDetector;
    this.parentProtoView = null;
    this.textNodesWithBindingCount = 0;
    this.bindingRecords = [];
    this._directiveMementosMap = MapWrapper.create();
    this._variableBindings = null;
    this._directiveMementos = null;
  }

  //TODO: Tobias or Victor. Moving it into the constructor.
  // this work should be done the constructor of ProtoView once we separate
  // ProtoView and ProtoViewBuilder
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
  // ProtoView and ProtoViewBuilder
  getDirectiveMementos() {
    if (isPresent(this._directiveMementos)) {
      return this._directiveMementos;
    }

    this._directiveMementos = [];

    for (var injectorIndex = 0; injectorIndex < this.elementBinders.length; ++injectorIndex) {
      var pei = this.elementBinders[injectorIndex].protoElementInjector;
      if (isPresent(pei)) {
        for (var directiveIndex = 0; directiveIndex < pei.numberOfDirectives; ++directiveIndex) {
          ListWrapper.push(this._directiveMementos, this._getDirectiveMemento(injectorIndex, directiveIndex));
        }
      }
    }

    return this._directiveMementos;
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
    var memento = this.textNodesWithBindingCount++;
    ListWrapper.push(this.bindingRecords, new BindingRecord(expression, memento, null));
  }

  /**
   * Adds an element property binding for the last created ElementBinder via bindElement
   */
  bindElementProperty(expression:AST, setterName:string) {
    var memento = new ElementBindingMemento(this.elementBinders.length-1, setterName);
    ListWrapper.push(this.bindingRecords, new BindingRecord(expression, memento, null));
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
  bindEvent(eventName:string, expression:AST, directiveIndex: int = -1) {
    var elBinder = this.elementBinders[this.elementBinders.length - 1];
    var events = elBinder.events;
    if (isBlank(events)) {
      events = StringMapWrapper.create();
      elBinder.events = events;
    }
    var event = StringMapWrapper.get(events, eventName);
    if (isBlank(event)) {
      event = MapWrapper.create();
      StringMapWrapper.set(events, eventName, event);
    }
    MapWrapper.set(event, directiveIndex, expression);
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
    var bindingMemento = new DirectiveBindingMemento(
      elementIndex,
      directiveIndex,
      setterName,
      setter
    );
    var directiveMemento = this._getDirectiveMemento(elementIndex, directiveIndex);
    ListWrapper.push(this.bindingRecords, new BindingRecord(expression, bindingMemento, directiveMemento));
  }

  _getDirectiveMemento(elementInjectorIndex:number, directiveIndex:number) {
    var id = elementInjectorIndex * 100 + directiveIndex;
    var protoElementInjector = this.elementBinders[elementInjectorIndex].protoElementInjector;

    if (!MapWrapper.contains(this._directiveMementosMap, id)) {
      var binding = protoElementInjector.getDirectiveBindingAtIndex(directiveIndex);
      MapWrapper.set(this._directiveMementosMap, id,
        new DirectiveMemento(elementInjectorIndex, directiveIndex,
          binding.callOnAllChangesDone, binding.callOnChange));
    }

    return MapWrapper.get(this._directiveMementosMap, id);
  }
}

/**
 */
export class ElementBindingMemento {
  elementIndex:int;
  propertyName:string;

  constructor(elementIndex:int, propertyName:string) {
    this.elementIndex = elementIndex;
    this.propertyName = propertyName;
  }
}

/**
 */
export class DirectiveBindingMemento {
  _elementInjectorIndex:int;
  _directiveIndex:int;
  propertyName:string;
  setter:SetterFn;
  constructor(
      elementInjectorIndex:number,
      directiveIndex:number,
      propertyName:string,
      setter:SetterFn) {
    this._elementInjectorIndex = elementInjectorIndex;
    this._directiveIndex = directiveIndex;
    this.propertyName = propertyName;
    this.setter = setter;
  }

  invoke(currentValue:any, elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    var directive = elementInjector.getDirectiveAtIndex(this._directiveIndex);
    this.setter(directive, currentValue);
  }
}

class DirectiveMemento {
  _elementInjectorIndex:number;
  _directiveIndex:number;
  callOnAllChangesDone:boolean;
  callOnChange:boolean;

  get name() {
    return `${this._elementInjectorIndex}_${this._directiveIndex}`;
  }

  constructor(elementInjectorIndex:number, directiveIndex:number, callOnAllChangesDone:boolean,
              callOnChange:boolean) {
    this._elementInjectorIndex = elementInjectorIndex;
    this._directiveIndex = directiveIndex;
    this.callOnAllChangesDone = callOnAllChangesDone;
    this.callOnChange = callOnChange;
  }

  directive(elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    return elementInjector.getDirectiveAtIndex(this._directiveIndex);
  }
}