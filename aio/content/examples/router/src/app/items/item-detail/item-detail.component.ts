// #docplaster
// #docregion
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

import { ItemService }  from '../item.service';
import { Item } from '../item';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css']
})
export class ItemDetailComponent implements OnInit {
  item$: Observable<Item>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ItemService
  ) {}

  ngOnInit() {
    this.item$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getItem(params.get('id')))
    );
  }

  // #docregion redirect
  gotoItems(item: Item) {
    let itemId = item ? item.id : null;
    // Pass along the item id if available
    // so that the ItemList component can select that item.
    // Include a junk 'foo' property for fun.
    this.router.navigate(['/exclusive-items', { id: itemId, foo: 'foo' }]);
  }
  // #enddocregion redirect
}
