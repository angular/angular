/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ElementRef, output, viewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

import {ButtonComponent} from '../../../../shared/button/button.component';
import {createFilter, Filter} from './filter';

@Component({
  selector: 'ng-recording-timeline-controls',
  templateUrl: './recording-timeline-controls.component.html',
  styleUrls: ['./recording-timeline-controls.component.scss'],
  imports: [ButtonComponent, MatIcon, MatTooltip],
})
export class RecordingTimelineControlsComponent {
  protected readonly filterRef = viewChild<ElementRef>('filter');
  protected readonly exportProfile = output<void>();
  protected readonly filter = output<Filter>();

  onFilterInput(value: string) {
    this.filter.emit(createFilter(value));
  }

  clearFilter() {
    const filterInput = this.filterRef()?.nativeElement;
    filterInput.value = '';
    this.onFilterInput('');
  }
}
