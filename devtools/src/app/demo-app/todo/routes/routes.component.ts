/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-routes-home',
  standalone: false,
  template: `
    <h1>home works!</h1>
    <div style="display:flex; flex-direction: column;">
      <a routerLink="/demo-app/todos/routes/home">Home</a>
      <a routerLink="/demo-app/todos/routes/route-one">Route One</a>
      <a routerLink="/demo-app/todos/routes/route-two">Route Two</a>
      <a routerLink="/demo-app/todos/routes/route-params/hello">Route Params</a>
      <a routerLink="/demo-app/todos/routes/route-query-params" [queryParams]="routeQueryParmas"
        >Route Query Params</a
      >
      <a routerLink="/demo-app/todos/routes/route-data">Route Data</a>
    </div>
    <hr />
    <div class="flex items-center border-2 border-dashed border-gray-600 p-2">
      <h1>Route Data:&nbsp;&nbsp;</h1>
      <pre class="p-2 bg-gray-100">{{ routeData | json }}</pre>
    </div>
    <br />
    <div class="flex items-center border-2 border-dashed border-gray-600 p-2">
      <h1>Route Params:&nbsp;&nbsp;</h1>
      <pre class="p-2 bg-gray-100">{{ routeParams | json }}</pre>
    </div>
    <br />
    <div
      class="flex items-center border-2 border-dashed border-gray-600
      p-2"
    >
      <h1>Qquery Params:&nbsp;&nbsp;</h1>
      <pre class="p-2 bg-gray-100">{{ queryParams | json }}</pre>
    </div>
  `,
})
export class RoutesHomeComponent {
  routeData: any;
  routeParams: any;
  queryParams: any;

  routeQueryParmas = {'message': 'Hello from route param!!'};

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeData = this.activatedRoute.snapshot.data;
    this.routeParams = this.activatedRoute.snapshot.params;
    this.queryParams = this.activatedRoute.snapshot.queryParams;
  }
}

@Component({
  selector: 'app-routes-aux',
  template: 'Component Aux',
})
export class RoutesAuxComponent {}

@Component({
  selector: 'app-routes-one',
  template: `<h1>Route 1 works</h1>`,
})
export class RoutesOneComponent {}

@Component({
  selector: 'app-routes-two',
  template: `<h1>Route 2 works</h1>`,
})
export class RoutesTwoComponent {}

@Component({
  standalone: true,
  selector: 'app-routes-standalone',
  template: '<h1>Standalone Route</h1>',
})
export class RoutesStandaloneComponent {}

@Injectable()
export class Service1 {
  value = `Service One Id: ${Math.floor(Math.random() * 500)}`;
}

@Injectable()
export class Service2 {
  value = `Service Two Id: ${Math.floor(Math.random() * 500)}`;
}

@Injectable()
export class Service3 {
  value = `Service Three Id: ${Math.floor(Math.random() * 500)}`;
}

@Injectable()
export class Service4 {
  value = `Service Four Id: ${Math.floor(Math.random() * 500)}`;
}
