/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'my-app',
  template: `<h2>{{hero.name}} details!</h2>`,
})
export class AppComponent {
  hero: Hero = {id: 1, name: 'Windstorm'};
}
