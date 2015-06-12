import {Promise} from 'angular2/src/facade/async';

import {DOM} from 'angular2/src/dom/dom_adapter';

import * as viewModule from '../view/view';

import {LightDom} from './light_dom';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {StyleUrlResolver} from './style_url_resolver';
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
  constructor(public styleUrlResolver: StyleUrlResolver, public styleHost) { super(); }

  hasNativeContentElement(): boolean { return false; }

  prepareShadowRoot(el) { return el; }

  constructLightDom(lightDomView: viewModule.DomView, el): LightDom {
    return new LightDom(lightDomView, el);
  }

  processStyleElement(hostComponentId: string, templateUrl: string, styleEl): Promise<any> {
    var cssText = DOM.getText(styleEl);
    cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
    DOM.setText(styleEl, cssText);
    DOM.remove(styleEl);

    insertSharedStyleText(cssText, this.styleHost, styleEl);
    return null;
  }
}
