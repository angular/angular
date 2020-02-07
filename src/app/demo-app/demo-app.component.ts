import { Component, ViewChild } from '@angular/core';
import { ZippyComponent } from './zippy/zippy.component';

@Component({
  templateUrl: './demo-app.component.html',
  styles: [
    `
      /deep/ body {
        max-width: 500px !important;
      }
    `,
  ],
})
export class DemoAppComponent {
  @ViewChild(ZippyComponent) zippy: ZippyComponent;

  getTitle() {
    if (!this.zippy || !this.zippy.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
}
