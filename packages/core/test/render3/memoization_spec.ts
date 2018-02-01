/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {E, defineComponent, e, m, mo1, mo2, mo3, mo4, mo5, mo6, mo7, mo8, p, r} from '../../src/render3/index';
import {renderToHtml} from '../../test/render3/render_util';

describe('memoization', () => {
  let myComp: MyComp;

  class MyComp {
    names: string[];

    static ngComponentDef = defineComponent({
      type: MyComp,
      tag: 'my-comp',
      factory: function MyComp_Factory() { return myComp = new MyComp(); },
      template: function MyComp_Template(ctx: MyComp, cm: boolean) {},
      inputs: {names: 'names'}
    });
  }

  it('should memoize an array literal with a binding', () => {
    /** <my-comp [names]="['Nancy', customName, 'Bess']"></my-comp> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, MyComp);
        e();
      }
      p(0, 'names', mo1(e0_literal, 1, ctx.customName));
      MyComp.ngComponentDef.h(1, 0);
      r(1, 0);
    }

    const e0_literal = ['Nancy', null, 'Bess'];

    renderToHtml(Template, {customName: 'Carson'});
    const firstArray = myComp !.names;
    expect(firstArray).toEqual(['Nancy', 'Carson', 'Bess']);

    renderToHtml(Template, {customName: 'Carson'});
    expect(myComp !.names).toEqual(['Nancy', 'Carson', 'Bess']);
    expect(firstArray).toBe(myComp !.names);

    renderToHtml(Template, {customName: 'Hannah'});
    expect(myComp !.names).toEqual(['Nancy', 'Hannah', 'Bess']);

    // Identity must change if binding changes
    expect(firstArray).not.toBe(myComp !.names);
  });

  it('should memoize an array literal with more than 1 binding', () => {
    /** <my-comp [names]="['Nancy', customName, 'Bess', customName2]"></my-comp> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, MyComp);
        e();
      }
      p(0, 'names', mo2(e0_literal, 1, ctx.customName, 3, ctx.customName2));
      MyComp.ngComponentDef.h(1, 0);
      r(1, 0);
    }

    const e0_literal = ['Nancy', null, 'Bess', null];

    renderToHtml(Template, {customName: 'Carson', customName2: 'Hannah'});
    const firstArray = myComp !.names;
    expect(firstArray).toEqual(['Nancy', 'Carson', 'Bess', 'Hannah']);

    renderToHtml(Template, {customName: 'Carson', customName2: 'Hannah'});
    expect(myComp !.names).toEqual(['Nancy', 'Carson', 'Bess', 'Hannah']);
    expect(firstArray).toBe(myComp !.names);

    renderToHtml(Template, {customName: 'George', customName2: 'Hannah'});
    expect(myComp !.names).toEqual(['Nancy', 'George', 'Bess', 'Hannah']);
    expect(firstArray).not.toBe(myComp !.names);

    renderToHtml(Template, {customName: 'Frank', customName2: 'Ned'});
    expect(myComp !.names).toEqual(['Nancy', 'Frank', 'Bess', 'Ned']);
  });

  it('should work up to 8 bindings', () => {
    let mo3Comp: MyComp;
    let mo4Comp: MyComp;
    let mo5Comp: MyComp;
    let mo6Comp: MyComp;
    let mo7Comp: MyComp;
    let mo8Comp: MyComp;

    function Template(c: any, cm: boolean) {
      if (cm) {
        E(0, MyComp);
        mo3Comp = m(1);
        e();
        E(2, MyComp);
        mo4Comp = m(3);
        e();
        E(4, MyComp);
        mo5Comp = m(5);
        e();
        E(6, MyComp);
        mo6Comp = m(7);
        e();
        E(8, MyComp);
        mo7Comp = m(9);
        e();
        E(10, MyComp);
        mo8Comp = m(11);
        e();
      }
      p(0, 'names', mo3(e0_literal, 5, c[5], 6, c[6], 7, c[7]));
      p(2, 'names', mo4(e2_literal, 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(4, 'names', mo5(e4_literal, 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(6, 'names', mo6(e6_literal, 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(8, 'names', mo7(e8_literal, 1, c[1], 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(10, 'names',
        mo8(e10_literal, 0, c[0], 1, c[1], 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      MyComp.ngComponentDef.h(1, 0);
      r(1, 0);
      MyComp.ngComponentDef.h(3, 2);
      r(3, 2);
      MyComp.ngComponentDef.h(5, 4);
      r(5, 4);
      MyComp.ngComponentDef.h(7, 6);
      r(7, 6);
      MyComp.ngComponentDef.h(9, 8);
      r(9, 8);
      MyComp.ngComponentDef.h(11, 10);
      r(11, 10);
    }

    const e0_literal = ['a', 'b', 'c', 'd', 'e', null, null, null];
    const e2_literal = ['a', 'b', 'c', 'd', null, null, null, null];
    const e4_literal = ['a', 'b', 'c', null, null, null, null, null];
    const e6_literal = ['a', 'b', null, null, null, null, null, null];
    const e8_literal = ['a', null, null, null, null, null, null, null];
    const e10_literal = [null, null, null, null, null, null, null, null];

    renderToHtml(Template, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
    expect(mo3Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(mo4Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(mo5Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(mo6Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(mo7Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(mo8Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);

    renderToHtml(Template, ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'i1']);
    expect(mo3Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f1', 'g1', 'h1']);
    expect(mo4Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e1', 'f1', 'g1', 'h1']);
    expect(mo5Comp !.names).toEqual(['a', 'b', 'c', 'd1', 'e1', 'f1', 'g1', 'h1']);
    expect(mo6Comp !.names).toEqual(['a', 'b', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
    expect(mo7Comp !.names).toEqual(['a', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
    expect(mo8Comp !.names).toEqual(['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
  });

});
