// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'phonecat-app',
  template: `
    <router-outlet></router-outlet>
    <div class="view-container">
      <div ng-view class="view-frame"></div>
    </div>
  `
})
export class AppComponent { }
