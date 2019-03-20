// #docplaster
// #docregion cart-imports
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { ProductService } from '../product.service';
import { Product } from '../product';

import { CartService } from '../../cart.service';
// #enddocregion cart-imports

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product: Observable<Product>;

  // #docregion product-details, cart-service
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {
// #enddocregion cart-service
    this.product = this.route.paramMap
      .pipe(
        switchMap(params => this.productService.getOne(+params.get('productId')))
      );
// #docregion cart-service
  }
// #enddocregion product-details, cart-service

// #docregion buy
  onBuy(product: Product) {
    this.cartService.add(product);
  }
// #enddocregion buy
// #docregion product-details, flags, cart-service
}
// #enddocregion product-details, flags, cart-service
