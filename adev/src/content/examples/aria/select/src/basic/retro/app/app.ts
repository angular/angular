import {afterRenderEffect, Component, computed, signal, viewChild} from '@angular/core';
import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {OverlayModule} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root[theme="basic-retro"], app-root:not([theme])',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class App {
  readonly listbox = viewChild(Listbox);

  readonly selectedValues = signal<string[]>([]);
  readonly displayValue = computed(() => this.selectedValues()[0] || 'Select a label');
  readonly popupExpanded = signal(false);

  readonly labels = [
    'Important',
    'Starred',
    'Work',
    'Personal',
    'To Do',
    'Later',
    'Read',
    'Travel',
  ];

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  onCommit() {
    this.popupExpanded.set(false);
  }
}
