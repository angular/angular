import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({selector: '[dir]'})
export class Dir {
  @Input() a: string = '';
  @Output() aChange = new EventEmitter<string>();

  @Output() b = new EventEmitter();

  @Input() c: string = '';
  @Output() cChange = new EventEmitter<string>();

  @Output() d = new EventEmitter();
}

@Component({
  imports: [Dir],
  template: `
    <div dir [(a)]="value" (b)="noop()" [(c)]="value" (d)="noop()"></div>
  `,
})
export class App {
  value = 'hi';
  noop = () => {};
}
