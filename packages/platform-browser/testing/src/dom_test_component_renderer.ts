/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    this.removeAllRootElementsImpl();
    const rootElement = getDOM().getDefaultDocument().createElement('div');
    rootElement.setAttribute('id', rootElId);
    this._doc.body.appendChild(rootElement);
  }

  override removeAllRootElements() {
    // Check whether the `DOCUMENT` instance retrieved from DI contains
    // the necessary function to complete the cleanup. In tests that don't
    // interact with DOM, the `DOCUMENT` might be mocked and some functions
    // might be missing. For such tests, DOM cleanup is not required and
    // we skip the logic if there are missing functions.
    if (typeof this._doc.querySelectorAll === 'function') {
      this.removeAllRootElementsImpl();
    }
  }

  private removeAllRootElementsImpl() {
    const oldRoots = this._doc.querySelectorAll('[id^=root]');
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }
  }
}
