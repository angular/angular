/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component} from '@angular/core';
import {HydratedComponent} from './hydrated.component';

@Component({
  selector: 'app-defer',
  standalone: true,
  imports: [HydratedComponent],
  template: `
  @defer (hydrate never) {
    <app-hydrated [title]="hydrateNeverTitle" />
  }`,
})
export class DeferComponent {
  hydrateNeverTitle = 'Hydrate Never';
}
