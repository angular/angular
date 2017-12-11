/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {D, E, Q, QueryList, e, m, rQ} from '../../src/render3/index';

import {createComponent, renderComponent} from './render_util';

describe('query', () => {
  it('should project query children', () => {
    const Child = createComponent('child', function(ctx: any, cm: boolean) {});

    let child1 = null;
    let child2 = null;
    const Cmp = createComponent('cmp', function(ctx: any, cm: boolean) {
      /**
       * <child>
       *   <child>
       *   </child>
       * </child>
       * class Cmp {
       *   @ViewChildren(Child) query0;
       *   @ViewChildren(Child, {descend: true}) query1;
       * }
       */
      let tmp: any;
      if (cm) {
        m(0, Q(Child, false));
        m(1, Q(Child, true));
        E(2, Child.ngComponentDef);
        {
          child1 = D(3, Child.ngComponentDef.n(), Child.ngComponentDef);
          E(4, Child.ngComponentDef);
          { child2 = D(5, Child.ngComponentDef.n(), Child.ngComponentDef); }
          e();
        }
        e();
      }
      rQ(tmp = m<QueryList<any>>(0)) && (ctx.query0 = tmp as QueryList<any>);
      rQ(tmp = m<QueryList<any>>(1)) && (ctx.query1 = tmp as QueryList<any>);
    });

    const parent = renderComponent(Cmp);
    expect((parent.query0 as QueryList<any>).toArray()).toEqual([child1]);
    expect((parent.query1 as QueryList<any>).toArray()).toEqual([child1, child2]);
  });
});
