// #docplaster
// #docregion imports
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Product, products } from '../products';
// #enddocregion imports

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
// #docregion props-methods, product-prop
export class ProductDetailsComponent implements OnInit {
  product: Product|undefined;
  // #enddocregion product-prop

  constructor(
    private route: ActivatedRoute,
  ) { }

  // #enddocregion props-methods
  // #docregion get-product
  ngOnInit() {
    // First get the product id from the current route.
    const routeParams = this.route.snapshot.paramMap;
    const productIdFromRoute = Number(routeParams.get('productId'));

    // Find the product that correspond with the id provided in route.
    this.product = products.find(product => product.id === productIdFromRoute);
  }
  // #enddocregion get-product
  // #docregion product-prop
  /* ... */
  // #docregion props-methods
}
