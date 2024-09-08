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
  <div i18n>My i18n block #{{ one }}</div>
  <div i18n>My i18n block #{{ two | uppercase }}</div>
  <div i18n>My i18n block #{{ three + four + five }}</div>
  `,
    standalone: false
})
export class MyComponent {
  one = 1;
  two = 2;
  three = 3;
  four = 4;
  five = 5;
}

@NgModule({declarations: [MyComponent, UppercasePipe]})
export class MyModule {
}
