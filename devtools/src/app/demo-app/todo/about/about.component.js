/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
let AboutComponent = class AboutComponent {};
AboutComponent = __decorate(
  [
    Component({
      selector: 'app-about',
      template: `
    About component
    <a [routerLink]="">Home</a>
    <a [routerLink]="">Home</a>
    <a [routerLink]="">Home</a>
  `,
      imports: [RouterLink],
    }),
  ],
  AboutComponent,
);
export {AboutComponent};
//# sourceMappingURL=about.component.js.map
