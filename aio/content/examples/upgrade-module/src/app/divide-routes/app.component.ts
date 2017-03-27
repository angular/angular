// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <router-outlet></router-outlet>
    <div ng-view></div>
  `,
})
export class AppComponent { }
