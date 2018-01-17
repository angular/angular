// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  // #docregion template
  template: `
    <app-title></app-title>
    <app-contact></app-contact>
  `
  // #enddocregion template
})
export class AppComponent {}
