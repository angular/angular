/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {defineComponent} from '../../src/render3/index';
import {componentRefresh, elementEnd, elementProperty, elementStart, memory} from '../../src/render3/instructions';
import {objectLiteral1, objectLiteral2, objectLiteral3, objectLiteral4, objectLiteral5, objectLiteral6, objectLiteral7, objectLiteral8} from '../../src/render3/object_literal';
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
        elementStart(0, MyComp);
        elementEnd();
      }
      elementProperty(0, 'names', objectLiteral1(0, e0_literal, 1, ctx.customName));
      MyComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
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
        elementStart(0, ManyPropComp);
        elementEnd();
      }
      elementProperty(0, 'names1', objectLiteral1(0, e0_literal, 1, ctx.customName));
      elementProperty(0, 'names2', objectLiteral1(1, e0_literal_1, 0, ctx.customName2));
      ManyPropComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
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
        elementStart(0, MyComp);
        elementEnd();
      }
      elementProperty(
          0, 'names', objectLiteral2(0, e0_literal, 1, ctx.customName, 3, ctx.customName2));
      MyComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
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
        elementStart(0, MyComp);
        o3Comp = memory(1);
        elementEnd();
        elementStart(2, MyComp);
        o4Comp = memory(3);
        elementEnd();
        elementStart(4, MyComp);
        o5Comp = memory(5);
        elementEnd();
        elementStart(6, MyComp);
        o6Comp = memory(7);
        elementEnd();
        elementStart(8, MyComp);
        o7Comp = memory(9);
        elementEnd();
        elementStart(10, MyComp);
        o8Comp = memory(11);
        elementEnd();
      }
      elementProperty(0, 'names', objectLiteral3(0, e0_literal, 5, c[5], 6, c[6], 7, c[7]));
      elementProperty(
          2, 'names', objectLiteral4(1, e2_literal, 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      elementProperty(
          4, 'names', objectLiteral5(2, e4_literal, 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      elementProperty(
          6, 'names',
          objectLiteral6(3, e6_literal, 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      elementProperty(
          8, 'names',
          objectLiteral7(
              4, e8_literal, 1, c[1], 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6, c[6], 7, c[7]));
      elementProperty(
          10, 'names', objectLiteral8(
                           5, e10_literal, 0, c[0], 1, c[1], 2, c[2], 3, c[3], 4, c[4], 5, c[5], 6,
                           c[6], 7, c[7]));
      MyComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
      MyComp.ngComponentDef.h(3, 2);
      componentRefresh(3, 2);
      MyComp.ngComponentDef.h(5, 4);
      componentRefresh(5, 4);
      MyComp.ngComponentDef.h(7, 6);
      componentRefresh(7, 6);
      MyComp.ngComponentDef.h(9, 8);
      componentRefresh(9, 8);
      MyComp.ngComponentDef.h(11, 10);
      componentRefresh(11, 10);
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
        elementStart(0, ObjectComp);
        elementEnd();
      }
      elementProperty(0, 'config', objectLiteral1(0, e0_literal, 'animation', ctx.name));
      ObjectComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
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

  it('should support expressions nested deeply in object/array literals', () => {
    let nestedComp: NestedComp;

    class NestedComp {
      config: {[key: string]: any};

      static ngComponentDef = defineComponent({
        type: NestedComp,
        tag: 'nested-comp',
        factory: function NestedComp_Factory() { return nestedComp = new NestedComp(); },
        template: function NestedComp_Template(ctx: NestedComp, cm: boolean) {},
        inputs: {config: 'config'}
      });
    }

    /**
     * <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1,
     * duration: duration }]}">
     *   </nested-comp>
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, NestedComp);
        elementEnd();
      }
      elementProperty(
          0, 'config',
          objectLiteral2(
              2, e0_literal_2, 'animation', ctx.name, 'actions',
              objectLiteral1(
                  1, e0_literal_1, 1, objectLiteral1(0, e0_literal, 'duration', ctx.duration))));
      NestedComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
    }

    const e0_literal = {opacity: 1, duration: null};
    const e0_literal_1 = [{opacity: 0, duration: 0}, null];
    const e0_literal_2 = {animation: null, actions: null};

    renderToHtml(Template, {name: 'slide', duration: 100});
    expect(nestedComp !.config).toEqual({
      animation: 'slide',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 100}]
    });
    const firstConfig = nestedComp !.config;

    renderToHtml(Template, {name: 'slide', duration: 100});
    expect(nestedComp !.config).toEqual({
      animation: 'slide',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 100}]
    });
    expect(nestedComp !.config).toBe(firstConfig);

    renderToHtml(Template, {name: 'slide', duration: 50});
    expect(nestedComp !.config).toEqual({
      animation: 'slide',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 50}]
    });
    expect(nestedComp !.config).not.toBe(firstConfig);

    renderToHtml(Template, {name: 'tap', duration: 50});
    expect(nestedComp !.config).toEqual({
      animation: 'tap',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 50}]
    });

    expect(e0_literal).toEqual({opacity: 1, duration: null});
    expect(e0_literal_1).toEqual([{opacity: 0, duration: 0}, null]);
    expect(e0_literal_2).toEqual({animation: null, actions: null});
  });


});
