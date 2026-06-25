import {afterRenderEffect, Component, computed, signal, viewChild} from '@angular/core';
import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {OverlayModule} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root[theme="icons-basic"], app-root:not([theme])',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class App {
  readonly listbox = viewChild(Listbox);

  readonly selectedValues = signal<string[]>([]);
  readonly popupExpanded = signal(false);

  readonly displayIcon = computed(() => {
    const val = this.selectedValues()[0];
    const label = this.labels.find((label) => label.value === val);
    return label ? label.icon : '';
  });

  readonly displayValue = computed(() => this.selectedValues()[0] || 'Select a label');

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

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  onCommit() {
    this.popupExpanded.set(false);
  }
}
