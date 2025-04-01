import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{age, select, 10 {ten} 20 {twenty} other {{% other %}}}</div>
`,
    interpolation: ['{%', '%}'],
    standalone: false
})
export class MyComponent {
  age = 1;
  other = 'bla';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
