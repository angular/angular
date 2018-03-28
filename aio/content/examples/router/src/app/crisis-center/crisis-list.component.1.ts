
import { Component, OnInit }        from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Crisis, CrisisService } from './crisis.service';
import { Observable }            from 'rxjs';
import { switchMap }             from 'rxjs/operators';

@Component({
  // #docregion relative-navigation-router-link
  template: `
    <ul class="items">
      <li *ngFor="let crisis of crises$ | async"
        [class.selected]="crisis.id === selectedId">
        <a [routerLink]="[crisis.id]">
          <span class="badge">{{ crisis.id }}</span>{{ crisis.name }}
        </a>
      </li>
    </ul>

    <router-outlet></router-outlet>
    `
  // #enddocregion relative-navigation-router-link
})
export class CrisisListComponent implements OnInit {
  crises$: Observable<Crisis[]>;
  selectedId: number;


  constructor(
    private service: CrisisService,
    private route: ActivatedRoute
  ) {}


  ngOnInit() {
    this.crises$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.selectedId = +params.get('id');
        return this.service.getCrises();
      })
    );
  }
}
