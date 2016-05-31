import {Component, trigger, state, animate, transition, style} from '@angular/core';

@Component({
  selector: "animate-cmp",
  animations: [
    trigger('openClose', [
      state('closed, void',
        style({ height:"0px", color: "maroon", borderColor: "maroon" })),
      state('open',
        style({ height:"*", borderColor:"green", color:"green" })),
      transition("* => *", animate(500))
    ])
  ],
  template: `
    <button (click)="setAsOpen()">Open</button>
    <button (click)="setAsClosed()">Closed</button>
    <hr />
    <div @openClose="stateExpression">
      Look at this box
    </div>
  `
})
export class AnimateCmp {
  stateExpression:string;
  constructor() {
    this.setAsClosed();
  }
  setAsOpen() {
    this.stateExpression = 'open';
  }
  setAsClosed() {
    this.stateExpression = 'closed';
  }
}
