/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {ObserversModule} from '@angular/cdk/observers';
import {ScrollDispatchModule, VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';
import {MdCommonModule, MdRippleModule} from '../core';
import {MdTab} from './tab';
import {MdTabGroup} from './tab-group';
import {MdTabLabel} from './tab-label';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdTabLink, MdTabNav} from './tab-nav-bar/tab-nav-bar';
import {MdInkBar} from './ink-bar';
import {MdTabBody} from './tab-body';
import {MdTabHeader} from './tab-header';


@NgModule({
  imports: [
    CommonModule,
    MdCommonModule,
    PortalModule,
    MdRippleModule,
    ObserversModule,
    ScrollDispatchModule,
  ],
  // Don't export all components because some are only to be used internally.
  exports: [
    MdCommonModule,
    MdTabGroup,
    MdTabLabel,
    MdTab,
    MdTabNav,
    MdTabLink,
  ],
  declarations: [
    MdTabGroup,
    MdTabLabel,
    MdTab,
    MdInkBar,
    MdTabLabelWrapper,
    MdTabNav,
    MdTabLink,
    MdTabBody,
    MdTabHeader
  ],
  providers: [VIEWPORT_RULER_PROVIDER],
})
export class MdTabsModule {}


export * from './tab-group';
export {MdInkBar} from './ink-bar';
export {MdTabBody, MdTabBodyOriginState, MdTabBodyPositionState} from './tab-body';
export {MdTabHeader, ScrollDirection} from './tab-header';
export {MdTabLabelWrapper} from './tab-label-wrapper';
export {MdTab} from './tab';
export {MdTabLabel} from './tab-label';
export {MdTabNav, MdTabLink} from './tab-nav-bar/index';
