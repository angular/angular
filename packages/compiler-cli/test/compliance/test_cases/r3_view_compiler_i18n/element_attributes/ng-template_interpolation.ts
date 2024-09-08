import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <ng-template i18n-title title="Hello {{ name }}"></ng-template>
`,
    standalone: false
})
export class MyComponent {
  name = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
