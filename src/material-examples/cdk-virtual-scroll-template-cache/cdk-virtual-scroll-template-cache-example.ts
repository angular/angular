import {ChangeDetectionStrategy, Component} from '@angular/core';

/** @title Virtual scroll with no template caching */
@Component({
  selector: 'cdk-virtual-scroll-template-cache-example',
  styleUrls: ['cdk-virtual-scroll-template-cache-example.css'],
  templateUrl: 'cdk-virtual-scroll-template-cache-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkVirtualScrollTemplateCacheExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
