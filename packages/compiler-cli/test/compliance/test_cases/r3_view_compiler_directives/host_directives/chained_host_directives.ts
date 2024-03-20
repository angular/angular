import {Component, Directive} from '@angular/core';

@Directive({standalone: true})
export class DirectiveA {
}

@Directive({
  standalone: true,
  hostDirectives: [DirectiveA],
})
export class DirectiveB {
}

@Directive({
  standalone: true,
  hostDirectives: [DirectiveB],
})
export class DirectiveC {
}

@Component({
  selector: 'my-component',
  template: '',
  hostDirectives: [DirectiveC],
})
export class MyComponent {
}
