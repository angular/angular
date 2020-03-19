// #docplaster
// #docregion
// TODO: Feature Componetized like CrisisCenter
// #docregion rxjs-imports
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-imports
import { Component, OnInit } from '@angular/core';
// #docregion import-router
import { ActivatedRoute } from '@angular/router';
// #enddocregion import-router

import { ItemService }  from '../item.service';
import { Item } from '../item';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
// #docregion ctor
export class ItemListComponent implements OnInit {
  items$: Observable<Item[]>;
  selectedId: number;

  constructor(
    private service: ItemService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.items$ = this.route.paramMap.pipe(
      switchMap(params => {
        // (+) before `params.get()` turns the string into a number
        this.selectedId = +params.get('id');
        return this.service.getItems();
      })
    );
  }
  // #enddocregion ctor
// #docregion ctor
}
// #enddocregion
