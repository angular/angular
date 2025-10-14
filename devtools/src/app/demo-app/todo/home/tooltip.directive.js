/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Directive} from '@angular/core';
let TooltipDirective = class TooltipDirective {
  constructor() {
    this.visible = false;
    this.nested = {
      child: {
        grandchild: {
          prop: 1,
        },
      },
    };
    // setInterval(() => this.nested.child.grandchild.prop++, 500);
  }
  handleClick() {
    this.visible = !this.visible;
    if (this.visible) {
      this.extraProp = true;
    } else {
      delete this.extraProp;
    }
  }
};
TooltipDirective = __decorate(
  [
    Directive({
      selector: '[appTooltip]',
      host: {
        '(click)': 'handleClick()',
      },
    }),
  ],
  TooltipDirective,
);
export {TooltipDirective};
//# sourceMappingURL=tooltip.directive.js.map
