import {Directive, ViewEncapsulation} from '@angular/core';

@Directive({
  selector: '[myDir]',
  styles: [
    'div.foo { color: red; }',
    ':host { color: blue; }',
  ],
})
export class MyDirective {}

@Directive({
  selector: '[myNoneDir]',
  styles: [
    'div.none { color: green; }',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class MyNoneDirective {}
