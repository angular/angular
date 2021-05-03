/* Second Heroes version */
// #docregion
import { Component } from '@angular/core';
// #docregion animation-imports
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  animations: [ slideInAnimation ]
})
// #enddocregion animation-imports
// #docregion function-binding
export class AppComponent {
  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
// #enddocregion function-binding
