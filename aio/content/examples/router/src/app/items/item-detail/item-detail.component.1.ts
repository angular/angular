// #docplaster
// #docregion
// #docregion rxjs-operator-import
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-operator-import
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
// #docregion imports
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
// #enddocregion imports

import { ItemService } from '../item.service';
import { Item } from '../item';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css']
})
export class ItemDetailComponent implements OnInit  {
  item$: Observable<Item>;

  // #docregion ctor
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ItemService
  ) {}
  // #enddocregion ctor

  // #docregion ngOnInit
  ngOnInit() {
    this.item$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getItem(params.get('id')))
    );
  }
  // #enddocregion ngOnInit

  // #docregion gotoHeroes
  gotoItems() {
    this.router.navigate(['/items']);
  }
  // #enddocregion gotoHeroes
}
