import {DOM, Element, Node, Text, DocumentFragment, TemplateElement} from 'facade/dom';
import {ListWrapper, MapWrapper} from 'facade/collection';
import {ProtoWatchGroup, WatchGroup, WatchGroupDispatcher} from 'change_detection/watch_group';
import {Record} from 'change_detection/record';
import {AST} from 'change_detection/parser/ast';

import {ProtoElementInjector, ElementInjector, PreBuiltObjects} from './element_injector';
import {ElementBinder} from './element_binder';
import {AnnotatedType} from './annotated_type';
import {SetterFn} from 'change_detection/parser/closure_map';
import {FIELD, IMPLEMENTS, int, isPresent, isBlank} from 'facade/lang';
import {List} from 'facade/collection';
import {Injector} from 'di/di';
import {NgElement} from 'core/dom/element';

const NG_BINDING_CLASS = 'ng-binding';

/***
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
@IMPLEMENTS(WatchGroupDispatcher)
export class View {
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  @FIELD('final rootElementInjectors:List<ElementInjector>')
  @FIELD('final elementInjectors:List<ElementInjector>')
  @FIELD('final bindElements:List<Element>')
  @FIELD('final textNodes:List<Text>')
  @FIELD('final watchGroup:WatchGroup')
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  @FIELD('final nodes:List<Node>')
  @FIELD('final onChangeDispatcher:OnChangeDispatcher')
  @FIELD('childViews: List<View>')
  constructor(nodes:List<Node>, elementInjectors:List,
      rootElementInjectors:List, textNodes:List, bindElements:List,
      protoWatchGroup:ProtoWatchGroup, context) {
    this.nodes = nodes;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.onChangeDispatcher = null;
    this.textNodes = textNodes;
    this.bindElements = bindElements;
    this.watchGroup = protoWatchGroup.instantiate(this, MapWrapper.create());
    this.watchGroup.setContext(context);
    // TODO(rado): Since this is only used in tests for now, investigate whether
    // we can remove it.
    this.childViews = [];
  }

  onRecordChange(record:Record, target) {
    // dispatch to element injector or text nodes based on context
    if (target instanceof DirectivePropertyMemento) {
      // we know that it is DirectivePropertyMemento
      var directiveMemento:DirectivePropertyMemento = target;
      directiveMemento.invoke(record, this.elementInjectors);
    } else if (target instanceof ElementPropertyMemento) {
      var elementMemento:ElementPropertyMemento = target;
      elementMemento.invoke(record, this.bindElements);
    } else {
      // we know it refers to _textNodes.
      var textNodeIndex:number = target;
      DOM.setText(this.textNodes[textNodeIndex], record.currentValue);
    }
  }

  addChild(childView: View) {
    ListWrapper.push(this.childViews, childView);
    this.watchGroup.addChild(childView.watchGroup);
  }
}

export class ProtoView {
  @FIELD('final element:Element')
  @FIELD('final elementBinders:List<ElementBinder>')
  @FIELD('final protoWatchGroup:ProtoWatchGroup')
  constructor(
      template:Element,
      protoWatchGroup:ProtoWatchGroup) {
    this.element = template;
    this.elementBinders = [];
    this.variableBindings = MapWrapper.create();
    this.protoWatchGroup = protoWatchGroup;
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
        bindElements, this.protoWatchGroup, context);

    ProtoView._instantiateDirectives(
        view, elements, elementInjectors, lightDomAppInjector, shadowAppInjectors);
    ProtoView._instantiateChildComponentViews(
        elements, binders, elementInjectors, shadowAppInjectors, view);

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
    ListWrapper.push(elBinder.textNodeIndices, indexInParent);
    this.protoWatchGroup.watch(expression, this.textNodesWithBindingCount++);
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
    this.protoWatchGroup.watch(expression,
      new ElementPropertyMemento(
        this.elementsWithBindingCount-1,
        propertyName
      )
    );
  }

  /**
   * Adds a directive property binding for the last created ElementBinder via bindElement
   */
  bindDirectiveProperty(
    directiveIndex:number,
    expression:AST,
    setterName:string,
    setter:SetterFn) {
    this.protoWatchGroup.watch(
      expression,
      new DirectivePropertyMemento(
        this.elementBinders.length-1,
        directiveIndex,
        setterName,
        setter
      )
    );
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
      view: View, elements:List, injectors:List<ElementInjectors>, lightDomAppInjector: Injector,
      shadowDomAppInjectors:List<Injectors>) {
    for (var i = 0; i < injectors.length; ++i) {
      var preBuiltObjs = new PreBuiltObjects(view, new NgElement(elements[i]));
      if (injectors[i] != null) injectors[i].instantiateDirectives(
          lightDomAppInjector, shadowDomAppInjectors[i], preBuiltObjs);
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
    var childNodes = DOM.templateAwareRoot(element).childNodes;
    for (var i = 0; i < indices.length; ++i) {
      ListWrapper.push(allTextNodes, childNodes[indices[i]]);
    }
  }

  static _instantiateChildComponentViews(elements, binders, injectors,
      shadowDomAppInjectors: List<Injector>, view: View) {
    for (var i = 0; i < binders.length; ++i) {
      var binder = binders[i];
      if (isPresent(binder.componentDirective)) {
        var injector = injectors[i];
        var childView = binder.nestedProtoView.instantiate(
            injector.getComponent(), shadowDomAppInjectors[i], injector);
        view.addChild(childView);
        var shadowRoot = elements[i].createShadowRoot();
        // TODO(rado): reuse utility from ViewPort/View.
        for (var j = 0; j < childView.nodes.length; ++j) {
          DOM.appendChild(shadowRoot, childView.nodes[j]);
        }
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
    var rootProtoView = new ProtoView(insertionElement, new ProtoWatchGroup());
    var binder = rootProtoView.bindElement(
        new ProtoElementInjector(null, 0, [rootComponentAnnotatedType.type], true));
    binder.componentDirective = rootComponentAnnotatedType;
    binder.nestedProtoView = protoView;
    DOM.addClass(insertionElement, 'ng-binding');
    return rootProtoView;
  }
}

export class ElementPropertyMemento {
  @FIELD('final _elementIndex:int')
  @FIELD('final _propertyName:string')
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
  @FIELD('final _elementInjectorIndex:int')
  @FIELD('final _directiveIndex:int')
  @FIELD('final _setterName:string')
  @FIELD('final _setter:SetterFn')
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



//TODO(tbosch): I don't like to have done be called from a different place than notify
// notify is called by change detection, but done is called by our wrapper on detect changes.
export class OnChangeDispatcher {

  @FIELD('_lastView:View')
  @FIELD('_lastTarget:DirectivePropertyMemento')
  constructor() {
    this._lastView = null;
    this._lastTarget = null;
  }

  notify(view:View, eTarget:DirectivePropertyMemento) {

  }

  done() {

  }
}
