/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// #docregion activated-route
import {Component, NgModule} from '@angular/core';
// #enddocregion activated-route
import {BrowserModule} from '@angular/platform-browser';
// #docregion activated-route
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
// #enddocregion activated-route

// #docregion activated-route

@Component({
  // #enddocregion activated-route
  selector: 'example-app',
  template: '...',
  standalone: false,
})
export class ActivatedRouteComponent {
  constructor(route: ActivatedRoute) {
    const id: Observable<string> = route.params.pipe(map((p) => p['id']));
    const url: Observable<string> = route.url.pipe(map((segments) => segments.join('')));
    // route.data includes both `data` and `resolve`
    const user = route.data.pipe(map((d) => d['user']));
  }
}
// #enddocregion activated-route

@NgModule({
  imports: [BrowserModule, RouterModule.forRoot([])],
  declarations: [ActivatedRouteComponent],
  bootstrap: [ActivatedRouteComponent],
})
export class AppModule {}
