import {Component, Directive, ViewChild} from '@angular/core';

@Directive({
  selector: '[foo]',
  exportAs: 'foo',
})
export class FooDirective {
  open() {}
}

@Component({
  selector: 'app-root',
  imports: [FooDirective],
  template: '<div foo #ref="foo"></div>',
})
export class AppComponent {
  @ViewChild('ref') ref?: FooDirective;
}
