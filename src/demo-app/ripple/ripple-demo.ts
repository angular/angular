import {Component, ViewChild} from '@angular/core';
import {MdRipple} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'ripple-demo',
  templateUrl: 'ripple-demo.html',
  styleUrls: ['ripple-demo.css'],
})
export class RippleDemo {
  @ViewChild(MdRipple) manualRipple: MdRipple;

  centered = false;
  disabled = false;
  unbounded = false;
  rounded = false;
  maxRadius: number = null;
  rippleSpeed = 1;
  rippleColor = '';
  rippleBackgroundColor = '';

  disableButtonRipples = false;

  doManualRipple() {
    if (this.manualRipple) {
      window.setTimeout(() => this.manualRipple.start(), 10);
      window.setTimeout(() => this.manualRipple.end(0, 0), 500);
    }
  }
}
