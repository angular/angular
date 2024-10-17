import {Component, Directive, forwardRef, Input} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [forwardRef(() => DirectiveB)],
    standalone: false
})
export class MyComponent {
}

@Directive({
  hostDirectives: [{directive: forwardRef(() => DirectiveA), inputs: ['value']}],
})
export class DirectiveB {
}

@Directive({})
export class DirectiveA {
  @Input() value: any;
}
