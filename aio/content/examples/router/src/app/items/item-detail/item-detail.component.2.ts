// Snapshot version
// #docregion
import { Component, OnInit }      from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable }             from 'rxjs';

import { ItemService } from '../item.service';
import { Item } from '../item';

@Component({
  selector: 'app-item-detaill',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css']
})
export class ItemDetailComponent implements OnInit  {
  item$: Observable<Item>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ItemService
  ) {}

  // #docregion snapshot
  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');

    this.item$ = this.service.getItem(id);
  }
  // #enddocregion snapshot

  gotoItems() {
    this.router.navigate(['/items']);
  }
}
