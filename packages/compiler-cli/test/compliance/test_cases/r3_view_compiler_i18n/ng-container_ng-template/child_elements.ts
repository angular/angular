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
  <div i18n>
    <ng-template>Template content: {{ valueA | uppercase }}</ng-template>
    <ng-container>Container content: {{ valueB | uppercase }}</ng-container>
  </div>
`,
    standalone: false
})
export class MyComponent {
  valueA = '';
  valueB = '';
}

@NgModule({declarations: [MyComponent, UppercasePipe]})
export class MyModule {
}
