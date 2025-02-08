/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  host: {
    '(click)': 'handleClick()',
  },
})
export class TooltipDirective {
  visible = false;
  nested = {
    child: {
      grandchild: {
        prop: 1,
      },
    },
  };

  constructor() {
    // setInterval(() => this.nested.child.grandchild.prop++, 500);
  }

  handleClick(): void {
    this.visible = !this.visible;
    if (this.visible) {
      (this as any).extraProp = true;
    } else {
      delete (this as any).extraProp;
    }
  }
}
