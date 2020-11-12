import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div *ngFor="let outer of items">
    <div i18n-title="m|d" title="different scope {{ outer | uppercase }}"></div>
  </div>
  `
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}