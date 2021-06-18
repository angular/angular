import {ChangeDetectionStrategy, Component} from '@angular/core';

/** @title Virtual scroll with view recycling disabled. */
@Component({
  selector: 'cdk-virtual-scroll-append-only-example',
  styleUrls: ['cdk-virtual-scroll-append-only-example.css'],
  templateUrl: 'cdk-virtual-scroll-append-only-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkVirtualScrollAppendOnlyExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
