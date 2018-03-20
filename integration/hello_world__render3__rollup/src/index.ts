/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵdefineComponent as defineComponent, ɵdetectChanges as detectChanges, ɵrenderComponent as renderComponent, ɵT as T, ɵt as t, ɵE as E, ɵe as e, ɵp as p, ɵL as L, ɵb as b, ɵb1 as b1} from '@angular/core';
import {ComponentDef} from '@angular/core/src/render3/interfaces/definition';

export class HelloWorld {
  name: string = "world";

  /** @nocollapse */
  static ngComponentDef: ComponentDef<HelloWorld> = defineComponent({
    type: HelloWorld,
    tag: 'hello-world',
    template: function (ctx: HelloWorld, cm: boolean) {
      if (cm) {
        E(0, 'div');
        T(1);
        e();
        E(2, 'input');
        L('input', (e) => {
          ctx.name = (<HTMLInputElement>e.target).value;
          detectChanges(component);
        });
        e();
      }
      t(1, b1('Hello ', ctx.name, '!'));
      p(2, 'value', b(ctx.name));
    },
    factory: () => new HelloWorld()
  });
}

const component = renderComponent(HelloWorld);
