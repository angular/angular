/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {OverlayModule} from '@angular/cdk/overlay';
import {
  afterRenderEffect,
  Component,
  computed,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

type SelectOptionValue = string;

export interface SelectOption {
  label: string;
  value: SelectOptionValue;
}

@Component({
  selector: 'docs-select',
  templateUrl: 'select.component.html',
  styleUrl: 'select.component.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class Select implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);

  readonly id = input.required<string>({alias: 'selectId'});
  readonly name = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly disabled = input(false);

  readonly listbox = viewChild(Listbox);
  readonly combobox = viewChild(Combobox);

  readonly searchString = signal('');

  readonly popupExpanded = signal(false);
  readonly filteredOptions = computed(() => {
    const search = this.searchString().toLowerCase();
    if (!search) {
      return this.options();
    }
    return this.options().filter((option) => option.label.toLowerCase().includes(search));
  });

  readonly displayValue = computed(() => {
    const currentValue = this.value();
    if (currentValue === null) {
      return '';
    }
    const option = this.options().find((opt) => opt.value === currentValue);
    return option ? option.label : '';
  });

  readonly selectedValues = signal<SelectOptionValue[]>([]);

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  onCommit() {
    const values = this.selectedValues();
    if (values.length) {
      this.value.set(values[0]);
      //this.popupExpanded.set(false);
    }
  }

  /** Dismisses the dialog overlay on Escape key. */
  onSearchEscape(event: Event) {
    this.popupExpanded.set(false);
    this.combobox()?.element.focus();
  }

  /** Handles keydown events on the clear button. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.clear();
      this.popupExpanded.set(false);
      event.stopPropagation();
    }
  }

  /** Clears the search query and all selected options. */
  clear(): void {
    this.searchString.set('');
    this.value.set(null);
  }
}
