/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {UNIQUE_SELECTION_DISPATCHER_PROVIDER} from '@angular/cdk/collections';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {A11yModule} from '@angular/cdk/a11y';
import {PortalModule} from '@angular/cdk/portal';
import {MatAccordion} from './accordion';
import {MatExpansionPanelContent} from './expansion-panel-content';
import {
  MatExpansionPanel,
  MatExpansionPanelActionRow,
  MatExpansionPanelBase
} from './expansion-panel';
import {
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from './expansion-panel-header';


@NgModule({
  imports: [CommonModule, A11yModule, CdkAccordionModule, PortalModule],
  exports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelActionRow,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionPanelContent,
  ],
  declarations: [
    MatExpansionPanelBase,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelActionRow,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionPanelContent,
  ],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER]
})
export class MatExpansionModule {}
