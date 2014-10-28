import {DOM, Element, Node, Text, DocumentFragment, TemplateElement} from 'facade/dom';
import {ListWrapper} from 'facade/collection';
import {ProtoWatchGroup, WatchGroup, WatchGroupDispatcher} from 'change_detection/watch_group';
import {Record} from 'change_detection/record';
import {ProtoElementInjector, ElementInjector} from './element_injector';
import {SetterFn} from 'change_detection/facade';
import {FIELD, IMPLEMENTS, int, isPresent, isBlank} from 'facade/lang';
import {List} from 'facade/collection';

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
      rootElementInjectors:List, textNodes:List, bindElements:List) {
    this.fragment = fragment;
    this.nodes = ListWrapper.clone(fragment.childNodes);
    this.elementInjectors = elementInjector;
    this.rootElementInjectors = rootElementInjectors;
    this.onChangeDispatcher = null;
    this.textNodes = textNodes;
    this.bindElements = bindElements;
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
  @FIELD('final _bindings:List')
  @FIELD('final _protoElementInjectors:List<ProtoElementInjector>')
  @FIELD('final _protoWatchGroup:ProtoWatchGroup')
  @FIELD('final _useRootElement:bool')
  constructor(
      template:TemplateElement,
      bindings:List,
      protoElementInjectors:List,
      protoWatchGroup:ProtoWatchGroup,
      useRootElement:boolean) {
    this._template = template;
    this._bindings = bindings;
    this._protoElementInjectors = protoElementInjectors;

    // not implemented
    this._protoWatchGroup = protoWatchGroup;
    this._useRootElement = useRootElement;
  }

  instantiate():View {
    var fragment = DOM.clone(this._template.content);
    var elements = DOM.querySelectorAll(fragment, ".ng-binding");
    var protos = this._protoElementInjectors;

    /**
     * TODO: vsavkin: benchmark
     * If this performs poorly, the three loops can be collapsed into one.
     */
    var elementInjectors = ProtoView._createElementInjectors(elements, protos);
    var rootElementInjectors = ProtoView._rootElementInjectors(elementInjectors);
    var textNodes = ProtoView._textNodes(elements, protos);
    var bindElements = ProtoView._bindElements(elements, protos);

    return new View(fragment, elementInjectors, rootElementInjectors, textNodes,
        bindElements);
  }

  static _createElementInjectors(elements, protos) {
    var injectors = ListWrapper.createFixedSize(protos.length);
    for (var i = 0; i < protos.length; ++i) {
      injectors[i] = ProtoView._createElementInjector(elements[i], protos[i]);
    }
    // Cannot be rolled into loop above, because parentInjector pointers need
    // to be set on the children.
    for (var i = 0; i < protos.length; ++i) {
      protos[i].clearElementInjector();
    }
    return injectors;
  }

  static _createElementInjector(element, proto) {
    //TODO: vsavkin: pass element to `proto.instantiate()` once https://github.com/angular/angular/pull/98 is merged
    return proto.hasBindings ? proto.instantiate({view:null}) : null;
  }

  static _rootElementInjectors(injectors) {
    return ListWrapper.filter(injectors, inj => isPresent(inj) && isBlank(inj.parent));
  }

  static _textNodes(elements, protos) {
    var textNodes = [];
    for (var i = 0; i < protos.length; ++i) {
      ProtoView._collectTextNodes(textNodes, elements[i],
          protos[i].textNodeIndices);
    }
    return textNodes;
  }

  static _bindElements(elements, protos):List<Element> {
    var bindElements = [];
    for (var i = 0; i < protos.length; ++i) {
      if (protos[i].hasElementPropertyBindings) ListWrapper.push(
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
