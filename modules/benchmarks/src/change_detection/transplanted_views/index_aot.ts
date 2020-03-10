/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵrenderComponent as renderComponent} from '@angular/core';

import {bindAction, profile} from '../../util';

import {DeclarationComponent, createDom, destroyDom, detectChanges} from './transplanted_views';

function noop() {}

export function main() {
  let component: DeclarationComponent;
  if (typeof window !== 'undefined') {
    component = renderComponent<DeclarationComponent>(DeclarationComponent);
    bindAction('#destroyDom', () => destroyDom(component));
    bindAction('#createDom', () => createDom(component));
    bindAction('#detectChanges', () => detectChanges(component));
    bindAction(
        '#detectChangesProfile', profile(() => detectChanges(component), noop, 'detect_changes'));
  }
}

main();
