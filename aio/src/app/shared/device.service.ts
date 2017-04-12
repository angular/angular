// Inquire about the state of the user's device
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class DeviceService {

  // Show sidenav next to the main doc when display width on current device is greater than this.
  readonly sideBySideWidth = 1032;

  displayWidth = new ReplaySubject<number>(1);

  constructor() {

    if (window) {
      window.onresize = () => this.onResize();
      this.onResize();
    } else {
      // when no window, pretend the display is wide.
      this.onResize(this.sideBySideWidth + 1);
    }
  }

  onResize(width?: number) {
    this.displayWidth.next(width == null ? window.innerWidth : width);
  }

}
