import { Component } from '@angular/core';

import { products } from '../products';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
// #docregion on-notify
export class ProductListComponent {
// #enddocregion on-notify
  products = products;

  share() {
    window.alert('The product has been shared!');
  }
// #docregion on-notify
  onNotify() {
    console.warn('You will be notified when the product goes on sale');
  }
}
