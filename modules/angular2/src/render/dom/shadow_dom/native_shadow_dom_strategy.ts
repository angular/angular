import {Injectable} from 'angular2/di';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {ShadowDomStrategy} from './shadow_dom_strategy';

/**
 * This strategies uses the native Shadow DOM support.
 *
 * The templates for the component are inserted in a Shadow Root created on the component element.
 * Hence they are strictly isolated.
 */
@Injectable()
export class NativeShadowDomStrategy extends ShadowDomStrategy {
  prepareShadowRoot(el) { return DOM.createShadowRoot(el); }
}
