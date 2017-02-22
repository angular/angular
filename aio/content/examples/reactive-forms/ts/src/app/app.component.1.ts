// #docregion
import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: `
  <div class="container">
    <h1>Reactive Forms</h1>
    <hero-detail></hero-detail>
  </div>`
})
export class AppComponent { }
