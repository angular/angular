import {CONST_EXPR, isPresent, NumberWrapper, StringWrapper} from 'angular2/src/core/facade/lang';
import {MapWrapper, Map, ListWrapper} from 'angular2/src/core/facade/collection';
import {Injectable, bind, Binding} from 'angular2/di';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {AppView} from 'angular2/src/core/compiler/view';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Renderer} from 'angular2/src/core/render/api';
import {DebugElement} from './debug_element';

const NG_ID_PROPERTY = 'ngid';
const INSPECT_GLOBAL_NAME = 'ng.probe';

const NG_ID_SEPARATOR = '#';

// Need to keep the views in a global Map so that multiple angular apps are supported
var _allIdsByView = new Map<AppView, number>();
var _allViewsById = new Map<number, AppView>();

var _nextId = 0;

function _setElementId(element, indices: number[]) {
  if (isPresent(element)) {
    DOM.setData(element, NG_ID_PROPERTY, ListWrapper.join(indices, NG_ID_SEPARATOR));
  }
}

function _getElementId(element): number[] {
  var elId = DOM.getData(element, NG_ID_PROPERTY);
  if (isPresent(elId)) {
    return ListWrapper.map(elId.split(NG_ID_SEPARATOR),
                           (partStr) => NumberWrapper.parseInt(partStr, 10));
  } else {
    return null;
  }
}

export function inspectNativeElement(element): DebugElement {
  var elId = _getElementId(element);
  if (isPresent(elId)) {
    var view = _allViewsById.get(elId[0]);
    if (isPresent(view)) {
      return new DebugElement(view, elId[1]);
    }
  }
  return null;
}

@Injectable()
export class DebugElementViewListener implements AppViewListener {
  constructor(private _renderer: Renderer) {
    DOM.setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  }

  viewCreated(view: AppView) {
    var viewId = _nextId++;
    _allViewsById.set(viewId, view);
    _allIdsByView.set(view, viewId);
    for (var i = 0; i < view.elementRefs.length; i++) {
      var el = view.elementRefs[i];
      _setElementId(this._renderer.getNativeElementSync(el), [viewId, i]);
    }
  }

  viewDestroyed(view: AppView) {
    var viewId = _allIdsByView.get(view);
    MapWrapper.delete(_allIdsByView, view);
    MapWrapper.delete(_allViewsById, viewId);
  }
}

export const ELEMENT_PROBE_BINDINGS = CONST_EXPR([
  DebugElementViewListener,
  CONST_EXPR(new Binding(AppViewListener, {toAlias: DebugElementViewListener})),
]);
