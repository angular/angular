/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Injectable} from '@angular/core';

import {ComponentInfo} from '../common/component_info';
import {NgContentSelectorHelper} from '../common/ng_content_selector_helper';


/**
 * See `NgContentSelectorHelper` for more information about this class.
 */
@Injectable()
export class DynamicNgContentSelectorHelper extends NgContentSelectorHelper {
  constructor(private compiler: Compiler) { super(); }
  getNgContentSelectors(info: ComponentInfo): string[] {
    return this.compiler.getNgContentSelectors(info.component);
  }
}
