import {
  CONST_EXPR,
  isPresent,
  NumberWrapper,
  StringWrapper,
  RegExpWrapper
} from 'angular2/src/facade/lang';
import {MapWrapper, Map, ListWrapper, List} from 'angular2/src/facade/collection';
import {Injectable, bind, Binding} from 'angular2/di';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {AppView} from 'angular2/src/core/compiler/view';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';
import {DebugElement} from './debug_element';

const NG_ID_PROPERTY = 'ngid';
const INSPECT_GLOBAL_NAME = 'ngProbe';

var NG_ID_SEPARATOR_RE = RegExpWrapper.create('#');
var NG_ID_SEPARATOR = '#';

// Need to keep the views in a global Map so that multiple angular apps are supported
var _allIdsByView: Map<AppView, number> = CONST_EXPR(MapWrapper.create());
var _allViewsById: Map<number, AppView> = CONST_EXPR(MapWrapper.create());
var _nextId = 0;

function _setElementId(element, indices: List<number>) {
  if (isPresent(element)) {
    DOM.setData(element, NG_ID_PROPERTY, ListWrapper.join(indices, NG_ID_SEPARATOR));
  }
}

function _getElementId(element): List<number> {
  var elId = DOM.getData(element, NG_ID_PROPERTY);
  if (isPresent(elId)) {
    return ListWrapper.map(StringWrapper.split(elId, NG_ID_SEPARATOR_RE),
                           (partStr) => NumberWrapper.parseInt(partStr, 10));
  } else {
    return null;
  }
}

export function inspectDomElement(element): DebugElement {
  var elId = _getElementId(element);
  if (isPresent(elId)) {
    var view = MapWrapper.get(_allViewsById, elId[0]);
    if (isPresent(view)) {
      return new DebugElement(view, elId[1]);
    }
  }
  return null;
}

@Injectable()
export class DebugElementViewListener implements AppViewListener {
  constructor() { DOM.setGlobalVar(INSPECT_GLOBAL_NAME, inspectDomElement); }

  viewCreated(view: AppView) {
    var viewId = _nextId++;
    MapWrapper.set(_allViewsById, viewId, view);
    MapWrapper.set(_allIdsByView, view, viewId);
    var renderView = resolveInternalDomView(view.render);
    for (var i = 0; i < renderView.boundElements.length; i++) {
      _setElementId(renderView.boundElements[i].element, [viewId, i]);
    }
  }

  viewDestroyed(view: AppView) {
    var viewId = MapWrapper.get(_allIdsByView, view);
    MapWrapper.delete(_allIdsByView, view);
    MapWrapper.delete(_allViewsById, viewId);
  }
}

export var ELEMENT_PROBE_CONFIG = [
  DebugElementViewListener,
  bind(AppViewListener).toAlias(DebugElementViewListener),
];
