/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterRenderEffect, Component, ElementRef, input, output, viewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {ButtonComponent} from '../../../../../../shared/button/button.component';

@Component({
  selector: 'ng-prop-filter',
  templateUrl: './prop-filter.component.html',
  styleUrl: './prop-filter.component.scss',
  imports: [MatIcon, ButtonComponent],
})
export class PropFilterComponent {
  protected readonly filterInput = viewChild<ElementRef>('filterInput');
  protected readonly filterText = input.required<string>();
  protected readonly filter = output<string>();

  constructor() {
    afterRenderEffect({
      write: () => this.filterInput()?.nativeElement.focus(),
    });
  }

  protected clearFilter() {
    this.filter.emit('');
    (this.filterInput()?.nativeElement as HTMLInputElement).value = '';
  }
}
