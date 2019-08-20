import {ChangeDetectionStrategy, Component} from '@angular/core';

/** @title Virtual scroll context variables */
@Component({
  selector: 'cdk-virtual-scroll-context-example',
  styleUrls: ['cdk-virtual-scroll-context-example.css'],
  templateUrl: 'cdk-virtual-scroll-context-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkVirtualScrollContextExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
