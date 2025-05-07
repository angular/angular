/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, computed} from '@angular/core';

@Component({
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
})
export class CookieRecipe {
  count = signal(10, {debugName: 'count'});

  butter = computed(() => this.count() * 0.1, {debugName: 'butter'});
  sugar = computed(() => this.count() * 0.05, {debugName: 'sugar'});
  flour = computed(() => this.count() * 0.2, {debugName: 'flour'});

  update(event: Event) {
    const input = event.target as HTMLInputElement;
    this.count.set(parseInt(input.value));
  }
}
