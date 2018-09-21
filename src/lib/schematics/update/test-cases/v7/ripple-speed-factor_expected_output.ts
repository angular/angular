import {Component} from '@angular/core';

class MatRipple {
  speedFactor: number;
}

class A {
  self = {me: this.ripple};

  constructor(protected ripple: MatRipple) {}

  onClick() {
    this.ripple.animation = {enterDuration: 900};
    this.self.me.animation = {enterDuration: 300};
  }
}

const b = new MatRipple();
const myConstant = 1;

b.animation = /** TODO: Cleanup duration calculation. */ {enterDuration: 450 / (0.5 + myConstant)};

@Component({
  template: `<div matRipple [matRippleAnimation]="{enterDuration: 900}"></div>`
})
class C {}

@Component({
  template: `<div matRipple [matRippleAnimation]="{enterDuration: (450 / (myValue))}"></div>`
})
class D {
  myValue = 1.5;
}
