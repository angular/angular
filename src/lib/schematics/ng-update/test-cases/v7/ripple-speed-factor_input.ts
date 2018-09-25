import {Component} from '@angular/core';

class MatRipple {
  speedFactor: number;
}

class A {
  self = {me: this.ripple};

  constructor(protected ripple: MatRipple) {}

  onClick() {
    this.ripple.speedFactor = 0.5;
    this.self.me.speedFactor = 1.5;
  }
}

const b = new MatRipple();
const myConstant = 1;

b.speedFactor = 0.5 + myConstant;

@Component({
  template: `<div matRipple [matRippleSpeedFactor]="0.5"></div>`
})
class C {}

@Component({
  template: `<div matRipple [matRippleSpeedFactor]="myValue"></div>`
})
class D {
  myValue = 1.5;
}
