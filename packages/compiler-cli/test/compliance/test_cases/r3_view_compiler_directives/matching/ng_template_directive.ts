import {Component, Directive, NgModule} from '@angular/core';

@Directive({selector: 'ng-template[directiveA]'})
export class DirectiveA {
}

@Component({
  selector: 'my-component',
  template: `
    <ng-template directiveA>Some content</ng-template>
  `
})
export class MyComponent {
}

@NgModule({declarations: [DirectiveA, MyComponent]})
export class MyModule {
}
