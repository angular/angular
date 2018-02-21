/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵT as T, ɵdefineComponent as defineComponent, ɵi1 as i1, ɵrenderComponent as renderComponent, ɵt as t} from '@angular/core';

class HelloWorld {
  name = 'World';

  static ngComponentDef = defineComponent({
    type: HelloWorld,
    tag: 'hello-world',
    factory: () => new HelloWorld(),
    template: function HelloWorldTemplate(ctx: HelloWorld, cm: boolean) {
      if (cm) {
        T(0);
      }
      t(0, i1('Hello ', ctx.name, '!'));
    }
  });
}

renderComponent(HelloWorld);
