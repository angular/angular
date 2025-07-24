import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n="meaningA|descA@@idA">{count, select, 1 {one} other {more than one}}</div>
`,
    standalone: false
})
export class MyComponent {
  count = 1;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
