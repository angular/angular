/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

const ROUTES = [
  // Paths that contain components for test/demo purposes:
  {
    path: '',
    loadChildren: () => import('./playground').then(mod => mod.PlaygroundModule),
  },

  // Paths below are used for e2e testing:
  {
    path: 'e2e/basic',
    loadChildren: () => import('./e2e/basic/basic').then(mod => mod.BasicModule),
  },
  {
    path: 'e2e/lcp-check',
    loadChildren: () => import('./e2e/lcp-check/lcp-check').then(mod => mod.LcpCheckModule),
  },
  {
    path: 'e2e/preconnect-check',
    loadChildren: () =>
        import('./e2e/preconnect-check/preconnect-check').then(mod => mod.PreconnectCheckModule),
  },
  {
    path: 'e2e/image-distortion-passing',
    loadChildren: () => import('./e2e/image-distortion/image-distortion')
                            .then(mod => mod.ImageDistortionPassingModule),
  },
  {
    path: 'e2e/image-distortion-failing',
    loadChildren: () => import('./e2e/image-distortion/image-distortion')
                            .then(mod => mod.ImageDistortionFailingModule),
  },
  {
    path: 'e2e/oversized-image-passing',
    loadChildren: () => import('./e2e/oversized-image/oversized-image')
                            .then(mod => mod.OversizedImagePassingModule),
  },
  {
    path: 'e2e/oversized-image-failing',
    loadChildren: () => import('./e2e/oversized-image/oversized-image')
                            .then(mod => mod.OversizedImageFailingModule),
  },
  {
    path: 'e2e/fill-mode-passing',
    loadChildren: () => import('./e2e/fill-mode/fill-mode').then(mod => mod.FillModePassingModule),
  },
  {
    path: 'e2e/fill-mode-failing',
    loadChildren: () => import('./e2e/fill-mode/fill-mode').then(mod => mod.FillModeFailingModule),
  },
];

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class RootComponent {
}
@NgModule({
  declarations: [RootComponent],
  imports: [BrowserModule, RouterModule.forRoot(ROUTES)],
})
class RootModule {
  ngDoBootstrap(app: any) {
    app.bootstrap(RootComponent);
  }
}

(window as any).waitForApp = platformBrowser().bootstrapModule(RootModule);
