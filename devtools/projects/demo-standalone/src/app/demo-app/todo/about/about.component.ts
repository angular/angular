/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [RouterOutlet, RouterLink],
  template: `
    About component
    <a [routerLink]="">Home</a>
    <a [routerLink]="">Home</a>
    <a [routerLink]="">Home</a>
  `,
})
export class AboutComponent {}
