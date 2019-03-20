// #docplaster
// #docregion imports, cart-service
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { products } from '../products';
// #enddocregion imports
import { CartService } from '../cart.service';
// #enddocregion cart-service

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
// #docregion props-methods, get-product, inject-cart-service, add-to-cart
export class ProductDetailsComponent implements OnInit {
// #enddocregion add-to-cart, get-product, inject-cart-service
  product;

// #docregion inject-cart-service
  constructor(
    private route: ActivatedRoute,
// #enddocregion props-methods
    private cartService: CartService
// #docregion props-methods
  ) { }
// #enddocregion inject-cart-service

// #docregion get-product
  ngOnInit() {
// #enddocregion props-methods
    this.route.paramMap.subscribe(params => {
      this.product = products[+params.get('productId')];
    });
// #docregion props-methods
  }

// #enddocregion props-methods, get-product
// #docregion add-to-cart
  addToCart(product) {
    window.alert('Your product has been added to the cart!');
    this.cartService.addToCart(product);
  }
// #docregion props-methods, get-product, inject-cart-service
}
