/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, input} from '@angular/core';

@Directive({
  selector: '[ngVisible]',
  host: {
    '[attr.hidden]': '!condition() ? true : null',
  },
})
export class VisibleDirective {
  protected readonly condition = input.required<boolean>({alias: 'ngVisible'});
}
