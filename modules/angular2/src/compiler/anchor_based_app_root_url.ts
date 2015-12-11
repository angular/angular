import {DOM} from "angular2/src/platform/dom/dom_adapter";
import {Injectable} from "angular2/src/core/di";

/**
 * Set the root url to the current page's url.
 */
@Injectable()
export class AnchorBasedAppRootUrl {
  value: string;
  constructor() {
    // compute the root url
    var a = DOM.createElement('a');
    DOM.resolveAndSetHref(a, './', null);
    this.value = DOM.getHref(a);
  }
}
