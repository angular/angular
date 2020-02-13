import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';
import {
  CdkVirtualScrollContextExample
} from './cdk-virtual-scroll-context/cdk-virtual-scroll-context-example';
import {
  CdkVirtualScrollCustomStrategyExample
} from './cdk-virtual-scroll-custom-strategy/cdk-virtual-scroll-custom-strategy-example';
import {
  CdkVirtualScrollDataSourceExample
} from './cdk-virtual-scroll-data-source/cdk-virtual-scroll-data-source-example';
import {CdkVirtualScrollDlExample} from './cdk-virtual-scroll-dl/cdk-virtual-scroll-dl-example';
import {
  CdkVirtualScrollFixedBufferExample
} from './cdk-virtual-scroll-fixed-buffer/cdk-virtual-scroll-fixed-buffer-example';
import {
  CdkVirtualScrollHorizontalExample
} from './cdk-virtual-scroll-horizontal/cdk-virtual-scroll-horizontal-example';
import {
  CdkVirtualScrollOverviewExample
} from './cdk-virtual-scroll-overview/cdk-virtual-scroll-overview-example';
import {
  CdkVirtualScrollTemplateCacheExample
} from './cdk-virtual-scroll-template-cache/cdk-virtual-scroll-template-cache-example';

export {
  CdkVirtualScrollContextExample,
  CdkVirtualScrollCustomStrategyExample,
  CdkVirtualScrollDataSourceExample,
  CdkVirtualScrollDlExample,
  CdkVirtualScrollFixedBufferExample,
  CdkVirtualScrollHorizontalExample,
  CdkVirtualScrollOverviewExample,
  CdkVirtualScrollTemplateCacheExample,
};

const EXAMPLES = [
  CdkVirtualScrollContextExample,
  CdkVirtualScrollCustomStrategyExample,
  CdkVirtualScrollDataSourceExample,
  CdkVirtualScrollDlExample,
  CdkVirtualScrollFixedBufferExample,
  CdkVirtualScrollHorizontalExample,
  CdkVirtualScrollOverviewExample,
  CdkVirtualScrollTemplateCacheExample,
];

@NgModule({
  imports: [ScrollingModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkScrollingExamplesModule {
}
