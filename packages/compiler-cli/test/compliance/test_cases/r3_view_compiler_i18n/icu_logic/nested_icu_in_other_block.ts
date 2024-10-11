import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{count, plural,
    =0 {zero}
    =2 {{{count}} {name, select,
          cat {cats}
          dog {dogs}
          other {animals}} !}
    other {other - {{count}}}
  }</div>
`,
    standalone: false
})
export class MyComponent {
  count = 0;
  name = 'Andrew';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
