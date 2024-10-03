/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'ng-property-view-header',
  templateUrl: './property-view-header.component.html',
  styleUrls: ['./property-view-header.component.scss'],
  imports: [MatToolbar, MatTooltip, MatIcon],
})
export class PropertyViewHeaderComponent {
  readonly directive = input.required<string>();
  readonly viewSource = output<void>();

  // output that emits directive
  handleViewSource(event: MouseEvent): void {
    event.stopPropagation();
    this.viewSource.emit();
  }
}
