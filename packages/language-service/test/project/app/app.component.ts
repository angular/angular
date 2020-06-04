/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
  template: `
    <h1>{{title}}</h1>
    <h2>{{hero.name}} details!</h2>
  `
})
export class AppComponent {
  title = 'Tour of Heroes';
  hero: Hero = {id: 1, name: 'Windstorm'};
  private internal: string = 'internal';
  setTitle(newTitle: string) {
    this.title = newTitle;
  }
}
