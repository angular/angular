/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollDispatchModule, VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatInkBar} from './ink-bar';
import {MatTab} from './tab';
import {MatTabBody} from './tab-body';
import {MatTabGroup} from './tab-group';
import {MatTabHeader} from './tab-header';
import {MatTabLabel} from './tab-label';
import {MatTabLabelWrapper} from './tab-label-wrapper';
import {MatTabLink, MatTabNav} from './tab-nav-bar/tab-nav-bar';


@NgModule({
  imports: [
    CommonModule,
    MatCommonModule,
    PortalModule,
    MatRippleModule,
    ObserversModule,
    ScrollDispatchModule,
  ],
  // Don't export all components because some are only to be used internally.
  exports: [
    MatCommonModule,
    MatTabGroup,
    MatTabLabel,
    MatTab,
    MatTabNav,
    MatTabLink,
  ],
  declarations: [
    MatTabGroup,
    MatTabLabel,
    MatTab,
    MatInkBar,
    MatTabLabelWrapper,
    MatTabNav,
    MatTabLink,
    MatTabBody,
    MatTabHeader
  ],
  providers: [VIEWPORT_RULER_PROVIDER],
})
export class MatTabsModule {}
