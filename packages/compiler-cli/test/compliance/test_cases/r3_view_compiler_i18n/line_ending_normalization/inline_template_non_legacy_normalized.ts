import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
    // `\r\n` line-ending chars when loaded from the test file-system.
    template: `
<div title="abc\r\n
def" i18n-title i18n>\r\n
Some Message\r\n
{\r\n
  value,\r\n
  select,\r\n
  =0 {\r\n
    zero\r\n
  }\r\n
}</div>`,
    standalone: false
})
export class MyComponent {
  value!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
