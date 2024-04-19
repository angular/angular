import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({name: 'uppercase'})
export class UppercasePipe {
  transform(v: any) {}
}

@Component({
  selector: 'my-component',
  template: `
  <div *ngFor="let outer of items">
    <div i18n-title="m|d" title="different scope {{ outer | uppercase }}"></div>
  </div>
  `
})
export class MyComponent {
  outer = '';
}

@NgModule({declarations: [UppercasePipe, MyComponent]})
export class MyModule {
}
