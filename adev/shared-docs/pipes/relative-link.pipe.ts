/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {getRelativeUrl} from '../utils/index';

@Pipe({
  name: 'relativeLink',
})
export class RelativeLink implements PipeTransform {
  transform = getRelativeUrl;
}
