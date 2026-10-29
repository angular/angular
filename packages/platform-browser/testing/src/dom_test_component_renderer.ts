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
 * The root element inserted last by `DOMTestComponentRenderer`. It is tracked by reference, because
 * the root component can replace or remove its `root<N>` id (e.g. with an `[attr.id]` host
 * binding). Kept outside of the class, because each testing module gets its own renderer and the
 * next one may have to clean up.
 */
let insertedRootElement: Element | null = null;

/**
 * A DOM based implementation of the TestComponentRenderer.
 */
@Injectable()
export class DOMTestComponentRenderer extends TestComponentRenderer {
  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
  }

  override insertRootElement(rootElId: string, tagName = 'div') {
    this.removeAllRootElementsImpl();
    const rootElement = getDOM().getDefaultDocument().createElement(tagName);
    rootElement.setAttribute('id', rootElId);
    this._doc.body.appendChild(rootElement);
    insertedRootElement = rootElement;
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
    if (insertedRootElement !== null) {
      getDOM().remove(insertedRootElement);
      insertedRootElement = null;
    }
  }
}
