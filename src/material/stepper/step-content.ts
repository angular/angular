/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef} from '@angular/core';

/**
 * Content for a `mat-step` that will be rendered lazily.
 */
@Directive({
  selector: 'ng-template[matStepContent]'
})
export class MatStepContent {
  constructor(public _template: TemplateRef<any>) {}
}
