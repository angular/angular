/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, signal, computed} from '@angular/core';
let CookieRecipe = class CookieRecipe {
  constructor() {
    this.count = signal(10, {debugName: 'count'});
    this.butter = computed(() => this.count() * 0.1, {debugName: 'butter'});
    this.sugar = computed(() => this.count() * 0.05, {debugName: 'sugar'});
    this.flour = computed(() => this.count() * 0.2, {debugName: 'flour'});
  }
  update(event) {
    const input = event.target;
    this.count.set(parseInt(input.value));
  }
};
CookieRecipe = __decorate(
  [
    Component({
      selector: 'app-cookies',
      template: `
    <h2>Cookie recipe</h2>

    <label>
    # of cookies:
    <input type="range" min="10" max="100" step="10" [value]="count()" (input)="update($event)" />
    {{ count() }}
    </label>

    <p>Butter: {{ butter() }} cup(s)</p>
    <p>Sugar: {{ sugar() }} cup(s)</p>
    <p>Flour: {{ flour() }} cup(s)</p>
  `,
    }),
  ],
  CookieRecipe,
);
export {CookieRecipe};
//# sourceMappingURL=cookies.component.js.map
