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

import {BasicComponent} from './e2e/basic/basic';
import {LcpCheckComponent} from './e2e/lcp-check/lcp-check';
import {PreconnectCheckComponent} from './e2e/preconnect-check/preconnect-check';
import {PlaygroundComponent} from './playground';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
})
export class RootComponent {
}

const ROUTES = [
  // Paths that contain components for test/demo purposes:
  {path: '', component: PlaygroundComponent},

  // Paths below are used for e2e testing:
  {path: 'e2e/basic', component: BasicComponent},
  {path: 'e2e/lcp-check', component: LcpCheckComponent},
  {path: 'e2e/preconnect-check', component: PreconnectCheckComponent}
];

bootstrapApplication(RootComponent, {
  providers: [
    provideProtractorTestingSupport(),  //
    importProvidersFrom(RouterModule.forRoot(ROUTES))
  ],
});
