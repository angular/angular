import {Component, Directive, EventEmitter, NgModule, Output} from '@angular/core';

@Directive({selector: '[someDirective]'})
export class SomeDirective {
  @Output() someDirective = new EventEmitter();
}

@Component({selector: 'my-component', template: '<div (someDirective)="noop()"></div>'})
export class MyComponent {
  noop() {}
}

@NgModule({declarations: [SomeDirective, MyComponent]})
export class MyModule {
}
