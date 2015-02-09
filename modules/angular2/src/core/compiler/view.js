import {DOM, Element, Node, Text, DocumentFragment, TemplateElement} from 'angular2/src/facade/dom';
import {ListWrapper, MapWrapper, StringMapWrapper, List} from 'angular2/src/facade/collection';
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
import {ViewPort} from './viewport';
import {Content} from './shadow_dom_emulation/content_tag';
import {LightDom, DestinationLightDom} from './shadow_dom_emulation/light_dom';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {ViewPool} from './view_pool';
import {EventManager} from 'angular2/src/core/events/event_manager';

const NG_BINDING_CLASS = 'ng-binding';
const NG_BINDING_CLASS_SELECTOR = '.ng-binding';
// TODO(tbosch): Cannot use `const` because of Dart.
var NO_FORMATTERS = MapWrapper.create();

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
  bindElements:List<Element>;
  textNodes:List<Text>;
  changeDetector:ChangeDetector;
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  nodes:List<Node>;
  componentChildViews: List<View>;
  viewPorts: List<ViewPort>;
  preBuiltObjects: List<PreBuiltObjects>;
  proto: ProtoView;
  context: any;
  contextWithLocals:ContextWithVariableBindings;

  constructor(proto:ProtoView, nodes:List<Node>, protoChangeDetector:ProtoChangeDetector, protoContextLocals:Map) {
    this.proto = proto;
    this.nodes = nodes;
    this.changeDetector = protoChangeDetector.instantiate(this, NO_FORMATTERS);
    this.elementInjectors = null;
    this.rootElementInjectors = null;
    this.textNodes = null;
    this.bindElements = null;
    this.componentChildViews = null;
    this.viewPorts = null;
    this.preBuiltObjects = null;
    this.context = null;
    this.contextWithLocals = (MapWrapper.size(protoContextLocals) > 0)
      ? new ContextWithVariableBindings(null, MapWrapper.clone(protoContextLocals))
      : null;
  }

  init(elementInjectors:List, rootElementInjectors:List, textNodes: List, bindElements:List, viewPorts:List, preBuiltObjects:List, componentChildViews:List) {
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.textNodes = textNodes;
    this.bindElements = bindElements;
    this.viewPorts = viewPorts;
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
    this.changeDetector.setContext(this.context);
  }

  _dehydrateContext() {
    if (isPresent(this.contextWithLocals)) {
      this.contextWithLocals.clearValues();
    }
    this.context = null;
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
   * - all viewports are empty.
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

    // viewPorts
    for (var i = 0; i < this.viewPorts.length; i++) {
      this.viewPorts[i].hydrate(appInjector, hostElementInjector);
    }

    var binders = this.proto.elementBinders;
    var componentChildViewIndex = 0;
    for (var i = 0; i < binders.length; ++i) {
      var componentDirective = binders[i].componentDirective;
      var shadowDomAppInjector = null;

      // shadowDomAppInjector
      if (isPresent(componentDirective)) {
        var services = componentDirective.annotation.componentServices;
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

    // viewPorts
    if (isPresent(this.viewPorts)) {
      for (var i = 0; i < this.viewPorts.length; i++) {
        this.viewPorts[i].dehydrate();
      }
    }

    this._dehydrateContext();
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
  element:Element;
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
  constructor(
      template:Element,
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
    this.isTemplateElement = this.element instanceof TemplateElement;
    this.shadowDomStrategy = shadowDomStrategy;
    this._viewPool = new ViewPool(VIEW_POOL_CAPACITY);
  }

  // TODO(rado): hostElementInjector should be moved to hydrate phase.
  instantiate(hostElementInjector: ElementInjector, eventManager: EventManager):View {
    if (this._viewPool.length() == 0) this._preFillPool(hostElementInjector, eventManager);
    var view = this._viewPool.pop();
    return isPresent(view) ? view : this._instantiate(hostElementInjector, eventManager);
  }

  _preFillPool(hostElementInjector: ElementInjector, eventManager: EventManager) {
    for (var i = 0; i < VIEW_POOL_PREFILL; i++) {
      this._viewPool.push(this._instantiate(hostElementInjector, eventManager));
    }
  }

  _instantiate(hostElementInjector: ElementInjector, eventManager: EventManager): View {
    var rootElementClone = this.instantiateInPlace ? this.element : DOM.clone(this.element);
    var elementsWithBindingsDynamic;
    if (this.isTemplateElement) {
      elementsWithBindingsDynamic = DOM.querySelectorAll(rootElementClone.content, NG_BINDING_CLASS_SELECTOR);
    } else {
      elementsWithBindingsDynamic= DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
    }

    var elementsWithBindings = ListWrapper.createFixedSize(elementsWithBindingsDynamic.length);
    for (var i = 0; i < elementsWithBindingsDynamic.length; ++i) {
      elementsWithBindings[i] = elementsWithBindingsDynamic[i];
    }

    var viewNodes;
    if (this.isTemplateElement) {
      var childNode = DOM.firstChild(rootElementClone.content);
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
    var rootElementInjectors = [];
    var textNodes = [];
    var elementsWithPropertyBindings = [];
    var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
    var viewPorts = [];
    var componentChildViews = [];

    for (var i = 0; i < binders.length; i++) {
      var binder = binders[i];
      var element;
      if (i === 0 && this.rootBindingOffset === 1) {
        element = rootElementClone;
      } else {
        element = elementsWithBindings[i - this.rootBindingOffset];
      }
      var elementInjector = null;

      // elementInjectors and rootElementInjectors
      var protoElementInjector = binder.protoElementInjector;
      if (isPresent(protoElementInjector)) {
        if (isPresent(protoElementInjector.parent)) {
          var parentElementInjector = elementInjectors[protoElementInjector.parent.index];
          elementInjector = protoElementInjector.instantiate(parentElementInjector, null, binder.events);
        } else {
          elementInjector = protoElementInjector.instantiate(null, hostElementInjector, binder.events);
          ListWrapper.push(rootElementInjectors, elementInjector);
        }
      }
      elementInjectors[i] = elementInjector;

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
        var childView = binder.nestedProtoView.instantiate(elementInjector, eventManager);
        view.changeDetector.addChild(childView.changeDetector);

        lightDom = strategy.constructLightDom(view, childView, element);
        strategy.attachTemplate(element, childView);

        bindingPropagationConfig = new BindingPropagationConfig(view.changeDetector);

        ListWrapper.push(componentChildViews, childView);
      }

      // viewPorts
      var viewPort = null;
      if (isPresent(binder.templateDirective)) {
        var destLightDom = this._directParentElementLightDom(protoElementInjector, preBuiltObjects);
        viewPort = new ViewPort(view, element, binder.nestedProtoView, elementInjector,
          eventManager, destLightDom);
        ListWrapper.push(viewPorts, viewPort);
      }

      // preBuiltObjects
      if (isPresent(elementInjector)) {
        preBuiltObjects[i] = new PreBuiltObjects(view, new NgElement(element), viewPort,
          lightDom, bindingPropagationConfig);
      }

      // events
      if (isPresent(binder.events)) {
        MapWrapper.forEach(binder.events, (expr, eventName) => {
          if (isBlank(elementInjector) || !elementInjector.hasEventEmitter(eventName)) {
            var handler = ProtoView.buildInnerCallback(expr, view);
            eventManager.addEventListener(element, eventName, handler);
          }
        });
      }
    }

    view.init(elementInjectors, rootElementInjectors, textNodes, elementsWithPropertyBindings,
      viewPorts, preBuiltObjects, componentChildViews);

    return view;
  }

  returnToPool(view: View) {
    this._viewPool.push(view);
  }

  static buildInnerCallback(expr:AST, view:View) {
    var locals = MapWrapper.create();
    return (event) => {
      // Most of the time the event will be fired only when the view is
      // in the live document.  However, in a rare circumstance the
      // view might get dehydrated, in between the event queuing up and
      // firing.
      if (view.hydrated()) {
        MapWrapper.set(locals, '$event', event);
        var context = new ContextWithVariableBindings(view.context, locals);
        expr.eval(context);
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
      componentDirective:DirectiveMetadata = null, templateDirective:DirectiveMetadata = null):ElementBinder {
    var elBinder = new ElementBinder(protoElementInjector, componentDirective, templateDirective);
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
   * Adds an event binding for the last created ElementBinder via bindElement
   */
  bindEvent(eventName:string, expression:AST) {
    var elBinder = this.elementBinders[this.elementBinders.length-1];
    if (isBlank(elBinder.events)) {
      elBinder.events = MapWrapper.create();
    }
    MapWrapper.set(elBinder.events, eventName, expression);
  }

  /**
   * Adds a directive property binding for the last created ElementBinder via bindElement
   */
  bindDirectiveProperty(
    directiveIndex:number,
    expression:AST,
    setterName:string,
    setter:SetterFn,
    isContentWatch: boolean) {

    var bindingMemento = new DirectiveBindingMemento(
      this.elementBinders.length-1,
      directiveIndex,
      setterName,
      setter
    );
    var directiveMemento = DirectiveMemento.get(bindingMemento);
    this.protoChangeDetector.addAst(expression, bindingMemento, directiveMemento, isContentWatch);
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

    DOM.addClass(insertionElement, 'ng-binding');
    var rootProtoView = new ProtoView(insertionElement, protoChangeDetector, shadowDomStrategy);
    rootProtoView.instantiateInPlace = true;
    var binder = rootProtoView.bindElement(
        new ProtoElementInjector(null, 0, [rootComponentAnnotatedType.type], true));
    binder.componentDirective = rootComponentAnnotatedType;
    binder.nestedProtoView = protoView;
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

  invoke(record:ChangeRecord, bindElements:List<Element>) {
    var element:Element = bindElements[this._elementIndex];
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
