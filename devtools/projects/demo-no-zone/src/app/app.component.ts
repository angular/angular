/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  counter = 0;

  constructor(private _cd: ChangeDetectorRef) {}

  increment(): void {
    this.counter++;
    this._cd.detectChanges();
  }
}
