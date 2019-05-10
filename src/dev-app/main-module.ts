/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MAT_RIPPLE_GLOBAL_OPTIONS} from '@angular/material/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {DevAppComponent} from './dev-app';
import {DevAppDirectionality} from './dev-app/dev-app-directionality';
import {DevAppModule} from './dev-app/dev-app-module';
import {DEV_APP_ROUTES} from './dev-app/routes';
import {DevAppRippleOptions} from './ripple/ripple-options';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    DevAppModule,
    HttpClientModule,
    RouterModule.forRoot(DEV_APP_ROUTES),
  ],
  declarations: [
    DevAppComponent,
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useExisting: DevAppRippleOptions},
    {provide: Directionality, useClass: DevAppDirectionality},
  ],
  bootstrap: [DevAppComponent],
})
export class MainModule {
}
