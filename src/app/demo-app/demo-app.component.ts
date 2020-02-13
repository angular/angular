import { Component, ViewChild } from '@angular/core';
import { ZippyComponent } from './zippy/zippy.component';

@Component({
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.css'],
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
