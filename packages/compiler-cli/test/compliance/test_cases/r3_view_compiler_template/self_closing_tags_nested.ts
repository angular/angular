import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-comp', template: 'hello'})
export class MyComp {
}

@Component({
  template: `
    <my-comp title="a">Before<my-comp title="b"></my-comp>After</my-comp>
  `
})
export class App {
}

@NgModule({declarations: [App, MyComp]})
export class MyModule {
}
