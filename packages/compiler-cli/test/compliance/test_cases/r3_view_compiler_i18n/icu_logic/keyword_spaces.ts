import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    {count, select , 1 {one} other {more than one}}
    {count, plural , =1 {one} other {more than one}}
  </div>
`,
    standalone: false
})
export class MyComponent {
  count = 0;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
