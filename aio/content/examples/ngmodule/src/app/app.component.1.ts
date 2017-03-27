// #docplaster
// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
// #enddocregion
  /*
  // #docregion template
  template: '<h1 highlight>{{title}}</h1>'
  // #enddocregion template
  */
// #docregion
  template: '<app-title [subtitle]="subtitle"></app-title>'
})
export class AppComponent {
  subtitle = '(v1)';
}
// #enddocregion
