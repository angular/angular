/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkAccordion} from './accordion';
import {CdkAccordionItem} from './accordion-item';


@NgModule({
  exports: [CdkAccordion, CdkAccordionItem],
  declarations: [CdkAccordion, CdkAccordionItem],
})
export class CdkAccordionModule {}
