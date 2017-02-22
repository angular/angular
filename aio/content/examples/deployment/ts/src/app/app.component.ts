// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <h1>Simple Deployment</h1>
    <nav>
      <a routerLink="/crisis-center" routerLinkActive="active">Crisis Center</a>
      <a routerLink="/heroes" routerLinkActive="active">Heroes</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent { }
