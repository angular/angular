import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  viewChild,
  viewChildren,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    OverlayModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** The combobox listbox popup. */
  listbox = viewChild<Listbox<string>>(Listbox);

  /** The options available in the listbox. */
  options = viewChildren<Option<string>>(Option);

  /** A reference to the ng aria combobox. */
  combobox = viewChild<Combobox<string>>(Combobox);

  /** The string that is displayed in the combobox. */
  displayValue = computed(() => {
    const values = this.listbox()?.values() || [];
    if (values.length === 0) {
      return 'Select 2 labels';
    }
    if (values.length === 1) {
      return values[0];
    }
    return `${values[0]} & ${values[1]}`;
  });

  /** The labels that are available for selection. */
  labels = [
    {value: 'Important', disabled: computed(() => this.isOptionDisabled('Important'))},
    {value: 'Starred', disabled: computed(() => this.isOptionDisabled('Starred'))},
    {value: 'Work', disabled: computed(() => this.isOptionDisabled('Work'))},
    {value: 'Personal', disabled: computed(() => this.isOptionDisabled('Personal'))},
    {value: 'To Do', disabled: computed(() => this.isOptionDisabled('To Do'))},
    {value: 'Later', disabled: computed(() => this.isOptionDisabled('Later'))},
    {value: 'Read', disabled: computed(() => this.isOptionDisabled('Read'))},
    {value: 'Travel', disabled: computed(() => this.isOptionDisabled('Travel'))},
  ];

  constructor() {
    // Scrolls to the active item when the active option changes.
    // The slight delay here is to ensure animations are done before scrolling.
    afterRenderEffect(() => {
      const option = this.options().find((opt) => opt.active());
      setTimeout(() => option?.element.scrollIntoView({block: 'nearest'}), 50);
    });

    // Resets the listbox scroll position when the combobox is closed.
    afterRenderEffect(() => {
      if (!this.combobox()?.expanded()) {
        setTimeout(() => this.listbox()?.element.scrollTo(0, 0), 150);
      }
    });
  }

  isOptionDisabled(value: string) {
    const values = this.listbox()?.values();

    if (!values || values.length < 2) {
      return false;
    }

    return !values.includes(value);
  }
}
