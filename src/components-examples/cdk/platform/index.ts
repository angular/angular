import {NgModule} from '@angular/core';
import {CdkPlatformOverviewExample} from './cdk-platform-overview/cdk-platform-overview-example';

export {CdkPlatformOverviewExample};

const EXAMPLES = [CdkPlatformOverviewExample];

@NgModule({
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkPlatformExamplesModule {}
