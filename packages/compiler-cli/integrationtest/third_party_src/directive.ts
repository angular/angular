/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[thirdParty]',
  host: {'[title]': 'thirdParty'},
})
export class ThirdPartyDirective {
  @Input() thirdParty: string;
}
