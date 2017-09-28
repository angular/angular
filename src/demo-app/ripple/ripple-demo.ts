import {Component, ViewChild} from '@angular/core';
import {MatRipple} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'ripple-demo',
  templateUrl: 'ripple-demo.html',
  styleUrls: ['ripple-demo.css'],
})
export class RippleDemo {
  @ViewChild(MatRipple) ripple: MatRipple;

  centered = false;
  disabled = false;
  unbounded = false;
  rounded = false;
  radius: number;
  rippleSpeed = 1;
  rippleColor = '';

  disableButtonRipples = false;

  launchRipple(persistent = false) {
    if (this.ripple) {
      this.ripple.launch(0, 0, { centered: true, persistent });
    }
  }

  fadeOutAll() {
    if (this.ripple) {
      this.ripple.fadeOutAll();
    }
  }

}
