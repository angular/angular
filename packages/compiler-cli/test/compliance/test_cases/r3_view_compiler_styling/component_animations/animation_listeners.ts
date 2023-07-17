import {Component, NgModule} from '@angular/core';

declare const animate: any;
declare const style: any;
declare const trigger: any;
declare const transition: any;

@Component({
  selector: 'my-cmp',
  template: `
    <div
      [@myAnimation]="exp"
      (@myAnimation.start)="onStart($event)"
      (@myAnimation.done)="onDone($event)"></div>
  `,
  animations: [
    trigger(
        'myAnimation',
        [
          transition(
              '* => state', [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))]),
        ]),
  ],
})
class MyComponent {
  exp: any;
  startEvent: any;
  doneEvent: any;
  onStart(event: any) {
    this.startEvent = event;
  }
  onDone(event: any) {
    this.doneEvent = event;
  }
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
