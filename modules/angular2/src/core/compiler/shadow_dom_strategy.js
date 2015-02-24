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

export class EmulatedShadowDomStrategy extends ShadowDomStrategy {
  _styleInliner: StyleInliner;
  _styleUrlResolver: StyleUrlResolver;
  _styleHost: Element;
  _lastInsertedStyle: StyleElement;

  constructor(styleInliner: StyleInliner, styleUrlResolver: StyleUrlResolver, styleHost: Element) {
    super();
    this._styleInliner = styleInliner;
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

// Reset the component cache - used for tests only
export function resetShadowDomCache() {
  MapWrapper.clear(_componentUIDs);
  _nextComponentUID = 0;
}
