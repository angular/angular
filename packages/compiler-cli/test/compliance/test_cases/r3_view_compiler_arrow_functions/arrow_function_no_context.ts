import {Component, signal} from '@angular/core';

@Component({
  template: `
    <button (click)="sigA.update(value => value + 1)">Increment A</button>
    <button (click)="sigA.update(value => value - 1)">Decrement A</button>
    <button (click)="sigB.update(value => value + 1)">Increment B</button>
  `
})
export class TestComp {
  sigA = signal(1);
  sigB = signal(2);
}
