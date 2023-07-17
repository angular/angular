import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div *ngIf="exp" id="static" i18n-title="m|d" title="introduction"></div>
  `
})
export class MyComponent {
  exp = true;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}