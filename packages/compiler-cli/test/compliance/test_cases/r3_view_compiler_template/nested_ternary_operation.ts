import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    {{a?.b ? 1 : 2 }}`,
    standalone: false
})
export class MyComponent {
  a!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
