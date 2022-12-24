import { Component, Input } from '@angular/core';
import { ITEMS } from '../mock-items';
import { Item } from '../item';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent {
  listItems = ITEMS;
  // #docregion item-input
  @Input() items: Item[] = [];
  // #enddocregion item-input

}
