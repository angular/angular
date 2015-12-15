library angular2.src.platform.dom.debug.debug_element_view_listener;

import "package:angular2/src/facade/lang.dart"
    show isPresent, NumberWrapper, StringWrapper;
import "package:angular2/src/facade/collection.dart"
    show MapWrapper, Map, ListWrapper;
import "package:angular2/src/core/di.dart" show Injectable, provide, Provider;
import "package:angular2/src/core/linker/view_listener.dart"
    show AppViewListener;
import "package:angular2/src/core/linker/view.dart" show AppView;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/render/api.dart" show Renderer;
import "package:angular2/src/core/debug/debug_element.dart"
    show DebugElement, DebugElement_;

const NG_ID_PROPERTY = "ngid";
const INSPECT_GLOBAL_NAME = "ng.probe";
const NG_ID_SEPARATOR = "#";
// Need to keep the views in a global Map so that multiple angular apps are supported
var _allIdsByView = new Map<AppView, num>();
var _allViewsById = new Map<num, AppView>();
var _nextId = 0;
_setElementId(element, List<num> indices) {
  if (isPresent(element) && DOM.isElementNode(element)) {
    DOM.setData(element, NG_ID_PROPERTY, indices.join(NG_ID_SEPARATOR));
  }
}

List<num> _getElementId(element) {
  var elId = DOM.getData(element, NG_ID_PROPERTY);
  if (isPresent(elId)) {
    return elId
        .split(NG_ID_SEPARATOR)
        .map((partStr) => NumberWrapper.parseInt(partStr, 10))
        .toList();
  } else {
    return null;
  }
}

/**
 * Returns a [DebugElement] for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
DebugElement inspectNativeElement(element) {
  var elId = _getElementId(element);
  if (isPresent(elId)) {
    var view = _allViewsById[elId[0]];
    if (isPresent(view)) {
      return new DebugElement_(view, elId[1]);
    }
  }
  return null;
}

@Injectable()
class DebugElementViewListener implements AppViewListener {
  Renderer _renderer;
  DebugElementViewListener(this._renderer) {
    DOM.setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  }
  onViewCreated(AppView view) {
    var viewId = _nextId++;
    _allViewsById[viewId] = view;
    _allIdsByView[view] = viewId;
    for (var i = 0; i < view.elementRefs.length; i++) {
      var el = view.elementRefs[i];
      _setElementId(this._renderer.getNativeElementSync(el), [viewId, i]);
    }
  }

  onViewDestroyed(AppView view) {
    var viewId = _allIdsByView[view];
    (_allIdsByView.containsKey(view) &&
        (_allIdsByView.remove(view) != null || true));
    (_allViewsById.containsKey(viewId) &&
        (_allViewsById.remove(viewId) != null || true));
  }
}

/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 *
 * ## Example
 *
 * {@example platform/dom/debug/ts/debug_element_view_listener/providers.ts region='providers'}
 */
const List<dynamic> ELEMENT_PROBE_PROVIDERS = const [
  DebugElementViewListener,
  const Provider(AppViewListener, useExisting: DebugElementViewListener)
];
/**
 * Use [ELEMENT_PROBE_PROVIDERS].
 *
 * @deprecated
 */
const ELEMENT_PROBE_BINDINGS = ELEMENT_PROBE_PROVIDERS;
