/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';

/**
 * A DOM based implementation of the TestComponentRenderer.
 */
@Injectable()
export class DOMTestComponentRenderer extends TestComponentRenderer {
  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
  }

  override insertRootElement(rootElId: string) {
    this.removeAllRootElements();
    const rootElement = getDOM().getDefaultDocument().createElement('div');
    rootElement.setAttribute('id', rootElId);
    this._doc.body.appendChild(rootElement);
  }

  override removeAllRootElements() {
    // TODO(juliemr): can/should this be optional?
    const oldRoots = this._doc.querySelectorAll('[id^=root]');
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }
  }
}
