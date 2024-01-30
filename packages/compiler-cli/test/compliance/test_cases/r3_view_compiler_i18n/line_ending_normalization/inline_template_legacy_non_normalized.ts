import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
  // `\r\n` line-ending chars when loaded from the test file-system.
  template: ` <div
    title="abc

def"
    i18n-title
    i18n
  >
    Some Message { value, select, =0 { zero } }
  </div>`,
})
export class MyComponent {
  value!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {}
