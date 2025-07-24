import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: 'ng-template[directiveA]',
    standalone: false
})
export class DirectiveA {
}

@Component({
    selector: 'my-component',
    template: `
    <ng-template directiveA>Some content</ng-template>
  `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [DirectiveA, MyComponent]})
export class MyModule {
}
