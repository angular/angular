import {Promise} from 'angular2/src/facade/async';

import {DOM} from 'angular2/src/dom/dom_adapter';

import * as viewModule from '../view/view';

import {LightDom} from './light_dom';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {StyleUrlResolver} from './style_url_resolver';
import {moveViewNodesIntoParent} from './util';
import {insertSharedStyleText} from './util';

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
  styleUrlResolver: StyleUrlResolver;
  styleHost;

  constructor(styleUrlResolver: StyleUrlResolver, styleHost) {
    super();
    this.styleUrlResolver = styleUrlResolver;
    this.styleHost = styleHost;
  }

  hasNativeContentElement():boolean {
    return false;
  }

  attachTemplate(el, view:viewModule.RenderView) {
    moveViewNodesIntoParent(el, view);
  }

  constructLightDom(lightDomView:viewModule.RenderView, shadowDomView:viewModule.RenderView, el): LightDom {
    return new LightDom(lightDomView, shadowDomView, el);
  }

  processStyleElement(hostComponentId:string, templateUrl:string, styleEl):Promise {
    var cssText = DOM.getText(styleEl);
    cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
    DOM.setText(styleEl, cssText);
    DOM.remove(styleEl);

    insertSharedStyleText(cssText, this.styleHost, styleEl);
    return null;
  }
}
