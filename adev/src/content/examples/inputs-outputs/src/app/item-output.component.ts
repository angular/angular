import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-item-output',
  templateUrl: './item-output.component.html',
})
// #docregion item-output-class
export class ItemOutputComponent {
  // #docregion item-output

  @Output() newItemEvent = new EventEmitter<string>();

  // #enddocregion item-output
  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }
}
// #enddocregion item-output-class
