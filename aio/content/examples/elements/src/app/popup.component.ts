// #docregion
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'my-popup',
  template: 'Popup: {{message}}',
  host: {
    '[@state]': 'state',
    '(@state.done)': 'onAnimationDone($event)',
  },
  animations: [
    trigger('state', [
      state('opened', style({transform: 'translateY(0%)'})),
      state('void, closed', style({transform: 'translateY(100%)', opacity: 0})),
      transition('* => *', animate('100ms ease-in')),
    ])
  ],
  styles: [`
    :host {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #009cff;
      height: 48px;
      padding: 16px;
      display: flex;
      align-items: center;
      border-top: 1px solid black;
      font-size: 24px;
    }
  `]
})

export class PopupComponent {
  private state: 'opened' | 'closed' = 'closed';

  @Input()
  set message(message: string) {
    this._message = message;
    this.state = 'opened';

    setTimeout(() => this.state = 'closed', 2000);
  }
  get message(): string { return this._message; }
  _message: string;

  @Output()
  closed = new EventEmitter();

  onAnimationDone(e: AnimationEvent) {
    if (e.toState === 'closed') {
      this.closed.next();
    }
  }
}
