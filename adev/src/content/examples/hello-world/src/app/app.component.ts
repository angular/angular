/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class HelloWorldComponent {
  world = 'World!!!';
  count = signal(0);

  increase(): void {
    this.count.update((previous) => {
      return previous + 1;
    });
  }
}
