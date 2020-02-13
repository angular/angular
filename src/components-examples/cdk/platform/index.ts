import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {CdkPlatformOverviewExample} from './cdk-platform-overview/cdk-platform-overview-example';

export {CdkPlatformOverviewExample};

const EXAMPLES = [CdkPlatformOverviewExample];

@NgModule({
  imports: [
    PlatformModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkPlatformExamplesModule {
}
