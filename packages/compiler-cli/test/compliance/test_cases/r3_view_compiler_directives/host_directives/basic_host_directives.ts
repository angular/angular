import {Component, Directive} from '@angular/core';

@Directive({host: {'class': 'dir-a'}})
export class DirectiveA {
}

@Directive({host: {'class': 'dir-b'}})
export class DirectiveB {
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [DirectiveA, DirectiveB],
    standalone: false
})
export class MyComponent {
}
