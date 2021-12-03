import {CommonModule} from '@angular/common';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {NgModule} from '@angular/core';
import {CdkAccordionOverviewExample} from './cdk-accordion-overview/cdk-accordion-overview-example';

export {CdkAccordionOverviewExample};

const EXAMPLES = [CdkAccordionOverviewExample];

@NgModule({
  imports: [CommonModule, CdkAccordionModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkAccordionExamplesModule {}
