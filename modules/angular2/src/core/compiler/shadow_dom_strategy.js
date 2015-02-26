import {Type, isBlank, isPresent, int} from 'angular2/src/facade/lang';
import {DOM, Element, StyleElement} from 'angular2/src/facade/dom';
import {List, ListWrapper, MapWrapper, Map} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/async';

import {View} from './view';

import {Content} from './shadow_dom_emulation/content_tag';
import {LightDom} from './shadow_dom_emulation/light_dom';
import {ShadowCss} from './shadow_dom_emulation/shadow_css';

import {StyleInliner} from './style_inliner';
import {StyleUrlResolver} from './style_url_resolver';

export class ShadowDomStrategy {
  attachTemplate(el:Element, view:View) {}
  constructLightDom(lightDomView:View, shadowDomView:View, el:Element) {}
  polyfillDirectives():List<Type> { return null; }
  // TODO(vicb): union types: return either a string or a Promise<string>
  transformStyleText(cssText: string, baseUrl: string, component: Type) {}
  handleStyleElement(styleEl: StyleElement) {};
  shimContentElement(component: Type, element: Element) {}
  shimHostElement(component: Type, element: Element) {}
}

/**
 * This strategy emulates the Shadow DOM for the templates, styles **excluded**:
 * - components templates are added as children of their component element,
 * - styles are moved from the templates to the styleHost (i.e. the document head).
 *
 * Notes:
 * - styles are **not** scoped to their component and will apply to the whole document,
 * - you can **not** use shadow DOM specific selectors in the styles
 */
export class EmulatedUnscopedShadowDomStrategy extends ShadowDomStrategy {
  _styleUrlResolver: StyleUrlResolver;
  _lastInsertedStyle: StyleElement;
  _styleHost: Element;

  constructor(styleUrlResolver: StyleUrlResolver, styleHost: Element) {
    super();
    this._styleUrlResolver = styleUrlResolver;
    this._styleHost = styleHost;
  }

  attachTemplate(el:Element, view:View){
    DOM.clearNodes(el);
    _moveViewNodesIntoParent(el, view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return new LightDom(lightDomView, shadowDomView, el);
  }

  polyfillDirectives():List<Type> {
    return [Content];
  }

  transformStyleText(cssText: string, baseUrl: string, component: Type) {
    return this._styleUrlResolver.resolveUrls(cssText, baseUrl);
  }

  handleStyleElement(styleEl: StyleElement) {
    DOM.remove(styleEl);

    var cssText = DOM.getText(styleEl);

    if (!MapWrapper.contains(_sharedStyleTexts, cssText)) {
      // Styles are unscoped and shared across components, only append them to the head
      // when there are not present yet
      MapWrapper.set(_sharedStyleTexts, cssText, true);
      this._insertStyleElement(this._styleHost, styleEl);
    }
  };

  _insertStyleElement(host: Element, style: StyleElement) {
    if (isBlank(this._lastInsertedStyle)) {
      var firstChild = DOM.firstChild(host);
      if (isPresent(firstChild)) {
        DOM.insertBefore(firstChild, style);
      } else {
        DOM.appendChild(host, style);
      }
    } else {
      DOM.insertAfter(this._lastInsertedStyle, style);
    }
    this._lastInsertedStyle = style;
  }
}

/**
 * This strategy emulates the Shadow DOM for the templates, styles **included**:
 * - components templates are added as children of their component element,
 * - both the template and the styles are modified so that styles are scoped to the component
 *   they belong to,
 * - styles are moved from the templates to the styleHost (i.e. the document head).
 *
 * Notes:
 * - styles are scoped to their component and will apply only to it,
 * - a common subset of shadow DOM selectors are supported,
 * - see `ShadowCss` for more information and limitations.
 */
export class EmulatedScopedShadowDomStrategy extends EmulatedUnscopedShadowDomStrategy {
  _styleInliner: StyleInliner;

  constructor(styleInliner: StyleInliner, styleUrlResolver: StyleUrlResolver, styleHost: Element) {
    super(styleUrlResolver, styleHost);
    this._styleInliner = styleInliner;
  }

  transformStyleText(cssText: string, baseUrl: string, component: Type) {
    cssText = this._styleUrlResolver.resolveUrls(cssText, baseUrl);
    var css = this._styleInliner.inlineImports(cssText, baseUrl);
    if (PromiseWrapper.isPromise(css)) {
      return css.then((css) => _shimCssForComponent(css, component));
    } else {
      return _shimCssForComponent(css, component);
    }
  }

  handleStyleElement(styleEl: StyleElement) {
    DOM.remove(styleEl);
    this._insertStyleElement(this._styleHost, styleEl);
  };

  shimContentElement(component: Type, element: Element) {
    var id = _getComponentId(component);
    var attrName = _getContentAttribute(id);
    DOM.setAttribute(element, attrName, '');
  }

  shimHostElement(component: Type, element: Element) {
    var id = _getComponentId(component);
    var attrName = _getHostAttribute(id);
    DOM.setAttribute(element, attrName, '');
  }
}

/**
 * This strategies uses the native Shadow DOM support.
 *
 * The templates for the component are inserted in a Shadow Root created on the component element.
 * Hence they are strictly isolated.
 */
export class NativeShadowDomStrategy extends ShadowDomStrategy {
  _styleUrlResolver: StyleUrlResolver;

  constructor(styleUrlResolver: StyleUrlResolver) {
    super();
    this._styleUrlResolver = styleUrlResolver;
  }

  attachTemplate(el:Element, view:View){
    _moveViewNodesIntoParent(DOM.createShadowRoot(el), view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return null;
  }

  polyfillDirectives():List<Type> {
    return [];
  }

  transformStyleText(cssText: string, baseUrl: string, component: Type) {
    return this._styleUrlResolver.resolveUrls(cssText, baseUrl);
  }
}

function _moveViewNodesIntoParent(parent, view) {
  for (var i = 0; i < view.nodes.length; ++i) {
    DOM.appendChild(parent, view.nodes[i]);
  }
}

var _componentUIDs: Map<Type, int> = MapWrapper.create();
var _nextComponentUID: int = 0;
var _sharedStyleTexts: Map<string, boolean> = MapWrapper.create();

function _getComponentId(component: Type) {
  var id = MapWrapper.get(_componentUIDs, component);
  if (isBlank(id)) {
    id = _nextComponentUID++;
    MapWrapper.set(_componentUIDs, component, id);
  }
  return id;
}

// Return the attribute to be added to the component
function _getHostAttribute(id: int) {
  return `_nghost-${id}`;
}

// Returns the attribute to be added on every single nodes in the component
function _getContentAttribute(id: int) {
  return `_ngcontent-${id}`;
}

function _shimCssForComponent(cssText: string, component: Type): string {
  var id = _getComponentId(component);
  var shadowCss = new ShadowCss();
  return shadowCss.shimCssText(cssText, _getContentAttribute(id), _getHostAttribute(id));
}

// Reset the caches - used for tests only
export function resetShadowDomCache() {
  MapWrapper.clear(_componentUIDs);
  _nextComponentUID = 0;
  MapWrapper.clear(_sharedStyleTexts);
}
