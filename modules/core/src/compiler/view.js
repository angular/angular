import {DOM, Element, Node, Text, DocumentFragment, TemplateElement} from 'facade/dom';
import {ListWrapper, MapWrapper, StringMapWrapper, List} from 'facade/collection';
import {ProtoRecordRange, RecordRange, WatchGroupDispatcher} from 'change_detection/record_range';
import {Record} from 'change_detection/record';
import {AST} from 'change_detection/parser/ast';

import {ProtoElementInjector, ElementInjector, PreBuiltObjects} from './element_injector';
import {ElementBinder} from './element_binder';
import {AnnotatedType} from './annotated_type';
import {SetterFn} from 'reflection/types';
import {FIELD, IMPLEMENTS, int, isPresent, isBlank} from 'facade/lang';
import {Injector} from 'di/di';
import {NgElement} from 'core/dom/element';
import {ViewPort} from './viewport';
import {OnChange} from './interfaces';

const NG_BINDING_CLASS = 'ng-binding';

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
@IMPLEMENTS(WatchGroupDispatcher)
export class View {
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  rootElementInjectors:List<ElementInjector>;
  elementInjectors:List<ElementInjector>;
  bindElements:List<Element>;
  textNodes:List<Text>;
  recordRange:RecordRange;
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  nodes:List<Node>;
  onChangeDispatcher:OnChangeDispatcher;
  componentChildViews: List<View>;
  viewPorts: List<ViewPort>;
  constructor(nodes:List<Node>, elementInjectors:List,
      rootElementInjectors:List, textNodes:List, bindElements:List,
      protoRecordRange:ProtoRecordRange, context) {
    this.nodes = nodes;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.onChangeDispatcher = null;
    this.textNodes = textNodes;
    this.bindElements = bindElements;
    this.recordRange = protoRecordRange.instantiate(this, MapWrapper.create());
    this.recordRange.setContext(context);
    this.componentChildViews = null;
    this.viewPorts = null;
  }

  onRecordChange(groupMemento, records:List<Record>) {
    this._invokeMementoForRecords(records);
    if (groupMemento instanceof DirectivePropertyGroupMemento) {
      this._notifyDirectiveAboutChanges(groupMemento, records);
    }
  }

  _invokeMementoForRecords(records:List<Record>) {
    for(var i = 0; i < records.length; ++i) {
      this._invokeMementoFor(records[i]);
    }
  }

  _notifyDirectiveAboutChanges(groupMemento, records:List<Record>) {
    var dir = groupMemento.directive(this.elementInjectors);
    if (dir instanceof OnChange) {
      dir.onChange(this._collectChanges(records));
    }
  }

    // dispatch to element injector or text nodes based on context
  _invokeMementoFor(record:Record) {
    var memento = record.expressionMemento();
    if (memento instanceof DirectivePropertyMemento) {
      // we know that it is DirectivePropertyMemento
      var directiveMemento:DirectivePropertyMemento = memento;
      directiveMemento.invoke(record, this.elementInjectors);

    } else if (memento instanceof ElementPropertyMemento) {
      var elementMemento:ElementPropertyMemento = memento;
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
      StringMapWrapper.set(changes, record.expressionMemento()._setterName, propertyUpdate);
    }
    return changes;
  }

  addViewPort(viewPort: ViewPort) {
    if (isBlank(this.viewPorts)) this.viewPorts = [];
    ListWrapper.push(this.viewPorts, viewPort);
  }

  addComponentChildView(childView: View) {
    if (isBlank(this.componentChildViews)) this.componentChildViews = [];
    ListWrapper.push(this.componentChildViews, childView);
    this.recordRange.addRange(childView.recordRange);
  }

  addViewPortChildView(childView: View) {
    this.recordRange.addRange(childView.recordRange);
  }

  removeViewPortChildView(childView: View) {
    childView.recordRange.remove();
  }
}

export class ProtoView {
  element:Element;
  elementBinders:List<ElementBinder>;
  protoRecordRange:ProtoRecordRange;
  variableBindings: Map;
  textNodesWithBindingCount:int;
  elementsWithBindingCount:int;
  constructor(
      template:Element,
      protoRecordRange:ProtoRecordRange) {
    this.element = template;
    this.elementBinders = [];
    this.variableBindings = MapWrapper.create();
    this.protoRecordRange = protoRecordRange;
    this.textNodesWithBindingCount = 0;
    this.elementsWithBindingCount = 0;
  }

  instantiate(context, lightDomAppInjector:Injector,
      hostElementInjector: ElementInjector, inPlace:boolean = false):View {
    var clone = inPlace ? this.element : DOM.clone(this.element);
    var elements;
    if (clone instanceof TemplateElement) {
      elements = ListWrapper.clone(DOM.querySelectorAll(clone.content, `.${NG_BINDING_CLASS}`));
    } else {
      elements = ListWrapper.clone(DOM.getElementsByClassName(clone, NG_BINDING_CLASS));
    }
    if (DOM.hasClass(clone, NG_BINDING_CLASS)) {
      ListWrapper.insert(elements, 0, clone);
    }
    var binders = this.elementBinders;

    /**
     * TODO: vsavkin: benchmark
     * If this performs poorly, the seven loops can be collapsed into one.
     */
    var elementInjectors = ProtoView._createElementInjectors(elements, binders, hostElementInjector);
    var rootElementInjectors = ProtoView._rootElementInjectors(elementInjectors);
    var textNodes = ProtoView._textNodes(elements, binders);
    var bindElements = ProtoView._bindElements(elements, binders);
    var shadowAppInjectors = ProtoView._createShadowAppInjectors(binders, lightDomAppInjector);
    var viewNodes;

    if (clone instanceof TemplateElement) {
      viewNodes = ListWrapper.clone(clone.content.childNodes);
    } else {
      viewNodes = [clone];
    }
    var view = new View(viewNodes, elementInjectors, rootElementInjectors, textNodes,
        bindElements, this.protoRecordRange, context);

    ProtoView._instantiateDirectives(
        view, elements, binders, elementInjectors, lightDomAppInjector,
        shadowAppInjectors, hostElementInjector);
    ProtoView._instantiateChildComponentViews(view, elements, binders,
        elementInjectors, shadowAppInjectors);

    return view;
  }

  bindVariable(contextName:string, templateName:string) {
    MapWrapper.set(this.variableBindings, contextName, templateName);
  }

  bindElement(protoElementInjector:ProtoElementInjector,
      componentDirective:AnnotatedType = null, templateDirective:AnnotatedType = null):ElementBinder {
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
    this.protoRecordRange.addRecordsFromAST(expression, memento, memento);
  }

  /**
   * Adds an element property binding for the last created ElementBinder via bindElement
   */
  bindElementProperty(propertyName:string, expression:AST) {
    var elBinder = this.elementBinders[this.elementBinders.length-1];
    if (!elBinder.hasElementPropertyBindings) {
      elBinder.hasElementPropertyBindings = true;
      this.elementsWithBindingCount++;
    }
    var memento = new ElementPropertyMemento(this.elementsWithBindingCount-1, propertyName);
    this.protoRecordRange.addRecordsFromAST(expression, memento, memento);
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
    setter:SetterFn) {

    var expMemento = new DirectivePropertyMemento(
      this.elementBinders.length-1,
      directiveIndex,
      setterName,
      setter
    );
    var groupMemento = DirectivePropertyGroupMemento.get(expMemento);
    this.protoRecordRange.addRecordsFromAST(expression, expMemento, groupMemento, false);
  }

  static _createElementInjectors(elements, binders, hostElementInjector) {
    var injectors = ListWrapper.createFixedSize(binders.length);
    for (var i = 0; i < binders.length; ++i) {
      var proto = binders[i].protoElementInjector;
      if (isPresent(proto)) {
        var parentElementInjector = isPresent(proto.parent) ? injectors[proto.parent.index] : null;
        injectors[i] = proto.instantiate(parentElementInjector, hostElementInjector);
      } else {
        injectors[i] = null;
      }
    }
    return injectors;
  }

  static _instantiateDirectives(
      view, elements:List, binders: List<ElementBinder>, injectors:List<ElementInjectors>,
      lightDomAppInjector: Injector, shadowDomAppInjectors:List<Injectors>,
      hostElementInjector: ElementInjector) {
    for (var i = 0; i < injectors.length; ++i) {
      var injector = injectors[i];
      if (injector != null) {
        var binder = binders[i];
        var element = elements[i];
        var ngElement = new NgElement(element);
        var viewPort = null;
        if (isPresent(binder.templateDirective)) {
          viewPort = new ViewPort(view, element, binder.nestedProtoView, injector);
          viewPort.attach(lightDomAppInjector, hostElementInjector);
          view.addViewPort(viewPort);
        }
        var preBuiltObjs = new PreBuiltObjects(view, ngElement, viewPort);
        injector.instantiateDirectives(
          lightDomAppInjector, shadowDomAppInjectors[i], preBuiltObjs);
      }
    }
  }

  static _rootElementInjectors(injectors) {
    return ListWrapper.filter(injectors, inj => isPresent(inj) && isBlank(inj.parent));
  }

  static _textNodes(elements, binders) {
    var textNodes = [];
    for (var i = 0; i < binders.length; ++i) {
      ProtoView._collectTextNodes(textNodes, elements[i],
          binders[i].textNodeIndices);
    }
    return textNodes;
  }

  static _bindElements(elements, binders):List<Element> {
    var bindElements = [];
    for (var i = 0; i < binders.length; ++i) {
      if (binders[i].hasElementPropertyBindings) ListWrapper.push(
          bindElements, elements[i]);
    }
    return bindElements;
  }

  static _collectTextNodes(allTextNodes, element, indices) {
    if (isPresent(indices)) {
      var childNodes = DOM.templateAwareRoot(element).childNodes;
      for (var i = 0; i < indices.length; ++i) {
        ListWrapper.push(allTextNodes, childNodes[indices[i]]);
      }
    }
  }

  static _instantiateChildComponentViews(view: View, elements, binders,
      injectors, shadowDomAppInjectors: List<Injector>) {
    for (var i = 0; i < binders.length; ++i) {
      var binder = binders[i];
      if (isPresent(binder.componentDirective)) {
        var injector = injectors[i];
        var childView = binder.nestedProtoView.instantiate(
            injector.getComponent(), shadowDomAppInjectors[i], injector);
        view.addComponentChildView(childView);
        var shadowRoot = elements[i].createShadowRoot();
        ViewPort.moveViewNodesIntoParent(shadowRoot, childView);
      }
    }
  }

  static _createShadowAppInjectors(binders: List<ElementBinders>, lightDomAppInjector: Injector): List<Injectors> {
    var injectors = ListWrapper.createFixedSize(binders.length);
    for (var i = 0; i < binders.length; ++i) {
      var componentDirective = binders[i].componentDirective;
      if (isPresent(componentDirective)) {
        var services = componentDirective.annotation.componentServices;
        injectors[i] = isPresent(services) ?
            lightDomAppInjector.createChild(services) : lightDomAppInjector;
      } else {
        injectors[i] = null;
      }
    }
    return injectors;
  }

  // Create a rootView as if the compiler encountered <rootcmp></rootcmp>,
  // and the component template is already compiled into protoView.
  // Used for bootstrapping.
  static createRootProtoView(protoView: ProtoView,
      insertionElement, rootComponentAnnotatedType: AnnotatedType): ProtoView {
    var rootProtoView = new ProtoView(insertionElement, new ProtoRecordRange());
    var binder = rootProtoView.bindElement(
        new ProtoElementInjector(null, 0, [rootComponentAnnotatedType.type], true));
    binder.componentDirective = rootComponentAnnotatedType;
    binder.nestedProtoView = protoView;
    DOM.addClass(insertionElement, 'ng-binding');
    return rootProtoView;
  }
}

export class ElementPropertyMemento {
  _elementIndex:int;
  _propertyName:string;
  constructor(elementIndex:int, propertyName:string) {
    this._elementIndex = elementIndex;
    this._propertyName = propertyName;
  }

  invoke(record:Record, bindElements:List<Element>) {
    var element:Element = bindElements[this._elementIndex];
    DOM.setProperty(element, this._propertyName, record.currentValue);
  }
}

export class DirectivePropertyMemento {
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

  invoke(record:Record, elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    var directive = elementInjector.getAtIndex(this._directiveIndex);
    this._setter(directive, record.currentValue);
  }
}

var _groups = MapWrapper.create();

class DirectivePropertyGroupMemento {
  _elementInjectorIndex:number;
  _directiveIndex:number;

  constructor(elementInjectorIndex:number, directiveIndex:number) {
    this._elementInjectorIndex = elementInjectorIndex;
    this._directiveIndex = directiveIndex;
  }

  static get(memento:DirectivePropertyMemento) {
    var elementInjectorIndex = memento._elementInjectorIndex;
    var directiveIndex = memento._directiveIndex;
    var id = elementInjectorIndex * 100 + directiveIndex;

    if (! MapWrapper.contains(_groups, id)) {
      return MapWrapper.set(_groups, id, new DirectivePropertyGroupMemento(elementInjectorIndex, directiveIndex));
    }
    return MapWrapper.get(_groups, id);
  }

  directive(elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    return elementInjector.getAtIndex(this._directiveIndex);
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


//TODO(tbosch): I don't like to have done be called from a different place than notify
// notify is called by change detection, but done is called by our wrapper on detect changes.
export class OnChangeDispatcher {

  _lastView:View;
  _lastTarget:DirectivePropertyMemento;
  constructor() {
    this._lastView = null;
    this._lastTarget = null;
  }

  notify(view:View, eTarget:DirectivePropertyMemento) {

  }

  done() {

  }
}
