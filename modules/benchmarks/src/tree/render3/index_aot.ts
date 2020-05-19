/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵrenderComponent as renderComponent} from '@angular/core';

import {bindAction, profile} from '../../util';

import {createDom, destroyDom, detectChanges, TreeComponent} from './tree';

function noop() {}

export function main() {
  let component: TreeComponent;
  if (typeof window !== 'undefined') {
    component = renderComponent(TreeComponent);
    bindAction('#createDom', () => createDom(component));
    bindAction('#destroyDom', () => destroyDom(component));
    bindAction('#detectChanges', () => detectChanges(component));
    bindAction(
        '#detectChangesProfile', profile(() => detectChanges(component), noop, 'detectChanges'));
    bindAction('#updateDomProfile', profile(() => createDom(component), noop, 'update'));
    bindAction(
        '#createDomProfile',
        profile(() => createDom(component), () => destroyDom(component), 'create'));
  }
}

main();
