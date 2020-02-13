import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {CdkClipboardOverviewExample} from './cdk-clipboard-overview/cdk-clipboard-overview-example';

export {CdkClipboardOverviewExample};

const EXAMPLES = [CdkClipboardOverviewExample];

@NgModule({
  imports: [ClipboardModule, FormsModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkClipboardExamplesModule {
}
