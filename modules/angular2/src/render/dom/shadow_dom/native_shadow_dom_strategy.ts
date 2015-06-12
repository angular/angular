import {Promise} from 'angular2/src/facade/async';
import {Injectable} from 'angular2/di';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {StyleUrlResolver} from './style_url_resolver';
import {ShadowDomStrategy} from './shadow_dom_strategy';

/**
 * This strategies uses the native Shadow DOM support.
 *
 * The templates for the component are inserted in a Shadow Root created on the component element.
 * Hence they are strictly isolated.
 */
@Injectable()
export class NativeShadowDomStrategy extends ShadowDomStrategy {
  constructor(public styleUrlResolver: StyleUrlResolver) { super(); }

  prepareShadowRoot(el) { return DOM.createShadowRoot(el); }

  processStyleElement(hostComponentId: string, templateUrl: string, styleEl): Promise<any> {
    var cssText = DOM.getText(styleEl);
    cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
    DOM.setText(styleEl, cssText);
    return null;
  }
}
