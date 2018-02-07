/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineComponent, renderComponent, detectChanges, T, t, E, e, L, p, b, b1} from '../built/packages/core/src/render3';
import {ComponentDef} from '../built/packages/core/src/render3/interfaces/definition';

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
