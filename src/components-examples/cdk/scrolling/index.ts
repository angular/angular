import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';
import {CdkVirtualScrollAppendOnlyExample} from './cdk-virtual-scroll-append-only/cdk-virtual-scroll-append-only-example';
import {CdkVirtualScrollContextExample} from './cdk-virtual-scroll-context/cdk-virtual-scroll-context-example';
import {CdkVirtualScrollCustomStrategyExample} from './cdk-virtual-scroll-custom-strategy/cdk-virtual-scroll-custom-strategy-example';
import {CdkVirtualScrollDataSourceExample} from './cdk-virtual-scroll-data-source/cdk-virtual-scroll-data-source-example';
import {CdkVirtualScrollDlExample} from './cdk-virtual-scroll-dl/cdk-virtual-scroll-dl-example';
import {CdkVirtualScrollFixedBufferExample} from './cdk-virtual-scroll-fixed-buffer/cdk-virtual-scroll-fixed-buffer-example';
import {CdkVirtualScrollHorizontalExample} from './cdk-virtual-scroll-horizontal/cdk-virtual-scroll-horizontal-example';
import {CdkVirtualScrollOverviewExample} from './cdk-virtual-scroll-overview/cdk-virtual-scroll-overview-example';
import {CdkVirtualScrollParentScrollingExample} from './cdk-virtual-scroll-parent-scrolling/cdk-virtual-scroll-parent-scrolling-example';
import {CdkVirtualScrollTemplateCacheExample} from './cdk-virtual-scroll-template-cache/cdk-virtual-scroll-template-cache-example';
import {CdkVirtualScrollWindowScrollingExample} from './cdk-virtual-scroll-window-scrolling/cdk-virtual-scroll-window-scrolling-example';
import {CommonModule} from '@angular/common';

export {
  CdkVirtualScrollAppendOnlyExample,
  CdkVirtualScrollContextExample,
  CdkVirtualScrollCustomStrategyExample,
  CdkVirtualScrollDataSourceExample,
  CdkVirtualScrollDlExample,
  CdkVirtualScrollFixedBufferExample,
  CdkVirtualScrollHorizontalExample,
  CdkVirtualScrollOverviewExample,
  CdkVirtualScrollTemplateCacheExample,
  CdkVirtualScrollParentScrollingExample,
  CdkVirtualScrollWindowScrollingExample,
};

const EXAMPLES = [
  CdkVirtualScrollAppendOnlyExample,
  CdkVirtualScrollContextExample,
  CdkVirtualScrollCustomStrategyExample,
  CdkVirtualScrollDataSourceExample,
  CdkVirtualScrollDlExample,
  CdkVirtualScrollFixedBufferExample,
  CdkVirtualScrollHorizontalExample,
  CdkVirtualScrollOverviewExample,
  CdkVirtualScrollTemplateCacheExample,
  CdkVirtualScrollParentScrollingExample,
  CdkVirtualScrollWindowScrollingExample,
];

@NgModule({
  imports: [CommonModule, ScrollingModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkScrollingExamplesModule {}
