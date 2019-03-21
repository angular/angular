// #docplaster
// #docregion rxjs-imports, activated-route-import, product-imports
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-imports
import { ActivatedRoute } from '@angular/router';
// #enddocregion activated-route-import

import { ProductService } from '../product.service';
import { Product } from '../product';
// #enddocregion product-imports

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
// #docregion product
export class ProductDetailsComponent {
  product: Observable<Product>;
// #enddocregion product

// #docregion product-details
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {
    this.product = this.route.paramMap
      .pipe(
        switchMap(params => this.productService.getOne(+params.get('productId')))
      );
  }
// #enddocregion product-details

// #docregion product
}
// #enddocregion product
