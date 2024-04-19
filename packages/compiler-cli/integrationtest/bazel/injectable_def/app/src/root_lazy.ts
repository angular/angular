/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, Optional, Self} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Service} from './root_service';

@Component({
  selector: 'lazy-route',
  template: '{{service}}:{{serviceInLazyInjector}}',
})
export class RouteComponent {
  service: boolean;
  serviceInLazyInjector: boolean;
  constructor(@Optional() service: Service, @Optional() @Self() lazyService: Service) {
    this.service = !!service;
    this.serviceInLazyInjector = !!lazyService;
  }
}

@NgModule({
  declarations: [RouteComponent],
  imports: [
    RouterModule.forChild([
      {path: '', pathMatch: 'prefix', component: RouteComponent},
    ]),
  ],
})
export class LazyModule {
}
