/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {E, defineComponent, e, m, o1, o2, o3, o4, o5, o6, o7, o8, p, r} from '../../src/render3/index';
import {renderToHtml} from '../../test/render3/render_util';

describe('array literals', () => {
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

  it('should support an array literal with a binding', () => {
    /** <my-comp [names]="['Nancy', customName, 'Bess']"></my-comp> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, MyComp);
        e();
      }
      p(0, 'names', o1(0, e0_literal, 1, ctx.customName));
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

    expect(e0_literal).toEqual(['Nancy', null, 'Bess']);
  });

  it('should support multiple array literals passed through to one node', () => {
    let manyPropComp: ManyPropComp;

    class ManyPropComp {
      names1: string[];
      names2: string[];

      static ngComponentDef = defineComponent({
        type: ManyPropComp,
        tag: 'many-prop-comp',
        factory: function ManyPropComp_Factory() { return manyPropComp = new ManyPropComp(); },
        template: function ManyPropComp_Template(ctx: ManyPropComp, cm: boolean) {},
        inputs: {names1: 'names1', names2: 'names2'}
      });
    }

    /** <many-prop-comp [names1]="['Nancy', customName]" [names2]="[customName2]"></many-prop-comp>
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, ManyPropComp);
        e();
      }
      p(0, 'names1', o1(0, e0_literal, 1, ctx.customName));
      p(0, 'names2', o1(1, e0_literal_1, 0, ctx.customName2));
      ManyPropComp.ngComponentDef.h(1, 0);
      r(1, 0);
    }

    const e0_literal = ['Nancy', null];
    const e0_literal_1 = [null];

    renderToHtml(Template, {customName: 'Carson', customName2: 'George'});
    expect(manyPropComp !.names1).toEqual(['Nancy', 'Carson']);
    expect(manyPropComp !.names2).toEqual(['George']);

    renderToHtml(Template, {customName: 'George', customName2: 'Carson'});
    expect(manyPropComp !.names1).toEqual(['Nancy', 'George']);
    expect(manyPropComp !.names2).toEqual(['Carson']);

    expect(e0_literal).toEqual(['Nancy', null]);
    expect(e0_literal_1).toEqual([null]);

  });


  it('should support an array literal with more than 1 binding', () => {
    /** <my-comp [names]="['Nancy', customName, 'Bess', customName2]"></my-comp> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, MyComp);
        e();
      }
      p(0, 'names', o2(0, e0_literal, 1, ctx.customName, 3, ctx.customName2));
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
    let o3Comp: MyComp;
    let o4Comp: MyComp;
    let o5Comp: MyComp;
    let o6Comp: MyComp;
    let o7Comp: MyComp;
    let o8Comp: MyComp;

    function Template(c: any, cm: boolean) {
      if (cm) {
        E(0, MyComp);
        o3Comp = m(1);
        e();
        E(2, MyComp);
        o4Comp = m(3);
        e();
        E(4, MyComp);
        o5Comp = m(5);
        e();
        E(6, MyComp);
        o6Comp = m(7);
        e();
        E(8, MyComp);
        o7Comp = m(9);
        e();
        E(10, MyComp);
        o8Comp = m(11);
        e();
      }
      p(0, 'names', o3(0, e0_literal, 5, c[5], 6, c[6], 7, c[7]));
      p(2, 'names', o4(1, e2_literal, 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(4, 'names', o5(2, e4_literal, 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(6, 'names', o6(3, e6_literal, 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(8, 'names',
        o7(4, e8_literal, 1, c[1], 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      p(10, 'names',
        o8(5, e10_literal, 0, c[0], 1, c[1], 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
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
    expect(o3Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(o4Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(o5Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(o6Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(o7Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    expect(o8Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);

    renderToHtml(Template, ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'i1']);
    expect(o3Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f1', 'g1', 'h1']);
    expect(o4Comp !.names).toEqual(['a', 'b', 'c', 'd', 'e1', 'f1', 'g1', 'h1']);
    expect(o5Comp !.names).toEqual(['a', 'b', 'c', 'd1', 'e1', 'f1', 'g1', 'h1']);
    expect(o6Comp !.names).toEqual(['a', 'b', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
    expect(o7Comp !.names).toEqual(['a', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
    expect(o8Comp !.names).toEqual(['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
  });

  it('should support an object literal', () => {
    let objectComp: ObjectComp;

    class ObjectComp {
      config: {[key: string]: any};

      static ngComponentDef = defineComponent({
        type: ObjectComp,
        tag: 'object-comp',
        factory: function ObjectComp_Factory() { return objectComp = new ObjectComp(); },
        template: function ObjectComp_Template(ctx: ObjectComp, cm: boolean) {},
        inputs: {config: 'config'}
      });
    }

    /** <object-comp [config]="{duration: 500, animation: ctx.name}"></object-comp> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, ObjectComp);
        e();
      }
      p(0, 'config', o1(0, e0_literal, 'animation', ctx.name));
      ObjectComp.ngComponentDef.h(1, 0);
      r(1, 0);
    }

    const e0_literal = {duration: 500, animation: null};

    renderToHtml(Template, {name: 'slide'});
    const firstObj = objectComp !.config;
    expect(objectComp !.config).toEqual({duration: 500, animation: 'slide'});

    renderToHtml(Template, {name: 'slide'});
    expect(objectComp !.config).toEqual({duration: 500, animation: 'slide'});
    expect(firstObj).toBe(objectComp !.config);

    renderToHtml(Template, {name: 'tap'});
    expect(objectComp !.config).toEqual({duration: 500, animation: 'tap'});

    // Identity must change if binding changes
    expect(firstObj).not.toBe(objectComp !.config);

    expect(e0_literal).toEqual({duration: 500, animation: null});
  });

});
