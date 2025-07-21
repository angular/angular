/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet],
})
export class AppComponent {
  readonly router = inject(Router);
}

@Component({
  selector: 'empty-component',
  template: ``,
})
export class EmptyComponent {
  // This component is just for demonstration purposes.
  // used to test Angular DevTools traversal logic when multiple applications are present.
}

@Component({
  selector: 'other-app',
  template: `
    @defer  {
        <empty-component/>
    }
    @placeholder (minimum 2s) {
        <b>Stuff will be loaded here</b>
    }
  `,
  imports: [EmptyComponent],
})
export class OtherAppComponent {
  // This component is just for demonstration purposes.
  // used to test Angular DevTools traversal logic when multiple applications are present.
}
