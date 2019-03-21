// #docplaster
// #docregion provider, product-data, rxjs-imports, product-import
import { Injectable } from '@angular/core';
// #enddocregion provider
import { Observable, of } from 'rxjs';

// #enddocregion rxjs-imports
import { Product } from './product';
// #enddocregion product-import

// #docregion provider
@Injectable({
  providedIn: 'root'
})
export class ProductService {
// #enddocregion product-data
// #enddocregion provider
/* tslint:disable:quotemark */
// #docregion product-data
  data = {
    "products": [
      {
        "id": 1,
        "name": "Phone XL",
        "price": "799",
        "description": "A large phone with one of the best screens",
        "categories": ["phones"]
      },
      {
        "id": 2,
        "name": "Phone Mini",
        "price": "699",
        "description": "A great phone with one of the best cameras",
        "categories": ["phones"]
      }
    ]
  };

// #enddocregion product-data
/* tslint:enable:quotemark */
// #docregion product-data
  getAll(): Observable<Product[]> {
    return of(this.data.products);
  }
  // #docregion provider
}
// #enddocregion product-data
// #enddocregion provider
