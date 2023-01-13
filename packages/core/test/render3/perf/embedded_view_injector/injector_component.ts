/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags, InjectionToken, ɵɵdefineComponent, ɵɵtext} from '@angular/core';
import {RenderFlags, ɵɵdirectiveInject, ɵɵtextInterpolate1} from '@angular/core/src/render3';

const token = new InjectionToken<string>('token');

/**
 * Leaf component that tries to inject a token.
 * Template corresponds to `Hello {{tokenValue}}`
 */
export class InjectorComp {
  static ɵcmp = ɵɵdefineComponent({
    type: InjectorComp,
    selectors: [['injector-comp']],
    decls: 1,
    vars: 1,
    encapsulation: 2,
    template:
        function InjectorComp_Template(rf: RenderFlags, ctx: any) {
          if (rf & 1) {
            ɵɵtext(0);
          }
          if (rf & 2) {
            ɵɵtextInterpolate1('Hello ', ctx.tokenValue, '');
          }
        }
  });

  static ɵfac() {
    return new InjectorComp(ɵɵdirectiveInject(token, InjectFlags.Optional));
  }

  constructor(public tokenValue: string) {}
}
