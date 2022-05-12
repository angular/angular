/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, importProvidersFrom} from '@angular/core';
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {BasicComponent} from './basic/basic';
import {LcpCheckComponent} from './lcp-check/lcp-check';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
})
export class RootComponent {
}

const ROUTES = [
  {path: '', component: BasicComponent},  //
  {path: 'lcp-check', component: LcpCheckComponent}
];

bootstrapApplication(RootComponent, {
  providers: [
    provideProtractorTestingSupport(),  //
    importProvidersFrom(RouterModule.forRoot(ROUTES))
  ],
});
