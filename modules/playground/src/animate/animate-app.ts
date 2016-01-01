import {Component} from 'angular2/core';

@Component({
  selector: 'animate-app',
  template: `
    <h1>The box is {{visible ? 'visible' : 'hidden'}}</h1>
    <div class="ng-animate box" *ngIf="visible"></div>
    <button (click)="visible = !visible">Animate</button>
  `
})
export class AnimateApp {
  visible: boolean = false;
}
