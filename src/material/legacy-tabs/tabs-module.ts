/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {ObserversModule} from '@angular/cdk/observers';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatLegacyInkBar} from './ink-bar';
import {MatLegacyTab} from './tab';
import {MatLegacyTabBody, MatLegacyTabBodyPortal} from './tab-body';
import {MatLegacyTabGroup} from './tab-group';
import {MatLegacyTabHeader} from './tab-header';
import {MatLegacyTabLink, MatLegacyTabNav, MatLegacyTabNavPanel} from './tab-nav-bar/tab-nav-bar';
import {MatLegacyTabLabel} from './tab-label';
import {MatLegacyTabContent} from './tab-content';
import {MatLegacyTabLabelWrapper} from './tab-label-wrapper';

@NgModule({
  imports: [
    CommonModule,
    MatCommonModule,
    PortalModule,
    MatRippleModule,
    ObserversModule,
    A11yModule,
  ],
  // Don't export all components because some are only to be used internally.
  exports: [
    MatCommonModule,
    MatLegacyTabGroup,
    MatLegacyTabLabel,
    MatLegacyTab,
    MatLegacyTabNav,
    MatLegacyTabNavPanel,
    MatLegacyTabLink,
    MatLegacyTabContent,
  ],
  declarations: [
    MatLegacyTabGroup,
    MatLegacyTabLabel,
    MatLegacyTab,
    MatLegacyInkBar,
    MatLegacyTabLabelWrapper,
    MatLegacyTabNav,
    MatLegacyTabNavPanel,
    MatLegacyTabLink,
    MatLegacyTabBody,
    MatLegacyTabBodyPortal,
    MatLegacyTabHeader,
    MatLegacyTabContent,
  ],
})
export class MatLegacyTabsModule {}
