/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CompatibilityModule, UNIQUE_SELECTION_DISPATCHER_PROVIDER} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';
import {CdkAccordion, MdAccordion} from './accordion';
import {MdExpansionPanel, MdExpansionPanelActionRow} from './expansion-panel';
import {
  MdExpansionPanelDescription,
  MdExpansionPanelHeader,
  MdExpansionPanelTitle,
} from './expansion-panel-header';


@NgModule({
  imports: [CompatibilityModule, CommonModule, A11yModule],
  exports: [
    CdkAccordion,
    MdAccordion,
    MdExpansionPanel,
    MdExpansionPanelActionRow,
    MdExpansionPanelHeader,
    MdExpansionPanelTitle,
    MdExpansionPanelDescription
  ],
  declarations: [
    CdkAccordion,
    MdAccordion,
    MdExpansionPanel,
    MdExpansionPanelActionRow,
    MdExpansionPanelHeader,
    MdExpansionPanelTitle,
    MdExpansionPanelDescription
  ],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER]
})
export class MdExpansionModule {}

export {
  CdkAccordion,
  MdAccordion,
  MdAccordionDisplayMode
} from './accordion';
export {AccordionItem} from './accordion-item';
export {
  MdExpansionPanel,
  MdExpansionPanelState,
  MdExpansionPanelActionRow
} from './expansion-panel';
export {
  MdExpansionPanelHeader,
  MdExpansionPanelDescription,
  MdExpansionPanelTitle
} from './expansion-panel-header';

