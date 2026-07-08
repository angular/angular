import {Component, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <ng-template [boundAttr]="b" attr="l">
      some-content
    </ng-template>`,
    standalone: false
})
export class MyComponent {
  declare b: any;
}

@NgModule({declarations: [MyComponent], schemas: [NO_ERRORS_SCHEMA]})
export class MyModule {
}
