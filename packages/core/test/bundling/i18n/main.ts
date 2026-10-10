/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <h1 i18n="@@greeting">Hello <strong>{{name}}</strong>!</h1>
    <p i18n="@@notificationCount">
      {count, plural, =0 {No notifications} =1 {One notification} other {Many notifications}}
    </p>
  `,
})
class AppComponent {
  name = 'Angular';
  count = 2;
}

bootstrapApplication(AppComponent);
