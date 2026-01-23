/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'docs-algolia-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './algolia-icon.component.html',
})
export class AlgoliaIcon {}
