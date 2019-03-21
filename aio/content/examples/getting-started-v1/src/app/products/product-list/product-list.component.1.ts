// #docplaster
// #docregion, rxjs-import, product-imports
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
// #enddocregion rxjs-import

import { ProductService } from '../product.service';
import { Product } from '../product';
// #enddocregion product-imports

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
// #docregion products-observable
export class ProductListComponent {
  products: Observable<Product[]>;

  constructor(private productService: ProductService) {
    this.products = this.productService.getAll();
  }
}
// #enddocregion products-observable

