import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>{age, select, 10 {ten} 20 {twenty} other {other}}</div>
  `,
})
export class MyComponent {
  age = 1;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
