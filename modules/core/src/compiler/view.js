import {DOM, Node, DocumentFragment, TemplateElement} from 'facade/dom';
import {ListWrapper wraps List} from 'facade/collection';
import {ProtoWatchGroup, WatchGroup, WatchGroupDispatcher} from 'change_detection/watch_group';
import {Record} from 'change_detection/record';
import {Module} from 'di/di';
import {ProtoElementInjector, ElementInjector} from './element_injector';
import {SetterFn} from 'change_detection/facade';

export class ProtoView {
  @FIELD('final _template:TemplateElement')
  @FIELD('final _module:Module')
  @FIELD('final _protoElementInjectors:List<ProtoElementInjector>')
  @FIELD('final _protoWatchGroup:ProtoWatchGroup')
  constructor(
      template:TemplateElement,
      module:Module,
      protoElementInjector:ProtoElementInjector,
      protoWatchGroup:ProtoWatchGroup)
  {
    this._template = template;
    this._module = module;
    this._protoElementInjectors = protoElementInjector;
    this._protoWatchGroup = protoWatchGroup;
  }
}

@IMPLEMENTS(WatchGroupDispatcher)
export class View {
  @FIELD('final _fragment:DocumentFragment')
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  @FIELD('final _rootElementInjectors:List<ElementInjector>')
  @FIELD('final _elementInjectors:List<ElementInjector>')
  @FIELD('final _textNodes:List<Text>')
  @FIELD('final _watchGroup:WatchGroup')
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  @FIELD('final _nodes:List<Node>')
  @FIELD('final _onChangeDispatcher:OnChangeDispatcher')
  constructor(fragment:DocumentFragment) {
    this._fragment = fragment;
    this._nodes = ListWrapper.clone(fragment.childNodes);
    this._onChangeDispatcher = null;
    this._elementInjectors = null;
    this._textNodes = null;
  }

  onRecordChange(record:Record, target) {
    // dispatch to element injector or text nodes based on context
    if (target instanceof ElementInjectorTarget) {
      // we know that it is ElementInjectorTarget
      var eTarget:ElementInjectorTarget = target;
      this._onChangeDispatcher.notify(this, eTarget);
      eTarget.invoke(record, this._elementInjectors);
    } else {
      // we know it refferst to _textNodes.
      var textNodeIndex:number = target;
      DOM.setText(this._textNodes[textNodeIndex], record.currentValue);
    }
  }
}


export class ElementInjectorTarget {
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
  @FIELD('_lastTarget:ElementInjectorTarget')
  constructor() {
    this._lastView = null;
    this._lastTarget = null;
  }

  notify(view:View, eTarget:ElementInjectorTarget) {

  }

  done() {

  }
}
