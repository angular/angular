import {isPromise} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {Injectable} from 'angular2/di';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {StyleUrlResolver} from './style_url_resolver';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';

/**
 * This strategies uses the native Shadow DOM support.
 *
 * The templates for the component are inserted in a Shadow Root created on the component element.
 * Hence they are strictly isolated.
 */
@Injectable()
export class NativeShadowDomStrategy extends ShadowDomStrategy {
  constructor(public styleInliner: StyleInliner, public styleUrlResolver: StyleUrlResolver) {
    super();
  }

  prepareShadowRoot(el) { return DOM.createShadowRoot(el); }

  processStyleElement(hostComponentId: string, templateUrl: string, styleEl): Promise<any> {
    var cssText = DOM.getText(styleEl);

    cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
    var inlinedCss = this.styleInliner.inlineImports(cssText, templateUrl);

    if (isPromise(inlinedCss)) {
      return (<Promise<string>>inlinedCss).then(css => { DOM.setText(styleEl, css); });
    } else {
      DOM.setText(styleEl, <string>inlinedCss);
      return null;
    }
  }
}
