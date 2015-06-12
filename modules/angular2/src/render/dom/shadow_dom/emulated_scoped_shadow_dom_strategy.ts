import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {EmulatedUnscopedShadowDomStrategy} from './emulated_unscoped_shadow_dom_strategy';
import {
  getContentAttribute,
  getHostAttribute,
  getComponentId,
  shimCssForComponent,
  insertStyleElement
} from './util';

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
  constructor(public styleInliner: StyleInliner, styleUrlResolver: StyleUrlResolver, styleHost) {
    super(styleUrlResolver, styleHost);
  }

  processStyleElement(hostComponentId: string, templateUrl: string, styleEl): Promise<any> {
    var cssText = DOM.getText(styleEl);

    cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
    var inlinedCss = this.styleInliner.inlineImports(cssText, templateUrl);

    if (PromiseWrapper.isPromise(inlinedCss)) {
      DOM.setText(styleEl, '');
      return (<Promise<string>>inlinedCss)
          .then((css) => {
            css = shimCssForComponent(css, hostComponentId);
            DOM.setText(styleEl, css);
            this._moveToStyleHost(styleEl);
          });
    } else {
      var css = shimCssForComponent(<string>inlinedCss, hostComponentId);
      DOM.setText(styleEl, css);
      this._moveToStyleHost(styleEl);
      return null;
    }
  }

  _moveToStyleHost(styleEl) {
    DOM.remove(styleEl);
    insertStyleElement(this.styleHost, styleEl);
  }

  processElement(hostComponentId: string, elementComponentId: string, element) {
    // Shim the element as a child of the compiled component
    if (isPresent(hostComponentId)) {
      var contentAttribute = getContentAttribute(getComponentId(hostComponentId));
      DOM.setAttribute(element, contentAttribute, '');
    }
    // If the current element is also a component, shim it as a host
    if (isPresent(elementComponentId)) {
      var hostAttribute = getHostAttribute(getComponentId(elementComponentId));
      DOM.setAttribute(element, hostAttribute, '');
    }
  }
}
