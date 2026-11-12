/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';

@Component({
  selector: 'defer-cmp',
  template: `<button (click)="count.set(count() + 1)">Clicked {{ count() }} times</button>`,
})
export class DeferComponent {
  protected readonly count = signal(0);
}
