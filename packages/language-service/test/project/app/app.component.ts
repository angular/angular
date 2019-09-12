/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

export class Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'my-app',
  template: `~{empty}
    <~{start-tag}h~{start-tag-after-h}1~{start-tag-h1} ~{h1-after-space}>
      ~{h1-content} {{~{sub-start}title~{sub-end}}}
    </h1>
    ~{after-h1}<h2>{{~{h2-hero}hero.~{h2-name}name}} details!</h2>
    <div><label>id: </label>{{~{label-hero}hero.~{label-id}id}}</div>
    <div ~{div-attributes}>
      <label>name: </label>
    </div>
    &~{entity-amp}amp;
  `
})
export class AppComponent {
  title = 'Tour of Heroes';
  hero: Hero = {id: 1, name: 'Windstorm'};
  private internal: string;
}
