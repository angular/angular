import {Component, Directive} from '@angular/core';

@Directive({})
export class DirectiveA {
}

@Directive({
  hostDirectives: [DirectiveA],
})
export class DirectiveB {
}

@Directive({
  hostDirectives: [DirectiveB],
})
export class DirectiveC {
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [DirectiveC],
    standalone: false
})
export class MyComponent {
}
