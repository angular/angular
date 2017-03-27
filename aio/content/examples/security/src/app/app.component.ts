// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
  <h1>Security</h1>
  <inner-html-binding></inner-html-binding>
  <bypass-security></bypass-security>
  `
})
export class AppComponent {
}
