/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {PortalModule} from '@angular/cdk/portal';
import {ObserversModule} from '@angular/cdk/observers';
import {A11yModule} from '@angular/cdk/a11y';
import {MatTabBody, MatTabBodyPortal} from './tab-body';
import {MatTabContent} from './tab-content';
import {MatTabLabel} from './tab-label';
import {MatTabLabelWrapper} from './tab-label-wrapper';
import {MatTab} from './tab';
import {MatTabHeader} from './tab-header';
import {MatTabGroup} from './tab-group';
import {MatTabNav, MatTabLink} from './tab-nav-bar/tab-nav-bar';

@NgModule({
  imports: [
    CommonModule,
    MatCommonModule,
    PortalModule,
    MatRippleModule,
    ObserversModule,
    A11yModule,
  ],
  exports: [
    MatCommonModule,
    MatTabContent,
    MatTabLabel,
    MatTab,
    MatTabGroup,
    MatTabNav,
    MatTabLink,
  ],
  declarations: [
    MatTabContent,
    MatTabLabel,
    MatTab,
    MatTabGroup,
    MatTabNav,
    MatTabLink,

    // Private directives, should not be exported.
    MatTabBody,
    MatTabBodyPortal,
    MatTabLabelWrapper,
    MatTabHeader
  ]
})
export class MatTabsModule {
}
