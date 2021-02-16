// #docplaster
// #docregion cart-service
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { products } from '../products';
import { CartService } from '../cart.service';
// #enddocregion cart-service

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
// #docregion inject-cart-service, add-to-cart
export class ProductDetailsComponent implements OnInit {
// #enddocregion add-to-cart, inject-cart-service
  product;

// #docregion inject-cart-service
  constructor(
    private route: ActivatedRoute,
    private cartService: CartService
  ) { }
// #enddocregion inject-cart-service

  ngOnInit() {
    // First get the product id from the current route.
    const routeParams = this.route.snapshot.paramMap;
    const productIdFromRoute = Number(routeParams.get('productId'));

    // Find the product that correspond with the id provided in route.
    this.product = products.find(product => product.id === productIdFromRoute);
  }

// #docregion add-to-cart
  addToCart(product) {
    this.cartService.addToCart(product);
    window.alert('Your product has been added to the cart!');
  }
// #docregion inject-cart-service
}
