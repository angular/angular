// #docplaster
// #docregion
// TODO: Feature Componetized like ClearanceCenter
import { Component, OnInit }   from '@angular/core';
import { Router }              from '@angular/router';
import { Observable }          from 'rxjs';

import { ItemService }   from '../item.service';
import { Item } from '../item';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.1.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {
  items$: Observable<Item[]>;

  // #docregion ctor
  constructor(
    private router: Router,
    private service: ItemService
  ) {}
  // #enddocregion ctor

  ngOnInit() {
    this.items$ = this.service.getItems();
  }
}
// #enddocregion
