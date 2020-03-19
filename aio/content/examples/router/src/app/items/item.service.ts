// #docregion
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Item } from './item';
import { ITEMS } from './mock-items';
import { MessageService } from '../message.service';

@Injectable({
  providedIn: 'root',
})
export class ItemService {

  constructor(private messageService: MessageService) { }

  getItems(): Observable<Item[]> {
    // TODO: send the message _after_ fetching the items
    this.messageService.add('ItemService: fetched items');
    return of(ITEMS);
  }

  getItem(id: number | string) {
    return this.getItems().pipe(
      // (+) before `id` turns the string into a number
      map((items: Item[]) => items.find(item => item.id === +id))
    );
  }
}

