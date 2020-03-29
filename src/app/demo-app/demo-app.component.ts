import { Component, ViewChild } from '@angular/core';
import { ZippyComponent } from './zippy/zippy.component';

@Component({
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
})
export class DemoAppComponent {
  @ViewChild(ZippyComponent) zippy: ZippyComponent;

  getTitle(): '► Click to expand' | '▼ Click to collapse' {
    if (!this.zippy || !this.zippy.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
}
