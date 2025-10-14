/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
let AppComponent = class AppComponent {
  constructor() {
    this.router = inject(Router);
  }
};
AppComponent = __decorate(
  [
    Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.scss'],
      imports: [RouterOutlet],
    }),
  ],
  AppComponent,
);
export {AppComponent};
let EmptyComponent = class EmptyComponent {};
EmptyComponent = __decorate(
  [
    Component({
      selector: 'empty-component',
      template: ``,
    }),
  ],
  EmptyComponent,
);
export {EmptyComponent};
let OtherAppComponent = class OtherAppComponent {};
OtherAppComponent = __decorate(
  [
    Component({
      selector: 'other-app',
      template: `
    @defer  {
        <empty-component/>
    }
    @placeholder (minimum 2s) {
        <b>Stuff will be loaded here</b>
    }
  `,
      imports: [EmptyComponent],
    }),
  ],
  OtherAppComponent,
);
export {OtherAppComponent};
//# sourceMappingURL=app.component.js.map
