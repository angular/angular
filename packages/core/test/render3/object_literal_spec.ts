/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {defineComponent} from '../../src/render3/index';
import {componentRefresh, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, memory} from '../../src/render3/instructions';
import {objectLiteral1, objectLiteral2, objectLiteral3, objectLiteral4, objectLiteral5, objectLiteral6, objectLiteral7, objectLiteral8, objectLiteralV} from '../../src/render3/object_literal';
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
      elementProperty(0, 'names', objectLiteral1(e0_ff, ctx.customName));
      MyComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
    }

    const e0_ff = (v: any) => ['Nancy', v, 'Bess'];

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

    /**
     * <many-prop-comp [names1]="['Nancy', customName]" [names2]="[customName2]">
     * </many-prop-comp>
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ManyPropComp);
        elementEnd();
      }
      elementProperty(0, 'names1', objectLiteral1(e0_ff, ctx.customName));
      elementProperty(0, 'names2', objectLiteral1(e0_ff_1, ctx.customName2));
      ManyPropComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
    }

    const e0_ff = (v: any) => ['Nancy', v];
    const e0_ff_1 = (v: any) => [v];

    renderToHtml(Template, {customName: 'Carson', customName2: 'George'});
    expect(manyPropComp !.names1).toEqual(['Nancy', 'Carson']);
    expect(manyPropComp !.names2).toEqual(['George']);

    renderToHtml(Template, {customName: 'George', customName2: 'Carson'});
    expect(manyPropComp !.names1).toEqual(['Nancy', 'George']);
    expect(manyPropComp !.names2).toEqual(['Carson']);
  });


  it('should support an array literal with more than 1 binding', () => {
    /** <my-comp [names]="['Nancy', customName, 'Bess', customName2]"></my-comp> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, MyComp);
        elementEnd();
      }
      elementProperty(0, 'names', objectLiteral2(e0_ff, ctx.customName, ctx.customName2));
      MyComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
    }

    const e0_ff = (v1: any, v2: any) => ['Nancy', v1, 'Bess', v2];

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
      elementProperty(0, 'names', objectLiteral3(e0_ff, c[5], c[6], c[7]));
      elementProperty(2, 'names', objectLiteral4(e2_ff, c[4], c[5], c[6], c[7]));
      elementProperty(4, 'names', objectLiteral5(e4_ff, c[3], c[4], c[5], c[6], c[7]));
      elementProperty(6, 'names', objectLiteral6(e6_ff, c[2], c[3], c[4], c[5], c[6], c[7]));
      elementProperty(8, 'names', objectLiteral7(e8_ff, c[1], c[2], c[3], c[4], c[5], c[6], c[7]));
      elementProperty(
          10, 'names', objectLiteral8(e10_ff, c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7]));
      MyComp.ngComponentDef.h(1, 0);
      MyComp.ngComponentDef.h(3, 2);
      MyComp.ngComponentDef.h(5, 4);
      MyComp.ngComponentDef.h(7, 6);
      MyComp.ngComponentDef.h(9, 8);
      MyComp.ngComponentDef.h(11, 10);
      componentRefresh(1, 0);
      componentRefresh(3, 2);
      componentRefresh(5, 4);
      componentRefresh(7, 6);
      componentRefresh(9, 8);
      componentRefresh(11, 10);
    }

    const e0_ff = (v1: any, v2: any, v3: any) => ['a', 'b', 'c', 'd', 'e', v1, v2, v3];
    const e2_ff = (v1: any, v2: any, v3: any, v4: any) => ['a', 'b', 'c', 'd', v1, v2, v3, v4];
    const e4_ff =
        (v1: any, v2: any, v3: any, v4: any, v5: any) => ['a', 'b', 'c', v1, v2, v3, v4, v5];
    const e6_ff =
        (v1: any, v2: any, v3: any, v4: any, v5: any,
         v6: any) => ['a', 'b', v1, v2, v3, v4, v5, v6];
    const e8_ff =
        (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
         v7: any) => ['a', v1, v2, v3, v4, v5, v6, v7];
    const e10_ff =
        (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any,
         v8: any) => [v1, v2, v3, v4, v5, v6, v7, v8];

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

  it('should work with objectLiteralV for 9+ bindings', () => {
    /**
     * <my-comp [names]="['start', v0, v1, v2, v3, {name: v4}, v5, v6, v7, v8, 'end']">
     * </my-comp>
     */
    function Template(c: any, cm: boolean) {
      if (cm) {
        elementStart(0, MyComp);
        elementEnd();
      }
      elementProperty(
          0, 'names', objectLiteralV(e0_ff, [
            c[0], c[1], c[2], c[3], objectLiteral1(e0_ff_1, c[4]), c[5], c[6], c[7], c[8]
          ]));
      MyComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
    }

    const e0_ff =
        (v: any[]) => ['start', v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], 'end'];
    const e0_ff_1 = (v: any) => { return {name: v}; };

    renderToHtml(Template, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
    expect(myComp !.names).toEqual([
      'start', 'a', 'b', 'c', 'd', {name: 'e'}, 'f', 'g', 'h', 'i', 'end'
    ]);

    renderToHtml(Template, ['a1', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
    expect(myComp !.names).toEqual([
      'start', 'a1', 'b', 'c', 'd', {name: 'e'}, 'f', 'g', 'h', 'i', 'end'
    ]);

    renderToHtml(Template, ['a1', 'b', 'c', 'd', 'e5', 'f', 'g', 'h', 'i']);
    expect(myComp !.names).toEqual([
      'start', 'a1', 'b', 'c', 'd', {name: 'e5'}, 'f', 'g', 'h', 'i', 'end'
    ]);
  });

});
describe('object literals', () => {
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

  it('should support an object literal', () => {

    /** <object-comp [config]="{duration: 500, animation: name}"></object-comp> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ObjectComp);
        elementEnd();
      }
      elementProperty(0, 'config', objectLiteral1(e0_ff, ctx.name));
      ObjectComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
    }

    const e0_ff = (v: any) => { return {duration: 500, animation: v}; };

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
  });

  it('should support expressions nested deeply in object/array literals', () => {
    /**
     * <object-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1,
     * duration: duration }]}">
     * </object-comp>
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ObjectComp);
        elementEnd();
      }
      elementProperty(
          0, 'config',
          objectLiteral2(
              e0_ff, ctx.name, objectLiteral1(e0_ff_1, objectLiteral1(e0_ff_2, ctx.duration))));
      ObjectComp.ngComponentDef.h(1, 0);
      componentRefresh(1, 0);
    }

    const e0_ff = (v1: any, v2: any) => { return {animation: v1, actions: v2}; };
    const e0_ff_1 = (v: any) => [{opacity: 0, duration: 0}, v];
    const e0_ff_2 = (v: any) => { return {opacity: 1, duration: v}; };

    renderToHtml(Template, {name: 'slide', duration: 100});
    expect(objectComp !.config).toEqual({
      animation: 'slide',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 100}]
    });
    const firstConfig = objectComp !.config;

    renderToHtml(Template, {name: 'slide', duration: 100});
    expect(objectComp !.config).toEqual({
      animation: 'slide',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 100}]
    });
    expect(objectComp !.config).toBe(firstConfig);

    renderToHtml(Template, {name: 'slide', duration: 50});
    expect(objectComp !.config).toEqual({
      animation: 'slide',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 50}]
    });
    expect(objectComp !.config).not.toBe(firstConfig);

    renderToHtml(Template, {name: 'tap', duration: 50});
    expect(objectComp !.config).toEqual({
      animation: 'tap',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 50}]
    });

    renderToHtml(Template, {name: 'drag', duration: 500});
    expect(objectComp !.config).toEqual({
      animation: 'drag',
      actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 500}]
    });
  });

  it('should support multiple view instances with multiple bindings', () => {
    let objectComps: ObjectComp[] = [];

    /**
     * % for(let i = 0; i < 2; i++) {
     *   <object-comp [config]="{opacity: configs[i].opacity, duration: configs[i].duration}">
     *   </object-comp>
     * % }
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        container(0);
      }
      containerRefreshStart(0);
      {
        for (let i = 0; i < 2; i++) {
          if (embeddedViewStart(0)) {
            elementStart(0, ObjectComp);
            objectComps.push(memory(1));
            elementEnd();
          }
          elementProperty(
              0, 'config', objectLiteral2(e0_ff, ctx.configs[i].opacity, ctx.configs[i].duration));
          ObjectComp.ngComponentDef.h(1, 0);
          componentRefresh(1, 0);
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    const e0_ff = (v1: any, v2: any) => { return {opacity: v1, duration: v2}; };

    const configs = [{opacity: 0, duration: 500}, {opacity: 1, duration: 600}];
    renderToHtml(Template, {configs});
    expect(objectComps[0].config).toEqual({opacity: 0, duration: 500});
    expect(objectComps[1].config).toEqual({opacity: 1, duration: 600});

    configs[0].duration = 1000;
    renderToHtml(Template, {configs});
    expect(objectComps[0].config).toEqual({opacity: 0, duration: 1000});
    expect(objectComps[1].config).toEqual({opacity: 1, duration: 600});
  });

});
