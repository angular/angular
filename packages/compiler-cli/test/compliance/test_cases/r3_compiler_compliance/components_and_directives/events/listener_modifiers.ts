
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'my-comp',
  template: ``,
})
export class MyComp {
  @Output() stop = new EventEmitter<void>();
  @Output('clicked.here') clickedHere = new EventEmitter<void>();
}


@Component({
  selector: 'my-comp',
  imports: [MyComp],
  template: `
    <button (click.prevent)="onClick()"></button>
    <button (click.stop)="onClick()"></button>
    <button (click.debounce.500)="onClick()"></button>
    <button (click.prevent.stop)="onClick()"></button>
    <my-comp (clicked.here)="onClick()" (stop)="onStop()"/>
  `,
  standalone: true
})
export class EventModifiers {
  onClick() {}
  onStop() {}
}

@Directive({
  selector: '[ngModel]',
  standalone: true
})
export class MockNgModel {
  @Input() ngModel: any;
  @Output() ngModelChange = new EventEmitter<any>();
}

@Component({
  selector: 'two-way',
  template: `
    <input [(ngModel.debounce.200)]="name">
  `,
  standalone: true,
  imports: [MockNgModel]
})
export class TwoWayModifiers {
  name = '';
}
