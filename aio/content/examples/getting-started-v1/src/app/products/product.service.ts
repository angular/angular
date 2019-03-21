// #docplaster
// #docregion complete, httpclient, rxjs-import
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// #enddocregion httpclient
import { map } from 'rxjs/operators';
// #enddocregion rxjs-import

import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
// #docregion httpclient-inject, httpclient-get-one
export class ProductService {
  constructor(private http: HttpClient) { }
// #enddocregion httpclient-inject

// #docregion httpclient-get-all
  getAll() {
    return this.http.get<{ products: Product[] }>('/assets/products.json')
      .pipe(map(data => data.products));
  }
// #enddocregion httpclient-get-all, complete

  getOne(productId: number) {
    return this.getAll()
      .pipe(
        map(products => products.find(product => product.id === productId))
      );
  }
// #docregion complete, httpclient-inject
}
// #enddocregion complete, httpclient-inject, httpclient-get-one
