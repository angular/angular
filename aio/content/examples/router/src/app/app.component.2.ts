/* Second Heroes version */
// #docregion
import { Component } from '@angular/core';
// #docregion animation-imports
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations';
// #enddocregion animation-imports

@Component({
  selector: 'app-root',
  // #docregion template
  template: `
    <h1>Angular Router</h1>
    <nav>
      <a routerLink="/crisis-center" routerLinkActive="active">Crisis Center</a>
      <a routerLink="/heroes" routerLinkActive="active">Heroes</a>
    </nav>
    <div [@routeAnimation]="getAnimationData(routerOutlet)">
      <router-outlet #routerOutlet="outlet"></router-outlet>
    </div>
  `,
  animations: [ slideInAnimation ]
  // #enddocregion template
})
// #docregion function-binding
export class AppComponent {
  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
// #enddocregion function-binding
