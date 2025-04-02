/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../../src/core';
import {bootstrapApplication} from '@angular/platform-browser';

import {DeferComponent} from './defer.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [DeferComponent],
  template: `
    <h1>Defer feature</h1>

    @defer (when isVisible) {
      <defer-cmp />
    } @loading {
      loading
    } @placeholder {
      Placeholder
    } @error {
      Error
    }
  `,
})
export class AppComponent {
  isVisible = true;
}

bootstrapApplication(AppComponent);
