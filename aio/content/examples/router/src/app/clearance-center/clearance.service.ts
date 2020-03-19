// #docplaster
// #docregion
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { MessageService } from '../message.service';
import { ClearanceItem } from './clearance-item';
import { CLEARANCEITEMS } from './mock-clearance-items';

@Injectable({
  providedIn: 'root',
})
export class ClearanceService {
  static nextClearanceItemId = 100;
  private clearanceItems$: BehaviorSubject<ClearanceItem[]> = new BehaviorSubject<ClearanceItem[]>(CLEARANCEITEMS);

  constructor(private messageService: MessageService) { }

  getClearanceItems() { return this.clearanceItems$; }

  getClearanceItem(id: number | string) {
    return this.getClearanceItems().pipe(
      map(clearanceItems => clearanceItems.find(clearanceItem => clearanceItem.id === +id))
    );
  }

  // #enddocregion
  addClearanceItem(name: string) {
    name = name.trim();
    if (name) {
      let clearanceItem = { id: ClearanceService.nextClearanceItemId++, name };
      CLEARANCEITEMS.push(clearanceItem);
      this.clearanceItems$.next(CLEARANCEITEMS);
    }
  }
  // #docregion
}
