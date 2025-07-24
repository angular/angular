/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_BASE_HREF} from '@angular/common';
import {Component, OnInit, provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {
  ActivatedRoute,
  ParamMap,
  provideRouter,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Routes,
} from '@angular/router';

@Component({
  selector: 'app-list',
  template: `
  <ul>
    <li><a routerLink="/item/1" routerLinkActive="active">List Item 1</a></li>
    <li><a routerLink="/item/2" routerLinkActive="active">List Item 2</a></li>
    <li><a routerLink="/item/3" routerLinkActive="active">List Item 3</a></li>
  </ul>
  `,
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
})
class ListComponent {}

@Component({
  selector: 'app-item',
  template: `
  Item {{id}}
  <p><button (click)="viewList()">Back to List</button></p>`,
  standalone: true,
})
class ItemComponent implements OnInit {
  id = -1;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramsMap: ParamMap) => {
      this.id = +paramsMap.get('id')!;
    });
  }

  viewList() {
    this.router.navigate(['/list']);
  }
}

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterOutlet],
})
class RootComponent {}

const ROUTES: Routes = [
  {path: '', redirectTo: '/list', pathMatch: 'full'},
  {path: 'list', component: ListComponent},
  {path: 'item/:id', component: ItemComponent},
];

(window as any).waitForApp = bootstrapApplication(RootComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(ROUTES),
    {provide: APP_BASE_HREF, useValue: ''},
  ],
});
