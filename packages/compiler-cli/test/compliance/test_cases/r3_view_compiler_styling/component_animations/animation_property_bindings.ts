import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div [@foo]='exp'></div>
    <div @bar></div>
    <div [@baz]></div>`,
})
export class MyComponent {
  exp = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
