import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div id="dynamic-1"
    i18n-title="m|d" title="intro {{ valueA | uppercase }}"
    i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
    i18n-aria-roledescription aria-roledescription="static text"
  ></div>
  <div id="dynamic-2"
    i18n-title="m2|d2" title="{{ valueA }} and {{ valueB }} and again {{ valueA + valueB }}"
    i18n-aria-roledescription aria-roledescription="{{ valueC }}"
  ></div>
  `
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}