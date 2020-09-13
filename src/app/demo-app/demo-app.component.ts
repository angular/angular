import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ZippyComponent } from './zippy/zippy.component';

@Component({
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoAppComponent {
  @ViewChild(ZippyComponent) zippy: ZippyComponent;
  @ViewChild('elementReference') elementRef: ElementRef;

  getTitle(): '► Click to expand' | '▼ Click to collapse' {
    if (!this.zippy || !this.zippy.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
}
