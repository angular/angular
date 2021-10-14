/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';
import {Overlay} from './overlay';
import {
  CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
  CdkConnectedOverlay,
  CdkOverlayOrigin,
} from './overlay-directives';

@NgModule({
  imports: [BidiModule, PortalModule, ScrollingModule],
  exports: [CdkConnectedOverlay, CdkOverlayOrigin, ScrollingModule],
  declarations: [CdkConnectedOverlay, CdkOverlayOrigin],
  providers: [Overlay, CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER],
})
export class OverlayModule {}
