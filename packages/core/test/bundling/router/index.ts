/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {APP_BASE_HREF} from '@angular/common';
import {Component, NgModule, OnInit, ɵNgModuleFactory as NgModuleFactory} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {ActivatedRoute, Router, RouterModule, Routes} from '@angular/router';

@Component({
  selector: 'app-list',
  template: `
  <ul>
    <li><a routerLink="/item/1" routerLinkActive="active">List Item 1</a></li>
    <li><a routerLink="/item/2" routerLinkActive="active">List Item 2</a></li>
    <li><a routerLink="/item/3" routerLinkActive="active">List Item 3</a></li>
  </ul>
  `,
})
class ListComponent {
}

@Component({
  selector: 'app-item',
  template: `
  Item {{id}}
  <p><button (click)="viewList()">Back to List</button></p>`,
})
class ItemComponent implements OnInit {
  id = -1;
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramsMap => {
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
})
class RootComponent {
  constructor() {}
}

const ROUTES: Routes = [
  {path: '', redirectTo: '/list', pathMatch: 'full'}, {path: 'list', component: ListComponent},
  {path: 'item/:id', component: ItemComponent}
];

@NgModule({
  declarations: [RootComponent, ListComponent, ItemComponent],
  imports: [BrowserModule, RouterModule.forRoot(ROUTES)],
  providers: [{provide: APP_BASE_HREF, useValue: ''}]
})
class RouteExampleModule {
  ngDoBootstrap(app: any) {
    app.bootstrap(RootComponent);
  }
}

(window as any).waitForApp = platformBrowser().bootstrapModuleFactory(
    new NgModuleFactory(RouteExampleModule), {ngZone: 'noop'});
