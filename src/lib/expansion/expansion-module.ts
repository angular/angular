/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {UNIQUE_SELECTION_DISPATCHER_PROVIDER} from '@angular/cdk/collections';
import {A11yModule} from '@angular/cdk/a11y';
import {CdkAccordion, MatAccordion} from './accordion';
import {MatExpansionPanel, MatExpansionPanelActionRow} from './expansion-panel';
import {
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from './expansion-panel-header';


@NgModule({
  imports: [CommonModule, A11yModule],
  exports: [
    CdkAccordion,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelActionRow,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription
  ],
  declarations: [
    CdkAccordion,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelActionRow,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription
  ],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER]
})
export class MatExpansionModule {}
