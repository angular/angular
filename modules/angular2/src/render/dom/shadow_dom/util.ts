import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {MapWrapper, Map} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {ShadowCss} from './shadow_css';

var _componentUIDs: Map<string, int> = MapWrapper.create();
var _nextComponentUID: int = 0;
var _sharedStyleTexts: Map<string, boolean> = MapWrapper.create();
var _lastInsertedStyleEl;

export function getComponentId(componentStringId: string) {
  var id = MapWrapper.get(_componentUIDs, componentStringId);
  if (isBlank(id)) {
    id = _nextComponentUID++;
    MapWrapper.set(_componentUIDs, componentStringId, id);
  }
  return id;
}

export function insertSharedStyleText(cssText, styleHost, styleEl) {
  if (!MapWrapper.contains(_sharedStyleTexts, cssText)) {
    // Styles are unscoped and shared across components, only append them to the head
    // when there are not present yet
    MapWrapper.set(_sharedStyleTexts, cssText, true);
    insertStyleElement(styleHost, styleEl);
  }
}

export function insertStyleElement(host, styleEl) {
  if (isBlank(_lastInsertedStyleEl)) {
    var firstChild = DOM.firstChild(host);
    if (isPresent(firstChild)) {
      DOM.insertBefore(firstChild, styleEl);
    } else {
      DOM.appendChild(host, styleEl);
    }
  } else {
    DOM.insertAfter(_lastInsertedStyleEl, styleEl);
  }
  _lastInsertedStyleEl = styleEl;
}

// Return the attribute to be added to the component
export function getHostAttribute(id: int) {
  return `_nghost-${id}`;
}

// Returns the attribute to be added on every single element nodes in the component
export function getContentAttribute(id: int) {
  return `_ngcontent-${id}`;
}

export function shimCssForComponent(cssText: string, componentId: string): string {
  var id = getComponentId(componentId);
  var shadowCss = new ShadowCss();
  return shadowCss.shimCssText(cssText, getContentAttribute(id), getHostAttribute(id));
}

// Reset the caches - used for tests only
export function resetShadowDomCache() {
  MapWrapper.clear(_componentUIDs);
  _nextComponentUID = 0;
  MapWrapper.clear(_sharedStyleTexts);
  _lastInsertedStyleEl = null;
}
