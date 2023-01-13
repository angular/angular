/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ng-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent {
  @Output() filter: EventEmitter<string> = new EventEmitter<string>();
  @Output() nextMatched: EventEmitter<void> = new EventEmitter();
  @Output() prevMatched: EventEmitter<void> = new EventEmitter();

  @Input() hasMatched = false;

  emitFilter(event: InputEvent): void {
    this.filter.emit((event.target as HTMLInputElement).value);
  }

  emitNextMatched(): void {
    this.nextMatched.emit();
  }

  emitPrevMatched(): void {
    this.prevMatched.emit();
  }
}
