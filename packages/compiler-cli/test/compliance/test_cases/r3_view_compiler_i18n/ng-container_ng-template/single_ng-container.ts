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
  <ng-container i18n>Some content: {{ valueA | uppercase }}</ng-container>
`,
    standalone: false
})
export class MyComponent {
  valueA = '';
}

@NgModule({declarations: [MyComponent, UppercasePipe]})
export class MyModule {
}
