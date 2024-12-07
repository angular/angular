import {Component, Directive, Input, Output} from '@angular/core';

@Directive({selector: '[dir]'})
export class Dir {
  @Input() a: unknown;
  @Output() aChange: unknown;

  @Input() b: unknown;

  @Input() c: unknown;
  @Output() cChange: unknown;

  @Input() d: unknown;
}

@Component({
  imports: [Dir],
  template: `
    <div dir [(a)]="value" [b]="value" [(c)]="value" [d]="value"></div>
  `,
})
export class App {
  value = 'hi';
}
