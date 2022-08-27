import {Component, Directive, forwardRef, Input} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '',
  hostDirectives: [forwardRef(() => DirectiveB)],
})
export class MyComponent {
}

@Directive({
  standalone: true,
  hostDirectives: [{directive: forwardRef(() => DirectiveA), inputs: ['value']}],
})
export class DirectiveB {
}

@Directive({standalone: true})
export class DirectiveA {
  @Input() value: any;
}
