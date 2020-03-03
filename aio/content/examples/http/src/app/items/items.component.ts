import { Component, OnInit } from '@angular/core';

import { Item } from './item';
import { ItemsService } from './items.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  providers: [ItemsService],
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  items: Item[];
  editItem: Item; // the item currently being edited

  constructor(private itemsService: ItemsService) {}

  ngOnInit() {
    this.getItems();
  }

  getItems(): void {
    this.itemsService.getItems()
      .subscribe(items => (this.items = items));
  }

  add(name: string): void {
    this.editItem = undefined;
    name = name.trim();
    if (!name) {
      return;
    }

    // The server will generate the id for this new item
    const newItem: Item = { name } as Item;
    // #docregion add-item-subscribe
    this.itemsService
      .addItem(newItem)
      .subscribe(item => this.items.push(item));
    // #enddocregion add-item-subscribe
  }

  delete(item: Item): void {
    this.items = this.items.filter(h => h !== item);
    // #docregion delete-item-subscribe
    this.itemsService
      .deleteItem(item.id)
      .subscribe();
    // #enddocregion delete-item-subscribe
    /*
    // #docregion delete-item-no-subscribe
    // oops ... subscribe() is missing so nothing happens
    this.itemsService.deleteItem(item.id);
    // #enddocregion delete-item-no-subscribe
    */
  }

  edit(item: Item) {
    this.editItem = item;
  }

  search(searchTerm: string) {
    this.editItem = undefined;
    if (searchTerm) {
      this.itemsService
        .searchItems(searchTerm)
        .subscribe(items => (this.items = items));
    }
  }

  update() {
    if (this.editItem) {
      this.itemsService
        .updateItem(this.editItem)
        .subscribe(item => {
        // replace the item in the items list with update from server
        const ix = item ? this.items.findIndex(i => i.id === item.id) : -1;
        if (ix > -1) {
          this.items[ix] = item;
        }
      });
      this.editItem = undefined;
    }
  }
}
