/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';

/** Root component for the dev-app demos. */
@Component({
  moduleId: module.id,
  selector: 'dev-app',
  template: '<dev-app-layout><router-outlet></router-outlet></dev-app-layout>',
  encapsulation: ViewEncapsulation.None,
})
export class DevAppComponent {
}


/** Home component which includes a welcome message for the dev-app. */
@Component({
  selector: 'home',
  template: `
    <p>Welcome to the development demos for Angular Material!</p>
    <p>Open the sidenav to select a demo.</p>
  `,
})
export class DevAppHome {}

@Component({
  template: `
    <h1>404</h1>
    <p>This page does not exist</p>
    <a mat-raised-button routerLink="/">Go back to the home page</a>
  `,
  host: {'class': 'mat-typography'},
})
export class DevApp404 {}
