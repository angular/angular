import {Component, Directive, NgModule} from '@angular/core';

@Component({selector: 'child', template: 'child-view'})
export class ChildComponent {
}

@Directive({selector: '[some-directive]'})
export class SomeDirective {
}

@Component({selector: 'my-component', template: '<child some-directive></child>!'})
export class MyComponent {
}

@NgModule({declarations: [ChildComponent, SomeDirective, MyComponent]})
export class MyModule {
}
