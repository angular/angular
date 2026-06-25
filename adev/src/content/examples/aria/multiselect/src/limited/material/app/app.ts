import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {OverlayModule} from '@angular/cdk/overlay';
import {afterRenderEffect, Component, computed, signal, viewChild, effect} from '@angular/core';

@Component({
  selector: 'app-root:not([theme="limited-material"])',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class App {
  /** The combobox listbox popup. */
  readonly listbox = viewChild(Listbox);

  /** The options available in the listbox. */
  readonly selectedValues = signal<string[]>([]);

  /** The string that is displayed in the combobox. */
  readonly displayValue = computed(() => {
    const values = this.selectedValues();
    if (values.length === 0) {
      return 'Select 2 labels';
    }
    if (values.length === 1) {
      return values[0];
    }
    return `${values[0]} & ${values[1]}`;
  });

  /** The labels that are available for selection. */
  readonly labels = [
    {value: 'Important', disabled: computed(() => this.isOptionDisabled('Important'))},
    {value: 'Starred', disabled: computed(() => this.isOptionDisabled('Starred'))},
    {value: 'Work', disabled: computed(() => this.isOptionDisabled('Work'))},
    {value: 'Personal', disabled: computed(() => this.isOptionDisabled('Personal'))},
    {value: 'To Do', disabled: computed(() => this.isOptionDisabled('To Do'))},
    {value: 'Later', disabled: computed(() => this.isOptionDisabled('Later'))},
    {value: 'Read', disabled: computed(() => this.isOptionDisabled('Read'))},
    {value: 'Travel', disabled: computed(() => this.isOptionDisabled('Travel'))},
  ];

  /** Whether the popup is expanded. */
  readonly popupExpanded = signal(false);

  constructor() {
    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  isOptionDisabled(value: string) {
    const values = this.selectedValues();
    if (!values || values.length < 2) {
      return false;
    }
    return !values.includes(value);
  }
}
