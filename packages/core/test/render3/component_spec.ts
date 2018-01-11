/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../../src/core';
import {E, T, b, defineComponent, e, markDirty, t} from '../../src/render3/index';
import {createRendererType2} from '../../src/view/index';

import {getRendererFactory2} from './imported_renderer2';
import {containerEl, renderComponent, requestAnimationFrame, toHtml} from './render_util';

describe('component', () => {
  class CounterComponent {
    count = 0;

    increment() { this.count++; }

    static ngComponentDef = defineComponent({
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

// TODO: add tests with Native once tests are run in real browser (domino doesn't support shadow
// root)
describe('encapsulation', () => {
  class WrapperComponent {
    static ngComponentDef = defineComponent({
      tag: 'wrapper',
      template: function(ctx: WrapperComponent, cm: boolean) {
        if (cm) {
          E(0, EncapsulatedComponent);
          e();
        }
        EncapsulatedComponent.ngComponentDef.h(1, 0);
        EncapsulatedComponent.ngComponentDef.r(1, 0);
      },
      factory: () => new WrapperComponent,
    });
  }

  class EncapsulatedComponent {
    static ngComponentDef = defineComponent({
      tag: 'encapsulated',
      template: function(ctx: EncapsulatedComponent, cm: boolean) {
        if (cm) {
          T(0, 'foo');
          E(1, LeafComponent);
          e();
        }
        LeafComponent.ngComponentDef.h(2, 1);
        LeafComponent.ngComponentDef.r(2, 1);
      },
      factory: () => new EncapsulatedComponent,
      rendererType:
          createRendererType2({encapsulation: ViewEncapsulation.Emulated, styles: [], data: {}}),
    });
  }

  class LeafComponent {
    static ngComponentDef = defineComponent({
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
        tag: 'wrapper',
        template: function(ctx: WrapperComponentWith, cm: boolean) {
          if (cm) {
            E(0, LeafComponentwith);
            e();
          }
          LeafComponentwith.ngComponentDef.h(1, 0);
          LeafComponentwith.ngComponentDef.r(1, 0);
        },
        factory: () => new WrapperComponentWith,
        rendererType:
            createRendererType2({encapsulation: ViewEncapsulation.Emulated, styles: [], data: {}}),
      });
    }

    class LeafComponentwith {
      static ngComponentDef = defineComponent({
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
