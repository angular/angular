/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵdefineDirective} from '@angular/core/src/core';

import {HostBindingsFunction} from '../../../src/render3/interfaces/definition';

export function defineBenchmarkTestDirective(
    selector: string, hostBindings: HostBindingsFunction<any>, type?: any) {
  return ɵɵdefineDirective({
    hostBindings,
    type: type || FakeDirectiveType,
    selectors: [['', selector, '']],
  });
}

class FakeDirectiveType {
  static ɵfac = () => {
    return {};
  }
}
