import {Component, Directive, NgModule} from '@angular/core';

@Component({
    selector: 'child', template: 'child-view',
    standalone: false
})
export class ChildComponent {
}

@Directive({
    selector: '[some-directive]',
    standalone: false
})
export class SomeDirective {
}

@Component({
    selector: 'my-component', template: '<child some-directive></child>!',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [ChildComponent, SomeDirective, MyComponent]})
export class MyModule {
}
