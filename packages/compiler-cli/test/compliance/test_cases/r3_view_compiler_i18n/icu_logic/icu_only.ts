import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  {age, select, 10 {ten} 20 {twenty} other {other}}
`,
})
export class MyComponent {
  age = 20;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
