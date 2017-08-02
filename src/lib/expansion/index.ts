/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompatibilityModule, StyleModule, UNIQUE_SELECTION_DISPATCHER_PROVIDER} from '../core';
import {
  MdExpansionPanelHeader,
  MdExpansionPanelDescription,
  MdExpansionPanelTitle
} from './expansion-panel-header';
import {
  MdExpansionPanel,
  MdExpansionPanelActionRow,
} from './expansion-panel';
import {
  CdkAccordion,
  MdAccordion,
} from './accordion';

@NgModule({
  imports: [CompatibilityModule, CommonModule, StyleModule],
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
