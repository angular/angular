import {AppRootUrl} from "angular2/src/compiler/app_root_url";
import {DOM} from "angular2/src/core/dom/dom_adapter";
import {Injectable} from "angular2/src/core/di";

/**
 * Extension of {@link AppRootUrl} that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
@Injectable()
export class AnchorBasedAppRootUrl extends AppRootUrl {
  constructor() {
    super("");
    // compute the root url to pass to AppRootUrl
    var a = DOM.createElement('a');
    DOM.resolveAndSetHref(a, './', null);
    this.value = DOM.getHref(a);
  }
}
