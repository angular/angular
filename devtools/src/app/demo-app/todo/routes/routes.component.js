/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, Injectable} from '@angular/core';
let RoutesHomeComponent = class RoutesHomeComponent {
  constructor(activatedRoute) {
    this.activatedRoute = activatedRoute;
    this.routeQueryParmas = {'message': 'Hello from route param!!'};
  }
  ngOnInit() {
    this.routeData = this.activatedRoute.snapshot.data;
    this.routeParams = this.activatedRoute.snapshot.params;
    this.queryParams = this.activatedRoute.snapshot.queryParams;
  }
};
RoutesHomeComponent = __decorate(
  [
    Component({
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
    }),
  ],
  RoutesHomeComponent,
);
export {RoutesHomeComponent};
let RoutesAuxComponent = class RoutesAuxComponent {};
RoutesAuxComponent = __decorate(
  [
    Component({
      selector: 'app-routes-aux',
      template: 'Component Aux',
    }),
  ],
  RoutesAuxComponent,
);
export {RoutesAuxComponent};
let RoutesOneComponent = class RoutesOneComponent {};
RoutesOneComponent = __decorate(
  [
    Component({
      selector: 'app-routes-one',
      template: `<h1>Route 1 works</h1>`,
    }),
  ],
  RoutesOneComponent,
);
export {RoutesOneComponent};
let RoutesTwoComponent = class RoutesTwoComponent {};
RoutesTwoComponent = __decorate(
  [
    Component({
      selector: 'app-routes-two',
      template: `<h1>Route 2 works</h1>`,
    }),
  ],
  RoutesTwoComponent,
);
export {RoutesTwoComponent};
let RoutesStandaloneComponent = class RoutesStandaloneComponent {};
RoutesStandaloneComponent = __decorate(
  [
    Component({
      standalone: true,
      selector: 'app-routes-standalone',
      template: '<h1>Standalone Route</h1>',
    }),
  ],
  RoutesStandaloneComponent,
);
export {RoutesStandaloneComponent};
let Service1 = class Service1 {
  constructor() {
    this.value = `Service One Id: ${Math.floor(Math.random() * 500)}`;
  }
};
Service1 = __decorate([Injectable()], Service1);
export {Service1};
let Service2 = class Service2 {
  constructor() {
    this.value = `Service Two Id: ${Math.floor(Math.random() * 500)}`;
  }
};
Service2 = __decorate([Injectable()], Service2);
export {Service2};
let Service3 = class Service3 {
  constructor() {
    this.value = `Service Three Id: ${Math.floor(Math.random() * 500)}`;
  }
};
Service3 = __decorate([Injectable()], Service3);
export {Service3};
let Service4 = class Service4 {
  constructor() {
    this.value = `Service Four Id: ${Math.floor(Math.random() * 500)}`;
  }
};
Service4 = __decorate([Injectable()], Service4);
export {Service4};
//# sourceMappingURL=routes.component.js.map
