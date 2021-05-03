import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    {gender, select,
      male {male of age: {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}}
      female {female}
      other {other}
    }
  </div>
`
})
export class MyComponent {
  age = 1;
  gender = 'male';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
