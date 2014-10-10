import {DOM, Element, Node, Text, DocumentFragment, TemplateElement} from 'facade/dom';
import {ListWrapper} from 'facade/collection';
import {ProtoWatchGroup, WatchGroup, WatchGroupDispatcher} from 'change_detection/watch_group';
import {Record} from 'change_detection/record';
import {Module} from 'di/di';
import {ProtoElementInjector, ElementInjector} from './element_injector';
import {SetterFn} from 'change_detection/facade';
import {FIELD, IMPLEMENTS, int} from 'facade/lang';
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
  constructor(fragment:DocumentFragment) {
    this.fragment = fragment;
    this.nodes = ListWrapper.clone(fragment.childNodes);
    this.onChangeDispatcher = null;
    this.elementInjectors = null;
    this.textNodes = null;
    this.bindElements = null;
  }

  onRecordChange(record:Record, target) {
    // dispatch to element injector or text nodes based on context
    if (target instanceof DirectivePropertyMemento) {
      // we know that it is DirectivePropertyMemento
      var directiveMemento:DirectivePropertyMemento = target;
      directiveMemento.invoke(record, this.elementInjectors);
    } else if (target instanceof  ElementPropertyMemento) {
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
  @FIELD('final _module:Module')
  @FIELD('final _protoElementInjectors:List<ProtoElementInjector>')
  @FIELD('final _protoWatchGroup:ProtoWatchGroup')
  @FIELD('final _useRootElement:bool')
  constructor(
      template:TemplateElement,
      module:Module,
      protoElementInjector:List<ProtoElementInjector>,
      protoWatchGroup:ProtoWatchGroup,
      useRootElement:boolean)
  {
    this._template = template;
    this._module = module;
    this._protoElementInjectors = protoElementInjector;
    this._protoWatchGroup = protoWatchGroup;
    this._useRootElement = useRootElement;
  }

  instantiate():View {
    return new View(DOM.clone(this._template.content));
  }
}

export class ElementPropertyMemento {
  @FIELD('final _elementIndex:int')
  @FIELD('final _propertyIndex:string')
  constructor(elementIndex:int, propertyName:string) {
    this._elementIndex = elementIndex;
    this._propertyName = propertyName;
  }

  invoke(record:Record, elementInjectors:List<Element>) {
    var element:Element = elementInjectors[this._elementIndex];
    DOM.setProperty(element, this._propertyName, record.currentValue);
  }
}

export class DirectivePropertyMemento {
  @FIELD('final _elementInjectorIndex:int')
  @FIELD('final _directiveIndex:int')
  @FIELD('final _setterName:String')
  @FIELD('final _setter:SetterFn')
  constructor(
      elementInjectorIndex:number,
      directiveIndex:number,
      setterName:String,
      setter:SetterFn)
  {
    this._elementInjectorIndex = elementInjectorIndex;
    this._directiveIndex = directiveIndex;
    this._setterName = setterName;
    this._setter = setter;
  }

  invoke(record:Record, elementInjectors:List<ElementInjector>) {
    var elementInjector:ElementInjector = elementInjectors[this._elementInjectorIndex];
    var directive = elementInjectors[this._directiveIndex];
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
