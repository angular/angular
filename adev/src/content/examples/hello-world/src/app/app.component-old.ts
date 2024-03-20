/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectorRef, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'hello-world',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class HelloWorldComponent {
  world = 'World';
  count = signal(0);
  changeDetector = inject(ChangeDetectorRef);

  increase(): void {
    this.count.update((previous) => {
      return previous + 1;
    });
    this.changeDetector.detectChanges();
  }
}
