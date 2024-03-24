import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

import {Item, ItemService} from './items.service';

@Component({
  template: `
    <h3 highlight>Items List</h3>
    @for (item of items | async; track item) {
      <div>
        <a routerLink="{{'../' + item.id}}">{{item.id}} - {{item.name}}</a>
      </div>
    }
    `,
})
export class ItemsListComponent {
  items: Observable<Item[]>;

  constructor(private itemService: ItemService) {
    this.items = this.itemService.getItems();
  }
}
