/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Combobox,
  ComboboxDialog,
  ComboboxInput,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';

type SelectOptionValue = string | number | boolean;

export interface SelectOption {
  label: string;
  value: SelectOptionValue;
}

@Component({
  selector: 'docs-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Combobox,
    ComboboxDialog,
    ComboboxInput,
    ComboboxPopupContainer,
    FormsModule,
    Listbox,
    Option,
  ],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class Select implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);

  readonly id = input.required<string>({alias: 'selectId'});
  readonly name = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly disabled = input(false);

  readonly dialog = viewChild(ComboboxDialog);
  readonly listbox = viewChild<Listbox<SelectOptionValue>>(Listbox);
  readonly combobox = viewChild<Combobox<SelectOptionValue>>(Combobox);

  readonly searchString = signal('');

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
      if (this.dialog() && this.combobox()?.expanded()) {
        untracked(() => this.listbox()?.gotoFirst());
        this.positionDialog();
      }
    });

    afterRenderEffect(() => {
      const selected = this.selectedValues();
      if (selected.length > 0) {
        untracked(() => this.dialog()?.close());
        this.value.set(selected[0] as string);
        this.searchString.set('');
      }
    });

    afterRenderEffect(() => this.listbox()?.scrollActiveItemIntoView());
  }
  // TODO: Improve once CDK overlay is fixed https://github.com/angular/components/issues/32504
  private positionDialog(): void {
    const dialog = this.dialog();
    const combobox = this.combobox();

    if (!dialog || !combobox) {
      return;
    }

    const comboboxRect = combobox.inputElement()?.getBoundingClientRect();
    const scrollY = window.scrollY;

    if (comboboxRect) {
      dialog.element.style.width = `${comboboxRect.width}px`;
      dialog.element.style.top = `${comboboxRect.bottom + scrollY + 4}px`;
      dialog.element.style.left = `${comboboxRect.left}px`;
    }
  }
}
