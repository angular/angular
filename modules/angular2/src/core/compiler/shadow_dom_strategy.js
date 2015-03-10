import {Type, isBlank, isPresent, int} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, Map} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/async';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {View} from './view';

import {Content} from './shadow_dom_emulation/content_tag';
import {LightDom} from './shadow_dom_emulation/light_dom';
import {ShadowCss} from './shadow_dom_emulation/shadow_css';

import {StyleInliner} from './style_inliner';
import {StyleUrlResolver} from './style_url_resolver';

import {DirectiveMetadata} from './directive_metadata';

import * as NS from './pipeline/compile_step';
import {CompileElement} from './pipeline/compile_element';
import {CompileControl} from './pipeline/compile_control';

export class ShadowDomStrategy {
  attachTemplate(el, view:View) {}
  constructLightDom(lightDomView:View, shadowDomView:View, el): LightDom { return null; }
  polyfillDirectives():List<Type> { return []; }

  /**
   * An optional step that can modify the template style elements.
   *
   * @param {DirectiveMetadata} cmpMetadata
   * @param {string} templateUrl the template base URL
   * @returns {CompileStep} a compile step to append to the compiler pipeline, null if not required.
   */
  getStyleCompileStep(cmpMetadata: DirectiveMetadata, templateUrl: string): NS.CompileStep {
    return null;
  }

  /**
   * An optional step that can modify the template elements (style elements exlcuded).
   *
   * This step could be used to modify the template in order to scope the styles.
   *
   * @param {DirectiveMetadata} cmpMetadata
   * @returns {CompileStep} a compile step to append to the compiler pipeline, null if not required.
   */
  getTemplateCompileStep(cmpMetadata: DirectiveMetadata): NS.CompileStep { return null; }

  /**
   * The application element does not go through the compiler pipeline.
   *
   * This methods is called when the root ProtoView is created and to optionnaly update the
   * application root element.
   *
   * @see ProtoView.createRootProtoView
   *
   * @param {DirectiveMetadata} cmpMetadata
   * @param element
   */
  shimAppElement(cmpMetadata: DirectiveMetadata, element) {}
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
  _styleHost;

  constructor(styleUrlResolver: StyleUrlResolver, styleHost) {
    super();
    this._styleUrlResolver = styleUrlResolver;
    this._styleHost = styleHost;
  }

  attachTemplate(el, view:View){
    DOM.clearNodes(el);
    _moveViewNodesIntoParent(el, view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el): LightDom {
    return new LightDom(lightDomView, shadowDomView, el);
  }

  polyfillDirectives():List<Type> {
    return [Content];
  }

  getStyleCompileStep(cmpMetadata: DirectiveMetadata, templateUrl: string): NS.CompileStep {
    return new _EmulatedUnscopedCssStep(cmpMetadata, templateUrl, this._styleUrlResolver,
      this._styleHost);
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

  constructor(styleInliner: StyleInliner, styleUrlResolver: StyleUrlResolver, styleHost) {
    super(styleUrlResolver, styleHost);
    this._styleInliner = styleInliner;
  }

  getStyleCompileStep(cmpMetadata: DirectiveMetadata, templateUrl: string): NS.CompileStep {
    return new _EmulatedScopedCssStep(cmpMetadata, templateUrl, this._styleInliner,
      this._styleUrlResolver, this._styleHost);
  }

  getTemplateCompileStep(cmpMetadata: DirectiveMetadata): NS.CompileStep {
    return new _ShimShadowDomStep(cmpMetadata);
  }

  shimAppElement(cmpMetadata: DirectiveMetadata, element) {
    var cmpType = cmpMetadata.type;
    var hostAttribute = _getHostAttribute(_getComponentId(cmpType));
    DOM.setAttribute(element, hostAttribute, '');
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

  attachTemplate(el, view:View){
    _moveViewNodesIntoParent(DOM.createShadowRoot(el), view);
  }

  getStyleCompileStep(cmpMetadata: DirectiveMetadata, templateUrl: string): NS.CompileStep {
    return new _NativeCssStep(templateUrl, this._styleUrlResolver);
  }
}

class _ShimShadowDomStep extends NS.CompileStep {
  _contentAttribute: string;

  constructor(cmpMetadata: DirectiveMetadata) {
    super();
    var id = _getComponentId(cmpMetadata.type);
    this._contentAttribute = _getContentAttribute(id);
  }


  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (current.ignoreBindings) {
      return;
    }

    // Shim the element as a child of the compiled component
    DOM.setAttribute(current.element, this._contentAttribute, '');

    // If the current element is also a component, shim it as a host
    var host = current.componentDirective;
    if (isPresent(host)) {
      var hostId = _getComponentId(host.type);
      var hostAttribute = _getHostAttribute(hostId);
      DOM.setAttribute(current.element, hostAttribute, '');
    }
  }
}

class _EmulatedUnscopedCssStep extends NS.CompileStep {
  _templateUrl: string;
  _styleUrlResolver: StyleUrlResolver;
  _styleHost;

  constructor(cmpMetadata: DirectiveMetadata, templateUrl: string,
    styleUrlResolver: StyleUrlResolver, styleHost) {
    super();
    this._templateUrl = templateUrl;
    this._styleUrlResolver = styleUrlResolver;
    this._styleHost = styleHost;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var styleEl = current.element;
    var cssText = DOM.getText(styleEl);
    cssText = this._styleUrlResolver.resolveUrls(cssText, this._templateUrl);
    DOM.setText(styleEl, cssText);
    DOM.remove(styleEl);

    if (!MapWrapper.contains(_sharedStyleTexts, cssText)) {
      // Styles are unscoped and shared across components, only append them to the head
      // when there are not present yet
      MapWrapper.set(_sharedStyleTexts, cssText, true);
      _insertStyleElement(this._styleHost, styleEl);
    }
  }
}

class _EmulatedScopedCssStep extends NS.CompileStep {
  _templateUrl: string;
  _component: Type;
  _styleInliner: StyleInliner;
  _styleUrlResolver: StyleUrlResolver;
  _styleHost;

  constructor(cmpMetadata: DirectiveMetadata, templateUrl: string, styleInliner: StyleInliner,
    styleUrlResolver: StyleUrlResolver, styleHost) {
    super();
    this._templateUrl = templateUrl;
    this._component = cmpMetadata.type;
    this._styleInliner = styleInliner;
    this._styleUrlResolver = styleUrlResolver;
    this._styleHost = styleHost;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var styleEl = current.element;

    var cssText = DOM.getText(styleEl);

    cssText = this._styleUrlResolver.resolveUrls(cssText, this._templateUrl);
    var css = this._styleInliner.inlineImports(cssText, this._templateUrl);

    if (PromiseWrapper.isPromise(css)) {
      DOM.setText(styleEl, '');
      ListWrapper.push(parent.inheritedProtoView.stylePromises, css);
      return css.then((css) => {
        css = _shimCssForComponent(css, this._component);
        DOM.setText(styleEl, css);
      });
    } else {
      css = _shimCssForComponent(css, this._component);
      DOM.setText(styleEl, css);
    }

    DOM.remove(styleEl);
    _insertStyleElement(this._styleHost, styleEl);
  }
}

class _NativeCssStep extends NS.CompileStep {
  _styleUrlResolver: StyleUrlResolver;
  _templateUrl: string;

  constructor(templateUrl: string, styleUrlResover: StyleUrlResolver) {
    super();
    this._styleUrlResolver = styleUrlResover;
    this._templateUrl = templateUrl;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var styleEl = current.element;
    var cssText = DOM.getText(styleEl);
    cssText = this._styleUrlResolver.resolveUrls(cssText, this._templateUrl);
    DOM.setText(styleEl, cssText);
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
var _lastInsertedStyleEl;

function _getComponentId(component: Type) {
  var id = MapWrapper.get(_componentUIDs, component);
  if (isBlank(id)) {
    id = _nextComponentUID++;
    MapWrapper.set(_componentUIDs, component, id);
  }
  return id;
}

function _insertStyleElement(host, styleEl) {
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
function _getHostAttribute(id: int) {
  return `_nghost-${id}`;
}

// Returns the attribute to be added on every single element nodes in the component
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
  _lastInsertedStyleEl = null;
}
