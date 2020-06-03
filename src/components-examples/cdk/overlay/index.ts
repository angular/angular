import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

import {CdkOverlayBasicExample} from './cdk-overlay-basic/cdk-overlay-basic-example';

export {CdkOverlayBasicExample};

const EXAMPLES = [CdkOverlayBasicExample];

@NgModule({
  imports: [OverlayModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkOverlayExamplesModule {}
