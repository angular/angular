import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { tap, debounceTime } from 'rxjs/operators';

export const PRODUCTS = ['Shoes', 'Phones'];

@Injectable()
export class ProductService  {
  productsData$ = new BehaviorSubject(JSON.stringify(PRODUCTS));
  products$ = new BehaviorSubject<string[]>(PRODUCTS);
  parseError$ = new Subject<boolean>();

  init() {
    return this.productsData$.pipe(
      debounceTime(250),
      tap(data => {
        let parsed;

        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = null;
        }

        if (parsed && Array.isArray(parsed)) {
          this.products$.next(parsed);
          this.parseError$.next(false);
        } else {
          this.parseError$.next(true);
        }
      }));
  }
}
