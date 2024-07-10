import {Component, Directive, Input, NgModule, Pipe} from '@angular/core';

@Pipe({name: 'uppercase'})
export class UppercasePipe {
  transform(v: any) {}
}

@Directive({selector: 'div'})
export class DivDir {
  @Input('aria-label') al!: any;
  @Input('aria-roledescription') arl!: any;
}

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
  valueA: any;
  valueB: any;
  valueC: any;
}

@NgModule({declarations: [UppercasePipe, MyComponent, DivDir]})
export class MyModule {
}
