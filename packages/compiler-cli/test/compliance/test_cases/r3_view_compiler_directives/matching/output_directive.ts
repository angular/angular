import {Component, Directive, EventEmitter, NgModule, Output} from '@angular/core';

@Directive({
    selector: '[someDirective]',
    standalone: false
})
export class SomeDirective {
  @Output() someDirective = new EventEmitter();
}

@Component({
    selector: 'my-component', template: '<div (someDirective)="noop()"></div>',
    standalone: false
})
export class MyComponent {
  noop() {}
}

@NgModule({declarations: [SomeDirective, MyComponent]})
export class MyModule {
}
