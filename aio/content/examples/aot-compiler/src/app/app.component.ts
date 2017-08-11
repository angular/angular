import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <h1>AOT Mixin Demo</h1>
    <mixed-comp></mixed-comp>
    <hr>
    <mix-shim-comp></mix-shim-comp>
  `
})
export class AppComponent {}
