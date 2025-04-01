/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'ng-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  imports: [MatCard, MatIcon],
})
export class FilterComponent {
  readonly filter = output<string>();
  readonly nextMatched = output<void>();
  readonly prevMatched = output<void>();

  readonly matchesCount = input<number>(0);
  readonly currentMatch = input<number>(0);

  emitFilter(event: Event): void {
    this.filter.emit((event.target as HTMLInputElement).value);
  }

  emitNextMatched(): void {
    this.nextMatched.emit();
  }

  emitPrevMatched(): void {
    this.prevMatched.emit();
  }
}
