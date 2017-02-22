// #docregion
import { Component } from '@angular/core';

@Component({
selector: 'my-app',
template:
  `<h1>Absolute & <i>Component-Relative</i> Paths</h1>
  <absolute-path></absolute-path>
  <relative-path></relative-path>
  `
})
export class AppComponent {}
