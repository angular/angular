import {Component, Directive} from '@angular/core';

@Directive({standalone: true, host: {'class': 'dir-a'}})
export class DirectiveA {
}

@Directive({standalone: true, host: {'class': 'dir-b'}})
export class DirectiveB {
}

@Component({
  selector: 'my-component',
  template: '',
  hostDirectives: [DirectiveA, DirectiveB],
})
export class MyComponent {
}
