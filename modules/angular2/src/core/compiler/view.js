import {DOM} from 'angular2/src/dom/dom_adapter';
import {Promise} from 'angular2/src/facade/async';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {AST, ContextWithVariableBindings, ChangeDispatcher, ProtoChangeDetector, ChangeDetector, ChangeRecord}
  from 'angular2/change_detection';

import {ProtoElementInjector, ElementInjector, PreBuiltObjects} from './element_injector';
import {BindingPropagationConfig} from './binding_propagation_config';
import {ElementBinder} from './element_binder';
import {DirectiveMetadata} from './directive_metadata';
import {SetterFn} from 'angular2/src/reflection/types';
import {FIELD, IMPLEMENTS, int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/di';
import {NgElement} from 'angular2/src/core/dom/element';
import {ViewContainer} from './view_container';
import {LightDom, DestinationLightDom} from './shadow_dom_emulation/light_dom';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {ViewPool} from './view_pool';
import {EventManager} from 'angular2/src/core/events/event_manager';

import {Reflector} from 'angular2/src/reflection/reflection';

const NG_BINDING_CLASS = 'ng-binding';
const NG_BINDING_CLASS_SELECTOR = '.ng-binding';

// TODO(rado): make this configurable/smarter.
var VIEW_POOL_CAPACITY = 10000;
var VIEW_POOL_PREFILL = 0;

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
@IMPLEMENTS(ChangeDispatcher)
export class View {
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  rootElementInjectors:List<ElementInjector>;
  elementInjectors:List<ElementInjector>;
  bindElements:List;
  textNodes:List;
  changeDetector:ChangeDetector;
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  nodes:List;
  componentChildViews: List<View>;
  viewContainers: List<ViewContainer>;
  preBuiltObjects: List<PreBuiltObjects>;
  proto: ProtoView;
  context: any;
  contextWithLocals:ContextWithVariableBindings;

  constructor(proto:ProtoView, nodes:List, protoChangeDetector:ProtoChangeDetector, protoContextLocals:Map) {
    this.proto = proto;
    this.nodes = nodes;
    this.changeDetector = protoChangeDetector.instantiate(this);
    this.elementInjectors = null;
    this.rootElementInjectors = null;
    this.textNodes = null;
    this.bindElements = null;
    this.componentChildViews = null;
    this.viewContainers = null;
    this.preBuiltObjects = null;
    this.context = null;
    this.contextWithLocals = (MapWrapper.size(protoContextLocals) > 0)
      ? new ContextWithVariableBindings(null, MapWrapper.clone(protoContextLocals))
      : null;
  }

  init(elementInjectors:List, rootElementInjectors:List, textNodes: List, bindElements:List,
    viewContainers:List, preBuiltObjects:List, componentChildViews:List) {
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.textNodes = textNodes;
    this.bindElements = bindElements;
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
    this.context.set(templateName, value);
  }

  hydrated() {
    return isPresent(this.context);
  }

  _hydrateContext(newContext) {
    if (isPresent(this.contextWithLocals)) {
      this.contextWithLocals.parent = newContext;
      this.context = this.contextWithLocals;
    } else {
      this.context = newContext;
    }
    // TODO(tbosch): if we have a contextWithLocals we actually only need to
    // set the contextWithLocals once. Would it be faster to always use a contextWithLocals
    // even if we don't have locals and not update the recordRange here?
    this.changeDetector.hydrate(this.context);
  }

  _dehydrateContext() {
    if (isPresent(this.contextWithLocals)) {
      this.contextWithLocals.clearValues();
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
      context: Object) {
    if (this.hydrated()) throw new BaseException('The view is already hydrated.');
    this._hydrateContext(context);

    // viewContainers
    for (var i = 0; i < this.viewContainers.length; i++) {
      this.viewContainers[i].hydrate(appInjector, hostElementInjector);
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
        elementInjector.instantiateDirectives(appInjector, shadowDomAppInjector, this.preBuiltObjects[i]);

        // The exporting of $implicit is a special case. Since multiple elements will all export
        // the different values as $implicit, directly assign $implicit bindings to the variable
        // name.
        var exportImplicitName = elementInjector.getExportImplicitName();
        if (elementInjector.isExportingComponent()) {
          this.context.set(exportImplicitName, elementInjector.getComponent());
        } else if (elementInjector.isExportingElement()) {
          this.context.set(exportImplicitName, elementInjector.getNgElement().domElement);
        }
      }

      if (isPresent(componentDirective)) {
        this.componentChildViews[componentChildViewIndex++].hydrate(shadowDomAppInjector,
          elementInjector, elementInjector.getComponent());
      }
    }

    // this should be moved into DOM write queue
    for (var i = 0; i < binders.length; ++i) {
      var componentDirective = binders[i].componentDirective;
      if (isPresent(componentDirective)) {
        var lightDom = this.preBuiltObjects[i].lightDom;
        if (isPresent(lightDom)) {
          lightDom.redistribute();
        }
      }
    }
  }

  dehydrate() {
    // Note: preserve the opposite order of the hydration process.

    // componentChildViews
    for (var i = 0; i < this.componentChildViews.length; i++) {
      this.componentChildViews[i].dehydrate();
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
        this.viewContainers[i].dehydrate();
      }
    }

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
    var handlers = this.proto.eventHandlers[binderIndex];
    if (isBlank(handlers)) return;
    var handler = StringMapWrapper.get(handlers, eventName);
    if (isBlank(handler)) return;
    handler(eventObj, this);
  }

  onRecordChange(directiveMemento, records:List) {
    this._invokeMementos(records);
    if (directiveMemento instanceof DirectiveMemento) {
      this._notifyDirectiveAboutChanges(directiveMemento, records);
    }
  }

  _invokeMementos(records:List) {
    for(var i = 0; i < records.length; ++i) {
      this._invokeMementoFor(records[i]);
    }
  }

  _notifyDirectiveAboutChanges(directiveMemento, records:List) {
    var dir = directiveMemento.directive(this.elementInjectors);
    var binding = directiveMemento.directiveBinding(this.elementInjectors);

    if (binding.callOnChange) {
      dir.onChange(this._collectChanges(records));
    }
  }

    // dispatch to element injector or text nodes based on context
  _invokeMementoFor(record:ChangeRecord) {
    var memento = record.bindingMemento;
    if (memento instanceof DirectiveBindingMemento) {
      var directiveMemento:DirectiveBindingMemento = memento;
      directiveMemento.invoke(record, this.elementInjectors);

    } else if (memento instanceof ElementBindingMemento) {
      var elementMemento:ElementBindingMemento = memento;
      elementMemento.invoke(record, this.bindElements);

    } else {
      // we know it refers to _textNodes.
      var textNodeIndex:number = memento;
      DOM.setText(this.textNodes[textNodeIndex], record.currentValue);
    }
  }

  _collectChanges(records:List) {
    var changes = StringMapWrapper.create();
    for(var i = 0; i < records.length; ++i) {
      var record = records[i];
      var propertyUpdate = new PropertyUpdate(record.currentValue, record.previousValue);
      StringMapWrapper.set(changes, record.bindingMemento._setterName, propertyUpdate);
    }
    return changes;
  }
}

export class ProtoView {
  element;
  elementBinders:List<ElementBinder>;
  protoChangeDetector:ProtoChangeDetector;
  variableBindings: Map;
  protoContextLocals:Map;
  textNodesWithBindingCount:int;
  elementsWithBindingCount:int;
  instantiateInPlace:boolean;
  rootBindingOffset:int;
  isTemplateElement:boolean;
  shadowDomStrategy: ShadowDomStrategy;
  _viewPool: ViewPool;
  stylePromises: List<Promise>;
  // List<Map<eventName, handler>>, indexed by binder index
  eventHandlers: List;

  constructor(
      template,
      protoChangeDetector:ProtoChangeDetector,
      shadowDomStrategy: ShadowDomStrategy) {
    this.element = template;
    this.elementBinders = [];
    this.variableBindings = MapWrapper.create();
    this.protoContextLocals = MapWrapper.create();
    this.protoChangeDetector = protoChangeDetector;
    this.textNodesWithBindingCount = 0;
    this.elementsWithBindingCount = 0;
    this.instantiateInPlace = false;
    this.rootBindingOffset = (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS))
      ? 1 : 0;
    this.isTemplateElement = DOM.isTemplateElement(this.element);
    this.shadowDomStrategy = shadowDomStrategy;
    this._viewPool = new ViewPool(VIEW_POOL_CAPACITY);
    this.stylePromises = [];
    this.eventHandlers = [];
  }

  // TODO(rado): hostElementInjector should be moved to hydrate phase.
  instantiate(hostElementInjector: ElementInjector, eventManager: EventManager,
    reflector: Reflector):View {
    if (this._viewPool.length() == 0) this._preFillPool(hostElementInjector, eventManager,
      reflector);
    var view = this._viewPool.pop();
    return isPresent(view) ? view : this._instantiate(hostElementInjector, eventManager, reflector);
  }

  _preFillPool(hostElementInjector: ElementInjector, eventManager: EventManager,
    reflector: Reflector) {
    for (var i = 0; i < VIEW_POOL_PREFILL; i++) {
      this._viewPool.push(this._instantiate(hostElementInjector, eventManager, reflector));
    }
  }

  _instantiate(hostElementInjector: ElementInjector, eventManager: EventManager,
    reflector: Reflector): View {
    var rootElementClone = this.instantiateInPlace ? this.element : DOM.importIntoDoc(this.element);
    var elementsWithBindingsDynamic;
    if (this.isTemplateElement) {
      elementsWithBindingsDynamic = DOM.querySelectorAll(DOM.content(rootElementClone), NG_BINDING_CLASS_SELECTOR);
    } else {
      elementsWithBindingsDynamic= DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
    }

    var elementsWithBindings = ListWrapper.createFixedSize(elementsWithBindingsDynamic.length);
    for (var binderIdx = 0; binderIdx < elementsWithBindingsDynamic.length; ++binderIdx) {
      elementsWithBindings[binderIdx] = elementsWithBindingsDynamic[binderIdx];
    }

    var viewNodes;
    if (this.isTemplateElement) {
      var childNode = DOM.firstChild(DOM.content(rootElementClone));
      viewNodes = []; // TODO(perf): Should be fixed size, since we could pre-compute in in ProtoView
      // Note: An explicit loop is the fastest way to convert a DOM array into a JS array!
      while(childNode != null) {
        ListWrapper.push(viewNodes, childNode);
        childNode = DOM.nextSibling(childNode);
      }
    } else {
      viewNodes = [rootElementClone];
    }

    var view = new View(this, viewNodes, this.protoChangeDetector, this.protoContextLocals);
    var binders = this.elementBinders;
    var elementInjectors = ListWrapper.createFixedSize(binders.length);
    var eventHandlers = ListWrapper.createFixedSize(binders.length);
    var rootElementInjectors = [];
    var textNodes = [];
    var elementsWithPropertyBindings = [];
    var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
    var viewContainers = [];
    var componentChildViews = [];

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element;
      if (binderIdx === 0 && this.rootBindingOffset === 1) {
        element = rootElementClone;
      } else {
        element = elementsWithBindings[binderIdx - this.rootBindingOffset];
      }
      var elementInjector = null;

      // elementInjectors and rootElementInjectors
      var protoElementInjector = binder.protoElementInjector;
      if (isPresent(protoElementInjector)) {
        if (isPresent(protoElementInjector.parent)) {
          var parentElementInjector = elementInjectors[protoElementInjector.parent.index];
          elementInjector = protoElementInjector.instantiate(parentElementInjector, null, reflector);
        } else {
          elementInjector = protoElementInjector.instantiate(null, hostElementInjector, reflector);
          ListWrapper.push(rootElementInjectors, elementInjector);
        }
      }
      elementInjectors[binderIdx] = elementInjector;

      if (binder.hasElementPropertyBindings) {
        ListWrapper.push(elementsWithPropertyBindings, element);
      }

      // textNodes
      var textNodeIndices = binder.textNodeIndices;
      if (isPresent(textNodeIndices)) {
        var childNode = DOM.firstChild(DOM.templateAwareRoot(element));
        for (var j = 0, k = 0; j < textNodeIndices.length; j++) {
          for(var index = textNodeIndices[j]; k < index; k++) {
            childNode = DOM.nextSibling(childNode);
          }
          ListWrapper.push(textNodes, childNode);
        }
      }

      // componentChildViews
      var lightDom = null;
      var bindingPropagationConfig = null;
      if (isPresent(binder.componentDirective)) {
        var strategy = this.shadowDomStrategy;
        var childView = binder.nestedProtoView.instantiate(elementInjector, eventManager, reflector);
        view.changeDetector.addChild(childView.changeDetector);

        lightDom = strategy.constructLightDom(view, childView, element);
        strategy.attachTemplate(element, childView);

        bindingPropagationConfig = new BindingPropagationConfig(view.changeDetector);

        ListWrapper.push(componentChildViews, childView);
      }

      // viewContainers
      var viewContainer = null;
      if (isPresent(binder.viewportDirective)) {
        var destLightDom = this._directParentElementLightDom(protoElementInjector, preBuiltObjects);
        viewContainer = new ViewContainer(view, element, binder.nestedProtoView, elementInjector,
          eventManager, reflector, destLightDom);
        ListWrapper.push(viewContainers, viewContainer);
      }

      // preBuiltObjects
      if (isPresent(elementInjector)) {
        preBuiltObjects[binderIdx] = new PreBuiltObjects(view, new NgElement(element), viewContainer,
          lightDom, bindingPropagationConfig);
      }

      // events
      if (isPresent(binder.events)) {
        eventHandlers[binderIdx] = StringMapWrapper.create();
        StringMapWrapper.forEach(binder.events, (eventMap, eventName) => {
          var handler = ProtoView.buildEventHandler(eventMap, binderIdx);
          StringMapWrapper.set(eventHandlers[binderIdx], eventName, handler);
          if (isBlank(elementInjector) || !elementInjector.hasEventEmitter(eventName)) {
            eventManager.addEventListener(element, eventName,
              (event) => { handler(event, view); });
          }
        });
      }
    }

    this.eventHandlers = eventHandlers;

    view.init(elementInjectors, rootElementInjectors, textNodes, elementsWithPropertyBindings,
      viewContainers, preBuiltObjects, componentChildViews);

    return view;
  }

  returnToPool(view: View) {
    this._viewPool.push(view);
  }

  /**
   * Creates an event handler.
   *
   * @param {Map} eventMap Map directiveIndexes to expressions
   * @param {int} injectorIdx
   * @returns {Function}
   */
  static buildEventHandler(eventMap: Map, injectorIdx: int) {
    var locals = MapWrapper.create();
    return (event, view) => {
      // Most of the time the event will be fired only when the view is in the live document.
      // However, in a rare circumstance the view might get dehydrated, in between the event
      // queuing up and firing.
      if (view.hydrated()) {
        MapWrapper.set(locals, '$event', event);
        MapWrapper.forEach(eventMap, (expr, directiveIndex) => {
          var context;
          if (directiveIndex === -1) {
            context = view.context;
          } else {
            context = view.elementInjectors[injectorIdx].getDirectiveAtIndex(directiveIndex);
          }
          expr.eval(new ContextWithVariableBindings(context, locals));
        });
      }
    }
  }

  _directParentElementLightDom(protoElementInjector:ProtoElementInjector, preBuiltObjects:List):LightDom {
    var p = protoElementInjector.directParent();
    return isPresent(p) ? preBuiltObjects[p.index].lightDom : null;
  }

  bindVariable(contextName:string, templateName:string) {
    MapWrapper.set(this.variableBindings, contextName, templateName);
    MapWrapper.set(this.protoContextLocals, templateName, null);
  }

  bindElement(protoElementInjector:ProtoElementInjector,
      componentDirective:DirectiveMetadata = null, viewportDirective:DirectiveMetadata = null):ElementBinder {
    var elBinder = new ElementBinder(protoElementInjector, componentDirective, viewportDirective);
    ListWrapper.push(this.elementBinders, elBinder);
    return elBinder;
  }

  /**
   * Adds a text node binding for the last created ElementBinder via bindElement
   */
  bindTextNode(indexInParent:int, expression:AST) {
    var elBinder = this.elementBinders[this.elementBinders.length-1];
    if (isBlank(elBinder.textNodeIndices)) {
      elBinder.textNodeIndices = ListWrapper.create();
    }
    ListWrapper.push(elBinder.textNodeIndices, indexInParent);
    var memento = this.textNodesWithBindingCount++;
    this.protoChangeDetector.addAst(expression, memento);
  }

  /**
   * Adds an element property binding for the last created ElementBinder via bindElement
   */
  bindElementProperty(expression:AST, setterName:string, setter:SetterFn) {
    var elBinder = this.elementBinders[this.elementBinders.length-1];
    if (!elBinder.hasElementPropertyBindings) {
      elBinder.hasElementPropertyBindings = true;
      this.elementsWithBindingCount++;
    }
    var memento = new ElementBindingMemento(this.elementsWithBindingCount-1, setterName, setter);
    this.protoChangeDetector.addAst(expression, memento);
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

    var bindingMemento = new DirectiveBindingMemento(
      this.elementBinders.length-1,
      directiveIndex,
      setterName,
      setter
    );
    var directiveMemento = DirectiveMemento.get(bindingMemento);
    this.protoChangeDetector.addAst(expression, bindingMemento, directiveMemento);
  }

  // Create a rootView as if the compiler encountered <rootcmp></rootcmp>,
  // and the component template is already compiled into protoView.
  // Used for bootstrapping.
  static createRootProtoView(protoView: ProtoView,
      insertionElement,
      rootComponentAnnotatedType: DirectiveMetadata,
      protoChangeDetector:ProtoChangeDetector,
      shadowDomStrategy: ShadowDomStrategy
  ): ProtoView {

    DOM.addClass(insertionElement, NG_BINDING_CLASS);
    var cmpType = rootComponentAnnotatedType.type;
    var rootProtoView = new ProtoView(insertionElement, protoChangeDetector, shadowDomStrategy);
    rootProtoView.instantiateInPlace = true;
    var binder = rootProtoView.bindElement(
        new ProtoElementInjector(null, 0, [cmpType], true));
    binder.componentDirective = rootComponentAnnotatedType;
    binder.nestedProtoView = protoView;
    shadowDomStrategy.shimAppElement(rootComponentAnnotatedType, insertionElement);
    return rootProtoView;
  }
}

export class ElementBindingMemento {
  _elementIndex:int;
  _setterName:string;
  _setter:SetterFn;
  constructor(elementIndex:int, setterName:string, setter:SetterFn) {
    this._elementIndex = elementIndex;
    this._setterName = setterName;
    this._setter = setter;
  }

  invoke(record:ChangeRecord, bindElements:List) {
    var element = bindElements[this._elementIndex];
    this._setter(element, record.currentValue);
  }
}

export class DirectiveBindingMemento {
  _elementInjectorIndex:int;
  _directiveIndex:int;
  _setterName:string;
  _setter:SetterFn;
  constructor(
      elementInjectorIndex:number,
      directiveIndex:number,
      setterName:string,
      setter:SetterFn) {
    this._elementInjectorIndex = elementInjectorIndex;
    this._directiveIndex = directiveIndex;
    this._setterName = setterName;
    this._setter = setter;
  }

  invoke(record:ChangeRecord, elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    var directive = elementInjector.getDirectiveAtIndex(this._directiveIndex);
    this._setter(directive, record.currentValue);
  }
}

var _directiveMementos = MapWrapper.create();

class DirectiveMemento {
  _elementInjectorIndex:number;
  _directiveIndex:number;

  constructor(elementInjectorIndex:number, directiveIndex:number) {
    this._elementInjectorIndex = elementInjectorIndex;
    this._directiveIndex = directiveIndex;
  }

  static get(memento:DirectiveBindingMemento) {
    var elementInjectorIndex = memento._elementInjectorIndex;
    var directiveIndex = memento._directiveIndex;
    var id = elementInjectorIndex * 100 + directiveIndex;

    if (!MapWrapper.contains(_directiveMementos, id)) {
      MapWrapper.set(_directiveMementos, id, new DirectiveMemento(elementInjectorIndex, directiveIndex));
    }
    return MapWrapper.get(_directiveMementos, id);
  }

  directive(elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    return elementInjector.getDirectiveAtIndex(this._directiveIndex);
  }

  directiveBinding(elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    return elementInjector.getDirectiveBindingAtIndex(this._directiveIndex);
  }
}

class PropertyUpdate {
  currentValue;
  previousValue;

  constructor(currentValue, previousValue) {
    this.currentValue = currentValue;
    this.previousValue = previousValue;
  }
}
