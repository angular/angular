/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  Component,
  computed,
  signal,
  viewChild,
  untracked,
  ElementRef,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
})
export class App {
  readonly listbox = viewChild<Listbox<string>>(Listbox);
  readonly combobox = viewChild(Combobox);
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly value = signal('');
  readonly searchString = signal('');
  readonly selectedCountries = signal<string[]>([]);
  readonly popupExpanded = signal(false);

  readonly options = computed(() =>
    ALL_COUNTRIES.filter((country) =>
      country.toLowerCase().startsWith(this.searchString().toLowerCase()),
    ),
  );

  constructor() {
    afterRenderEffect(() => {
      if (this.popupExpanded()) {
        untracked(() => {
          setTimeout(() => {
            this.searchInput()?.nativeElement.focus();
          });
        });
      }
    });

    afterRenderEffect(() => {
      if (this.popupExpanded()) {
        this.listbox()?.scrollActiveItemIntoView();
      }
    });
  }

  onCommit() {
    const selected = this.selectedCountries();
    if (selected.length > 0) {
      this.value.set(selected[0]);
      this.searchString.set('');
      this.popupExpanded.set(false);
      this.combobox()?.element.focus();
    }
  }

  onSearchEscape(event: Event) {
    this.popupExpanded.set(false);
    this.combobox()?.element.focus();
  }
}

const ALL_COUNTRIES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Brazil',
  'Canada',
  'Egypt',
  'France',
  'Germany',
  'India',
  'Japan',
  'Mexico',
  'United Kingdom',
  'United States of America',
];
