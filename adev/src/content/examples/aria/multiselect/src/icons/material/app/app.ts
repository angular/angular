import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {OverlayModule} from '@angular/cdk/overlay';
import {afterRenderEffect, Component, computed, signal, viewChild, effect} from '@angular/core';

@Component({
  selector: 'app-root:not([theme="icons-material"])',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class App {
  /** The combobox listbox popup. */
  readonly listbox = viewChild(Listbox);

  /** The options available in the listbox. */
  readonly selectedValues = signal<string[]>([]);

  /** The icon that is displayed in the combobox. */
  readonly displayIcon = computed(() => {
    const values = this.selectedValues();
    const label = this.labels.find((label) => label.value === values[0]);
    return label ? label.icon : '';
  });

  /** The string that is displayed in the combobox. */
  readonly displayValue = computed(() => {
    const values = this.selectedValues();
    if (values.length === 0) {
      return 'Select a label';
    }
    if (values.length === 1) {
      return values[0];
    }
    return `${values[0]} + ${values.length - 1} more`;
  });

  /** The labels that are available for selection. */
  readonly labels = [
    {value: 'Important', icon: 'label'},
    {value: 'Starred', icon: 'star'},
    {value: 'Work', icon: 'work'},
    {value: 'Personal', icon: 'person'},
    {value: 'To Do', icon: 'checklist'},
    {value: 'Later', icon: 'schedule'},
    {value: 'Read', icon: 'menu_book'},
    {value: 'Travel', icon: 'flight'},
  ];

  /** Whether the popup is expanded. */
  readonly popupExpanded = signal(false);

  constructor() {
    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });

    // Resets the listbox scroll position when the combobox is closed.
    afterRenderEffect(() => {
      if (!this.popupExpanded()) {
        setTimeout(() => this.listbox()?.element.scrollTo(0, 0), 150);
      }
    });
  }
}
