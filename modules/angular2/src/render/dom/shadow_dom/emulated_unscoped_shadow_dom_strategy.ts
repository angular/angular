import {DOM} from 'angular2/src/dom/dom_adapter';

import {ShadowDomStrategy} from './shadow_dom_strategy';
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
  constructor(public styleHost) { super(); }

  hasNativeContentElement(): boolean { return false; }

  processStyleElement(hostComponentId: string, templateUrl: string, styleEl: Element): void {
    var cssText = DOM.getText(styleEl);
    insertSharedStyleText(cssText, this.styleHost, styleEl);
  }
}
