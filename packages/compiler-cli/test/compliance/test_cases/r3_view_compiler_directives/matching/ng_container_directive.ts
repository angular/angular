import {Component, Directive, NgModule} from '@angular/core';

@Directive({selector: 'ng-container[directiveA]'})
export class DirectiveA {
}

@Component({
  selector: 'my-component',
  template: `
    <ng-container *ngIf="showing" directiveA>Some content</ng-container>
  `
})
export class MyComponent {
}

@NgModule({declarations: [DirectiveA, MyComponent]})
export class MyModule {
}
