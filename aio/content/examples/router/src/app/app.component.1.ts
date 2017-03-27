/* First version */
// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  // #docregion template
  template: `
    <h1>Angular Router</h1>
    <nav>
      <a routerLink="/crisis-center" routerLinkActive="active">Crisis Center</a>
      <a routerLink="/heroes" routerLinkActive="active">Heroes</a>
    </nav>
    <router-outlet></router-outlet>
  `
  // #enddocregion template
})
export class AppComponent { }
