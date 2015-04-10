import {Injectable} from 'angular2/di';

import {stringify} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import * as viewModule from './view';
import {LightDom} from './shadow_dom_emulation/light_dom';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';

// temporal import while we migrated the views over
import * as sds from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import * as nsds from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';
import * as eusds from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import * as essds from 'angular2/src/render/dom/shadow_dom/emulated_scoped_shadow_dom_strategy';

/**
 * @publicModule angular2/template
 */
export class ShadowDomStrategy {
  render: sds.ShadowDomStrategy;

  attachTemplate(el, view:viewModule.View) {}
  constructLightDom(lightDomView:viewModule.View, shadowDomView:viewModule.View, el): LightDom { return null; }

  shimAppElement(componentType, insertionElement) {
    this.render.processElement(null, stringify(componentType), insertionElement);
  }
}

/**
 * This strategy emulates the Shadow DOM for the templates, styles **excluded**:
 * - components templates are added as children of their component element,
 * - styles are moved from the templates to the styleHost (i.e. the document head).
 *
 * Notes:
 * - styles are **not** scoped to their component and will apply to the whole document,
 * - you can **not** use shadow DOM specific selectors in the styles
 *
 * @publicModule angular2/template
 */
@Injectable()
export class EmulatedUnscopedShadowDomStrategy extends ShadowDomStrategy {

  constructor(styleUrlResolver: StyleUrlResolver, styleHost) {
    super();
    this.render = new eusds.EmulatedUnscopedShadowDomStrategy(styleUrlResolver, styleHost);
  }

  attachTemplate(el, view:viewModule.View) {
    DOM.clearNodes(el);
    _moveViewNodesIntoParent(el, view);
  }

  constructLightDom(lightDomView:viewModule.View, shadowDomView:viewModule.View, el): LightDom {
    return new LightDom(lightDomView, shadowDomView, el);
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
 *
 * @publicModule angular2/template
 */
@Injectable()
export class EmulatedScopedShadowDomStrategy extends ShadowDomStrategy {

  constructor(styleInliner: StyleInliner, styleUrlResolver: StyleUrlResolver, styleHost) {
    super();
    this.render = new essds.EmulatedScopedShadowDomStrategy(styleInliner, styleUrlResolver, styleHost);
  }

  attachTemplate(el, view:viewModule.View) {
    DOM.clearNodes(el);
    _moveViewNodesIntoParent(el, view);
  }

  constructLightDom(lightDomView:viewModule.View, shadowDomView:viewModule.View, el): LightDom {
    return new LightDom(lightDomView, shadowDomView, el);
  }
}

/**
 * This strategies uses the native Shadow DOM support.
 *
 * The templates for the component are inserted in a Shadow Root created on the component element.
 * Hence they are strictly isolated.
 */
@Injectable()
export class NativeShadowDomStrategy extends ShadowDomStrategy {

  constructor(styleUrlResolver: StyleUrlResolver) {
    super();
    this.render = new nsds.NativeShadowDomStrategy(styleUrlResolver);
  }

  attachTemplate(el, view:viewModule.View){
    _moveViewNodesIntoParent(DOM.createShadowRoot(el), view);
  }
}

function _moveViewNodesIntoParent(parent, view) {
  for (var i = 0; i < view.nodes.length; ++i) {
    DOM.appendChild(parent, view.nodes[i]);
  }
}
