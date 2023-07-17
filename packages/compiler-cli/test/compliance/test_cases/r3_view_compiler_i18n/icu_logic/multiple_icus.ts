import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    {gender, select, male {male} female {female} other {other}}
    {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}
  </div>
`,
})
export class MyComponent {
  gender = 'male';
  age = 1;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
