/* tslint:disable use-input-property-decorator use-output-property-decorator */
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Item } from '../item';

@Component({
  selector: 'app-item-detail',
  styleUrls: ['./item-detail.component.css'],
  templateUrl: './item-detail.component.html'
})
export class ItemDetailComponent {

  @Input() item;
  itemImageUrl = 'assets/teapot.svg';
  lineThrough = '';
  displayNone = '';
  @Input() prefix = '';

  // #docregion deleteRequest
  // This component makes a request but it can't actually delete a hero.
  @Output() deleteRequest = new EventEmitter<Item>();

  delete() {
    this.deleteRequest.emit(this.item);
    this.displayNone = this.displayNone ? '' : 'none';
    this.lineThrough = this.lineThrough ? '' : 'line-through';
  }
  // #enddocregion deleteRequest

}
