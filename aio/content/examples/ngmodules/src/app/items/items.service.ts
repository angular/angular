import { Injectable, OnDestroy } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export class Item {
  constructor(public id: number, public name: string) { }
}

const ITEMS: Item[] = [
  new Item(1, 'Sticky notes'),
  new Item(2, 'Dry erase markers'),
  new Item(3, 'Erasers'),
  new Item(4, 'Whiteboard cleaner'),
];

const FETCH_LATENCY = 500;

/** Simulate a data service that retrieves items from a server */
@Injectable()
export class ItemService implements OnDestroy {

  constructor() { console.log('ItemService instance created.'); }
  ngOnDestroy() { console.log('ItemService instance destroyed.'); }

  getItems(): Observable<Item[]>  {
    return of(ITEMS).pipe(delay(FETCH_LATENCY));
  }

  getItem(id: number | string): Observable<Item> {
    const item$ = of(ITEMS.find(item => item.id === +id));
    return item$.pipe(delay(FETCH_LATENCY));
  }
}


