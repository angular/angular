import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    {{a?.b ? 1 : 2 }}`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
