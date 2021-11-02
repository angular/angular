import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({selector: '[someDirective]'})
export class SomeDirective {
  @Input() someDirective: any;
}

@Component({selector: 'my-component', template: '<div *someDirective></div>'})
export class MyComponent {
}

@NgModule({declarations: [SomeDirective, MyComponent]})
export class MyModule {
}
