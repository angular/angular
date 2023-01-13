/* Second Heroes version */
// #docregion
import { Component } from '@angular/core';
// #docregion animation-imports
import { ChildrenOutletContexts } from '@angular/router';
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
  constructor(private contexts: ChildrenOutletContexts) {}

  getAnimationData() {
      return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
// #enddocregion function-binding
