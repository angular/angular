import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import { Component, OnInit }              from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { Crisis, CrisisService } from './crisis.service';
import { Observable }            from 'rxjs/Observable';

@Component({
  // #docregion relative-navigation-router-link
  template: `
    <ul class="items">
      <li *ngFor="let crisis of crises | async">
        <a [routerLink]="[crisis.id]"
           [class.selected]="isSelected(crisis)">
          <span class="badge">{{ crisis.id }}</span>
          {{ crisis.name }}
        </a>
      </li>
    </ul>`
  // #enddocregion relative-navigation-router-link
})
export class CrisisListComponent implements OnInit {
  crises: Observable<Crisis[]>;
  selectedId: number;

  constructor(
    private service: CrisisService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.crises = this.route.params
      .switchMap((params: Params) => {
        this.selectedId = +params['id'];
        return this.service.getCrises();
      });
  }

  isSelected(crisis: Crisis) {
    return crisis.id === this.selectedId;
  }
}
