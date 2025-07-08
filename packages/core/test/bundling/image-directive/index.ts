/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/compiler';
import {Component, importProvidersFrom} from '../../../src/core';
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {BasicComponent} from './e2e/basic/basic';
import {FillModeFailingComponent, FillModePassingComponent} from './e2e/fill-mode/fill-mode';
import {
  ImageDistortionFailingComponent,
  ImageDistortionPassingComponent,
} from './e2e/image-distortion/image-distortion';
import {ImagePerfWarningsLazyComponent} from './e2e/image-perf-warnings-lazy/image-perf-warnings-lazy';
import {ImagePerfWarningsOversizedComponent} from './e2e/image-perf-warnings-oversized/image-perf-warnings-oversized';
import {SvgNoOversizedPerfWarningsComponent} from './e2e/image-perf-warnings-oversized/svg-no-perf-oversized-warnings';
import {LcpCheckComponent} from './e2e/lcp-check/lcp-check';
import {
  OversizedImageComponentFailing,
  OversizedImageComponentPassing,
} from './e2e/oversized-image/oversized-image';
import {PreconnectCheckComponent} from './e2e/preconnect-check/preconnect-check';
import {PlaygroundComponent} from './playground';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
})
export class RootComponent {}

const ROUTES = [
  // Paths that contain components for test/demo purposes:
  {path: '', component: PlaygroundComponent},

  // Paths below are used for e2e testing:
  {path: 'e2e/basic', component: BasicComponent},
  {path: 'e2e/lcp-check', component: LcpCheckComponent},
  {path: 'e2e/image-perf-warnings-lazy', component: ImagePerfWarningsLazyComponent},
  {path: 'e2e/image-perf-warnings-oversized', component: ImagePerfWarningsOversizedComponent},
  {path: 'e2e/svg-no-perf-oversized-warnings', component: SvgNoOversizedPerfWarningsComponent},
  {path: 'e2e/preconnect-check', component: PreconnectCheckComponent},
  {path: 'e2e/image-distortion-passing', component: ImageDistortionPassingComponent},
  {path: 'e2e/image-distortion-failing', component: ImageDistortionFailingComponent},
  {path: 'e2e/oversized-image-passing', component: OversizedImageComponentPassing},
  {path: 'e2e/oversized-image-failing', component: OversizedImageComponentFailing},
  {path: 'e2e/fill-mode-passing', component: FillModePassingComponent},
  {path: 'e2e/fill-mode-failing', component: FillModeFailingComponent},
];

bootstrapApplication(RootComponent, {
  providers: [
    provideProtractorTestingSupport(), //
    importProvidersFrom(RouterModule.forRoot(ROUTES)),
  ],
});
