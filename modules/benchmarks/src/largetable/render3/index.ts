/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import 'reflect-metadata';
import {ɵrenderComponent as renderComponent} from '@angular/core';

import {bindAction, profile} from '../../util';

import {LargeTableComponent, createDom, destroyDom} from './table';

function noop() {}

export function main() {
  let component: LargeTableComponent;
  if (typeof window !== 'undefined') {
    component = renderComponent<LargeTableComponent>(LargeTableComponent);
    bindAction('#createDom', () => createDom(component));
    bindAction('#destroyDom', () => destroyDom(component));
    bindAction('#updateDomProfile', profile(() => createDom(component), noop, 'update'));
    bindAction(
        '#createDomProfile',
        profile(() => createDom(component), () => destroyDom(component), 'create'));
  }
}

const isBazel = location.pathname.indexOf('/all/') !== 0;
// isBazel needed while 'scripts/ci/test-e2e.sh test.e2e.protractor-e2e' is run
// on Travis
// TODO: port remaining protractor e2e tests to bazel protractor_web_test_suite rule
if (isBazel) {
  main();
}
