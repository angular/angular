import {Element, DOM} from 'angular2/src/facade/dom';
import {Map, MapWrapper} from 'angular2/src/facade/collection';
import {int, isBlank, Type} from 'angular2/src/facade/lang';

import {ShadowCss} from './shadow_css';

/**
 * Used to shim component CSS & DOM
 */
export class ShimComponent {
  constructor(component: Type) {
  }

  shimCssText(cssText: string): string {
    return null
  }

  shimContentElement(element: Element) {}

  shimHostElement(element: Element) {}
}

/**
 * Native components does not need to the shim.
 *
 * All methods are no-ops.
 */
export class ShimNativeComponent extends ShimComponent {
  constructor(component: Type) {
    super(component);
  };

  shimCssText(cssText: string): string {
    return cssText;
  }

  shimContentElement(element: Element) {
  }

  shimHostElement(element: Element) {
  }
}

var _componentCache: Map<Type, int> = MapWrapper.create();
var _componentId: int = 0;

// Reset the component cache - used for tests only
export function resetShimComponentCache() {
  MapWrapper.clear(_componentCache);
  _componentId = 0;
}

/**
 * Emulated components need to be shimmed:
 * - An attribute needs to be added to the host,
 * - An attribute needs to be added to all nodes in their content,
 * - The CSS needs to be scoped.
 */
export class ShimEmulatedComponent extends ShimComponent {
  _cmpId: int;

  constructor(component: Type) {
    super(component);

    // Generates a unique ID for components
    var componentId = MapWrapper.get(_componentCache, component);
    if (isBlank(componentId)) {
      componentId = _componentId++;
      MapWrapper.set(_componentCache, component, componentId);
    }
    this._cmpId = componentId;
  };

  // Scope the CSS
  shimCssText(cssText: string): string {
    var shadowCss = new ShadowCss();
    return shadowCss.shimCssText(cssText, this._getContentAttribute(), this._getHostAttribute());
  }

  // Add an attribute on a content element
  shimContentElement(element: Element) {
    DOM.setAttribute(element, this._getContentAttribute(), '');
  }

  // Add an attribute to the host
  shimHostElement(element: Element) {
    DOM.setAttribute(element, this._getHostAttribute(), '');
  }

  // Return the attribute to be added to the component
  _getHostAttribute() {
    return `_nghost-${this._cmpId}`;
  }

  // Returns the attribute to be added on every single nodes in the component
  _getContentAttribute() {
    return `_ngcontent-${this._cmpId}`;
  }
}
