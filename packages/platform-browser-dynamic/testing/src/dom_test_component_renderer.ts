/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
import {ɵgetDOM as getDOM} from '@angular/platform-browser';

/**
 * A DOM based implementation of the TestComponentRenderer.
 */
@Injectable()
export class DOMTestComponentRenderer extends TestComponentRenderer {
  constructor(@Inject(DOCUMENT) private _doc: any) { super(); }

  insertRootElement(rootElId: string) {
    const template = getDOM().getDefaultDocument().createElement('template');
    template.innerHTML = `<div id="${rootElId}"></div>`;
    const rootEl = <HTMLElement>getDOM().firstChild(getContent(template));

    // TODO(juliemr): can/should this be optional?
    const oldRoots = getDOM().querySelectorAll(this._doc, '[id^=root]');
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }
    getDOM().appendChild(this._doc.body, rootEl);
  }
}

function getContent(node: Node): Node {
  if ('content' in node) {
    return (<any>node).content;
  } else {
    return node;
  }
}
