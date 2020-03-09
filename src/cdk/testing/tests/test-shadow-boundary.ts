/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'test-shadow-boundary',
  template: `
    <div class="in-the-shadows">Shadow 1</div>
    <test-sub-shadow-boundary></test-sub-shadow-boundary>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:validate-decorators
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TestShadowBoundary {}

@Component({
  selector: 'test-sub-shadow-boundary',
  template: '<div class="in-the-shadows">Shadow 2</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:validate-decorators
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TestSubShadowBoundary {}
