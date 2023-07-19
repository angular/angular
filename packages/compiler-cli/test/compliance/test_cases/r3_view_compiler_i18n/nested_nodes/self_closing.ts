import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <img src="logo.png" i18n  alt="self_closing_logo"/>
  <img src="logo.png" i18n *ngIf="visible"  alt="visible"/>
  <img src="logo.png" i18n *ngIf="visible" i18n-title title="App logo #{{ id }}"  alt="appLogo"/>
  `,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
