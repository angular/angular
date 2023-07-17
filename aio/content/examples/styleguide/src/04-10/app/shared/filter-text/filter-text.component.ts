// #docregion
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'toh-filter-text',
  template: '<input type="text" id="filterText" [(ngModel)]="filter" (keyup)="filterChanged($event)" />'
})
export class FilterTextComponent {
  @Output() changed: EventEmitter<string>;

  filter = '';

  constructor() {
    this.changed = new EventEmitter<string>();
  }

  clear() {
    this.filter = '';
  }

  filterChanged(event: any) {
    event.preventDefault();
    console.log(`Filter Changed: ${this.filter}`);
    this.changed.emit(this.filter);
  }
}
