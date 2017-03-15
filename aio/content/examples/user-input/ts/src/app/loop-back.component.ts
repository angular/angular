// #docregion
import { Component } from '@angular/core';
// #docregion loop-back-component
@Component({
  selector: 'loop-back',
  template: `
    <input #box (keyup)="0">
    <p>{{box.value}}</p>
  `
})
export class LoopbackComponent { }
// #enddocregion loop-back-component
