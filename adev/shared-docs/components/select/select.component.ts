/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

type SelectOptionValue = string | number | boolean;

export interface SelectOption {
  label: string;
  value: SelectOptionValue;
}

@Component({
  selector: 'docs-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  host: {
    class: 'docs-form-element',
  },
})
export class Select implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);

  readonly id = input.required<string>({alias: 'selectId'});
  readonly name = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly disabled = input(false);

  setOption($event: SelectOptionValue): void {
    if (this.disabled()) {
      return;
    }

    this.value.set($event as string);
  }
}
