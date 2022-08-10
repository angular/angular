/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {_MatMenuTriggerBase} from '@angular/material/menu';

// TODO(andrewseguin): Remove the kebab versions in favor of camelCased attribute selectors

/** Directive applied to an element that should trigger a `mat-menu`. */
@Directive({
  selector: `[mat-menu-trigger-for], [matMenuTriggerFor]`,
  host: {
    'class': 'mat-menu-trigger',
  },
  exportAs: 'matMenuTrigger',
})
export class MatLegacyMenuTrigger extends _MatMenuTriggerBase {}
