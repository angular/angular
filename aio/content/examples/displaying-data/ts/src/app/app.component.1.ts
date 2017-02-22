// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  // #docregion template
  template: `
    <h1>{{title}}</h1>
    <h2>My favorite hero is: {{myHero}}</h2>
    `
  // #enddocregion template
})
export class AppComponent {
  title = 'Tour of Heroes';
  myHero = 'Windstorm';
}
