/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ɵrenderComponent as renderComponent} from '@angular/core';

import {TriggerComponent} from './trigger';

@Component({
  selector: 'dep',
  template: 'dep',
})
export class DepComponent {
}

@NgModule({
  declarations: [DepComponent, TriggerComponent],
})
export class Module {
}

renderComponent(TriggerComponent);
