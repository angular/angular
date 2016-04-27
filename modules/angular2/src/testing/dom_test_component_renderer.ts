import {Inject, Injectable} from 'angular2/src/core/di';
import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {TestComponentRenderer} from './test_component_builder';
import {el} from './utils';

/**
 * A DOM based implementation of the TestComponentRenderer.
 */
@Injectable()
export class DOMTestComponentRenderer extends TestComponentRenderer {
  constructor(@Inject(DOCUMENT) private _doc) { super(); }

  insertRootElement(rootElementId: string) {
    var rootEl = el(`<div id="${rootElementId}"></div>`);

    // TODO(juliemr): can/should this be optional?
    var oldRoots = DOM.querySelectorAll(this._doc, '[id^=root]');
    for (var i = 0; i < oldRoots.length; i++) {
      DOM.remove(oldRoots[i]);
    }
    DOM.appendChild(this._doc.body, rootEl);
  }
}
