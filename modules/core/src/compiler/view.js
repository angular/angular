import {DOM, Element, Node, Text, DocumentFragment, TemplateElement} from 'facade/dom';
import {ListWrapper} from 'facade/collection';
import {ProtoWatchGroup, WatchGroup, WatchGroupDispatcher} from 'change_detection/watch_group';
import {Record} from 'change_detection/record';
import {ProtoElementInjector, ElementInjector} from './element_injector';
// Seems like we are stripping the generics part of List and dartanalyzer
// complains about ElementBinder being unused. Comment back in once it makes it
// into the generated code.
// import {ElementBinder} from './element_binder';
import {SetterFn} from 'change_detection/parser/closure_map';
import {FIELD, IMPLEMENTS, int, isPresent, isBlank} from 'facade/lang';
import {List} from 'facade/collection';
import {Injector} from 'di/di';

/***
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
@IMPLEMENTS(WatchGroupDispatcher)
export class View {
  @FIELD('final fragment:DocumentFragment')
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
  constructor(fragment:DocumentFragment, elementInjector:List,
      rootElementInjectors:List, textNodes:List, bindElements:List,
      protoWatchGroup:ProtoWatchGroup, context) {
    this.fragment = fragment;
    this.nodes = ListWrapper.clone(fragment.childNodes);
    this.elementInjectors = elementInjector;
    this.rootElementInjectors = rootElementInjectors;
    this.onChangeDispatcher = null;
    this.textNodes = textNodes;
    this.bindElements = bindElements;
    this.watchGroup = protoWatchGroup.instantiate(this);
    this.watchGroup.setContext(context);
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
}

export class ProtoView {
  @FIELD('final _template:TemplateElement')
  @FIELD('final _elementBinders:List<ElementBinder>')
  @FIELD('final _protoWatchGroup:ProtoWatchGroup')
  @FIELD('final _useRootElement:bool')
  constructor(
      template:TemplateElement,
      elementBinders:List,
      protoWatchGroup:ProtoWatchGroup,
      useRootElement:boolean) {
    this._template = template;
    this._elementBinders = elementBinders;
    this._protoWatchGroup = protoWatchGroup;

    // not implemented
    this._useRootElement = useRootElement;
  }

  instantiate(context, appInjector:Injector):View {
    var fragment = DOM.clone(this._template.content);
    var elements = DOM.querySelectorAll(fragment, ".ng-binding");
    var binders = this._elementBinders;

    /**
     * TODO: vsavkin: benchmark
     * If this performs poorly, the five loops can be collapsed into one.
     */
    var elementInjectors = ProtoView._createElementInjectors(elements, binders);
    var rootElementInjectors = ProtoView._rootElementInjectors(elementInjectors);
    var textNodes = ProtoView._textNodes(elements, binders);
    var bindElements = ProtoView._bindElements(elements, binders);
    ProtoView._instantiateDirectives(elementInjectors, appInjector);

    return new View(fragment, elementInjectors, rootElementInjectors, textNodes,
        bindElements, this._protoWatchGroup, context);
  }

  static _createElementInjectors(elements, binders) {
    var injectors = ListWrapper.createFixedSize(binders.length);
    for (var i = 0; i < binders.length; ++i) {
      var proto = binders[i].protoElementInjector;
      var parentElementInjector = isPresent(proto.parent) ? injectors[proto.parent.index] : null;
      injectors[i] = ProtoView._createElementInjector(elements[i], parentElementInjector, proto);
    }
    return injectors;
  }

  static _instantiateDirectives(
      injectors:List<ElementInjectors>, appInjector:Injector) {
    for (var i = 0; i < injectors.length; ++i) {
      if (injectors[i] != null) injectors[i].instantiateDirectives(appInjector);
    }
  }

  static _createElementInjector(element, parent:ElementInjector, proto:ProtoElementInjector) {
    //TODO: vsavkin: pass element to `proto.instantiate()` once https://github.com/angular/angular/pull/98 is merged
    return proto.hasBindings ? proto.instantiate({view:null, parentElementInjector:parent}) : null;
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
    var childNodes = DOM.childNodes(element);
    for (var i = 0; i < indices.length; ++i) {
      ListWrapper.push(allTextNodes, childNodes[indices[i]]);
    }
  }
}

export class ElementPropertyMemento {
  @FIELD('final _elementIndex:int')
  @FIELD('final _propertyIndex:string')
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
