import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {MapWrapper, Map} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {ShadowCss} from './shadow_css';

var _componentUIDs: Map<string, int> = new Map();
var _nextComponentUID: int = 0;
var _sharedStyleTexts: Map<string, boolean> = new Map();
var _lastInsertedStyleEl;

export function getComponentId(componentStringId: string): number {
  var id = _componentUIDs.get(componentStringId);
  if (isBlank(id)) {
    id = _nextComponentUID++;
    _componentUIDs.set(componentStringId, id);
  }
  return id;
}

export function insertSharedStyleText(cssText, styleHost, styleEl) {
  if (!_sharedStyleTexts.has(cssText)) {
    // Styles are unscoped and shared across components, only append them to the head
    // when there are not present yet
    _sharedStyleTexts.set(cssText, true);
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
export function getHostAttribute(id: int): string {
  return `_nghost-${id}`;
}

// Returns the attribute to be added on every single element nodes in the component
export function getContentAttribute(id: int): string {
  return `_ngcontent-${id}`;
}

export function shimCssForComponent(cssText: string, componentId: string): string {
  var id = getComponentId(componentId);
  var shadowCss = new ShadowCss();
  return shadowCss.shimCssText(cssText, getContentAttribute(id), getHostAttribute(id));
}

// Reset the caches - used for tests only
export function resetShadowDomCache() {
  _componentUIDs.clear();
  _nextComponentUID = 0;
  _sharedStyleTexts.clear();
  _lastInsertedStyleEl = null;
}
