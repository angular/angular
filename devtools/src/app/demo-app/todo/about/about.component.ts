/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <h1>About Component</h1>
    <p>This is the default about component (no guard).</p>
  `,
})
export class AboutComponent {}

@Component({
  selector: 'app-protected-about',
  template: `
    <h1>Protected About Component</h1>
    <p>This component is rendered when the canMatch guard allows access.</p>
  `,
})
export class ProtectedAboutComponent {}
