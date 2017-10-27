/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[cdkStepLabel]',
})
export class CdkStepLabel {
  constructor(/** @docs-private */ public template: TemplateRef<any>) { }
}
