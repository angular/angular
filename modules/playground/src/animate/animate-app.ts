import {Component, View, NgIf} from 'angular2/angular2';

@Component({selector: 'animate-app'})
@View({
  directives: [NgIf],
  template: `
    <h1>The box is {{visible ? 'visible' : 'hidden'}}</h1>
    <div class="ng-animate box" *ngIf="visible"></div>
    <button (click)="visible = !visible">Animate</button>
  `
})
export class AnimateApp {
  visible: boolean = false;
}
