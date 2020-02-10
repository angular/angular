
// #docplaster

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

// #docregion parent-property
// #docregion add-new-item
export class AppComponent {
// #enddocregion add-new-item
  currentItem = 'Television';
  // #enddocregion parent-property

  lastChanceItem = 'Beanbag';
// #docregion add-new-item
  items = ['item1', 'item2', 'item3', 'item4'];
// #enddocregion add-new-item
  wishlist = ['Drone', 'Computer'];

  // #docregion add-new-item

  addItem(newItem: string) {
    this.items.push(newItem);
  }
  // #enddocregion add-new-item


  crossOffItem(item: string) {
    console.warn(`Parent says: crossing off ${item}.`);
  }

  buyClearanceItem(item) {
    console.warn(`Parent says: buying ${item}.`);
  }

  saveForLater(item) {
    console.warn(`Parent says: saving ${item} for later.`);
  }

  addToWishList(wish: string) {
    console.warn(`Parent says: adding ${this.currentItem} to your wishlist.`);
    this.wishlist.push(wish);
    console.warn(this.wishlist);
  }
// #docregion add-new-item
// #docregion parent-property
}
// #enddocregion add-new-item
// #enddocregion parent-property

