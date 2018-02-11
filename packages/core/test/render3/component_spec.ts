/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../../src/core';
import {C, E, T, V, b, cR, cr, defineComponent, e, markDirty, p, r, t, v} from '../../src/render3/index';
import {createRendererType2} from '../../src/view/index';

import {getRendererFactory2} from './imported_renderer2';
import {containerEl, renderComponent, renderToHtml, requestAnimationFrame, toHtml} from './render_util';

describe('component', () => {
  class CounterComponent {
    count = 0;

    increment() { this.count++; }

    static ngComponentDef = defineComponent({
      type: CounterComponent,
      tag: 'counter',
      template: function(ctx: CounterComponent, cm: boolean) {
        if (cm) {
          T(0);
        }
        t(0, b(ctx.count));
      },
      factory: () => new CounterComponent,
      inputs: {count: 'count'},
      methods: {increment: 'increment'}
    });
  }

  describe('renderComponent', () => {
    it('should render on initial call', () => {
      renderComponent(CounterComponent);
      expect(toHtml(containerEl)).toEqual('0');
    });

    it('should re-render on input change or method invocation', () => {
      const component = renderComponent(CounterComponent);
      expect(toHtml(containerEl)).toEqual('0');
      component.count = 123;
      markDirty(component, requestAnimationFrame);
      expect(toHtml(containerEl)).toEqual('0');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('123');
      component.increment();
      markDirty(component, requestAnimationFrame);
      expect(toHtml(containerEl)).toEqual('123');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('124');
    });

  });

});

describe('component with a container', () => {

  function showItems(ctx: {items: string[]}, cm: boolean) {
    if (cm) {
      C(0);
    }
    cR(0);
    {
      for (const item of ctx.items) {
        const cm0 = V(0);
        {
          if (cm0) {
            T(0);
          }
          t(0, b(item));
        }
        v();
      }
    }
    cr();
  }

  class WrapperComponent {
    items: string[];
    static ngComponentDef = defineComponent({
      type: WrapperComponent,
      tag: 'wrapper',
      template: function ChildComponentTemplate(ctx: {items: string[]}, cm: boolean) {
        if (cm) {
          C(0);
        }
        cR(0);
        {
          const cm0 = V(0);
          { showItems({items: ctx.items}, cm0); }
          v();
        }
        cr();
      },
      factory: () => new WrapperComponent,
      inputs: {items: 'items'}
    });
  }

  function template(ctx: {items: string[]}, cm: boolean) {
    if (cm) {
      E(0, WrapperComponent);
      e();
    }
    p(0, 'items', b(ctx.items));
    WrapperComponent.ngComponentDef.h(1, 0);
    r(1, 0);
  }

  it('should re-render on input change', () => {
    const ctx: {items: string[]} = {items: ['a']};
    expect(renderToHtml(template, ctx)).toEqual('<wrapper>a</wrapper>');

    ctx.items = [...ctx.items, 'b'];
    expect(renderToHtml(template, ctx)).toEqual('<wrapper>ab</wrapper>');
  });

});

// TODO: add tests with Native once tests are run in real browser (domino doesn't support shadow
// root)
describe('encapsulation', () => {
  class WrapperComponent {
    static ngComponentDef = defineComponent({
      type: WrapperComponent,
      tag: 'wrapper',
      template: function(ctx: WrapperComponent, cm: boolean) {
        if (cm) {
          E(0, EncapsulatedComponent);
          e();
        }
        EncapsulatedComponent.ngComponentDef.h(1, 0);
        r(1, 0);
      },
      factory: () => new WrapperComponent,
    });
  }

  class EncapsulatedComponent {
    static ngComponentDef = defineComponent({
      type: EncapsulatedComponent,
      tag: 'encapsulated',
      template: function(ctx: EncapsulatedComponent, cm: boolean) {
        if (cm) {
          T(0, 'foo');
          E(1, LeafComponent);
          e();
        }
        LeafComponent.ngComponentDef.h(2, 1);
        r(2, 1);
      },
      factory: () => new EncapsulatedComponent,
      rendererType:
          createRendererType2({encapsulation: ViewEncapsulation.Emulated, styles: [], data: {}}),
    });
  }

  class LeafComponent {
    static ngComponentDef = defineComponent({
      type: LeafComponent,
      tag: 'leaf',
      template: function(ctx: LeafComponent, cm: boolean) {
        if (cm) {
          E(0, 'span');
          { T(1, 'bar'); }
          e();
        }
      },
      factory: () => new LeafComponent,
    });
  }

  it('should encapsulate children, but not host nor grand children', () => {
    renderComponent(WrapperComponent, getRendererFactory2(document));
    expect(containerEl.outerHTML)
        .toMatch(
            /<div host=""><encapsulated _nghost-c(\d+)="">foo<leaf _ngcontent-c\1=""><span>bar<\/span><\/leaf><\/encapsulated><\/div>/);
  });

  it('should encapsulate host', () => {
    renderComponent(EncapsulatedComponent, getRendererFactory2(document));
    expect(containerEl.outerHTML)
        .toMatch(
            /<div host="" _nghost-c(\d+)="">foo<leaf _ngcontent-c\1=""><span>bar<\/span><\/leaf><\/div>/);
  });

  it('should encapsulate host and children with different attributes', () => {
    class WrapperComponentWith {
      static ngComponentDef = defineComponent({
        type: WrapperComponentWith,
        tag: 'wrapper',
        template: function(ctx: WrapperComponentWith, cm: boolean) {
          if (cm) {
            E(0, LeafComponentwith);
            e();
          }
          LeafComponentwith.ngComponentDef.h(1, 0);
          r(1, 0);
        },
        factory: () => new WrapperComponentWith,
        rendererType:
            createRendererType2({encapsulation: ViewEncapsulation.Emulated, styles: [], data: {}}),
      });
    }

    class LeafComponentwith {
      static ngComponentDef = defineComponent({
        type: LeafComponentwith,
        tag: 'leaf',
        template: function(ctx: LeafComponentwith, cm: boolean) {
          if (cm) {
            E(0, 'span');
            { T(1, 'bar'); }
            e();
          }
        },
        factory: () => new LeafComponentwith,
        rendererType:
            createRendererType2({encapsulation: ViewEncapsulation.Emulated, styles: [], data: {}}),
      });
    }

    renderComponent(WrapperComponentWith, getRendererFactory2(document));
    expect(containerEl.outerHTML)
        .toMatch(
            /<div host="" _nghost-c(\d+)=""><leaf _ngcontent-c\1="" _nghost-c(\d+)=""><span _ngcontent-c\2="">bar<\/span><\/leaf><\/div>/);
  });
});
