import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <img src="logo.png" i18n />
  <img src="logo.png" i18n *ngIf="visible" />
  <img src="logo.png" i18n *ngIf="visible" i18n-title title="App logo #{{ id }}" />
  `,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}