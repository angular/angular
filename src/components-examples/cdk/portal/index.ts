import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {
  CdkPortalOverviewExample,
  ComponentPortalExample
} from './cdk-portal-overview/cdk-portal-overview-example';

export {CdkPortalOverviewExample, ComponentPortalExample};

const EXAMPLES = [
  CdkPortalOverviewExample,
  ComponentPortalExample,
];

@NgModule({
  imports: [PortalModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkPortalExamplesModule {
}
