import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({
    name: 'uppercase',
    standalone: false
})
export class UppercasePipe {
  transform(v: any) {}
}

@Component({
    selector: 'my-component',
    template: `
  <div i18n-title="m|d" title="intro {% valueA | uppercase %}"></div>
  `,
    interpolation: ['{%', '%}'],
    standalone: false
})
export class MyComponent {
  valueA = '';
}

@NgModule({declarations: [UppercasePipe, MyComponent]})
export class MyModule {
}
