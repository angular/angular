/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {withBody} from '@angular/core/testing';

import {DoCheck, ViewEncapsulation} from '../../src/core';
import {detectChanges, getRenderedText, whenRendered} from '../../src/render3/component';
import {defineComponent, markDirty} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, directiveRefresh, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, text, textBinding} from '../../src/render3/instructions';
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
          text(0);
        }
        textBinding(0, bind(ctx.count));
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
      markDirty(component);
      expect(toHtml(containerEl)).toEqual('0');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('123');
      component.increment();
      markDirty(component);
      expect(toHtml(containerEl)).toEqual('123');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('124');
    });

  });

});

describe('component with a container', () => {

  function showItems(ctx: {items: string[]}, cm: boolean) {
    if (cm) {
      container(0);
    }
    containerRefreshStart(0);
    {
      for (const item of ctx.items) {
        const cm0 = embeddedViewStart(0);
        {
          if (cm0) {
            text(0);
          }
          textBinding(0, bind(item));
        }
        embeddedViewEnd();
      }
    }
    containerRefreshEnd();
  }

  class WrapperComponent {
    items: string[];
    static ngComponentDef = defineComponent({
      type: WrapperComponent,
      tag: 'wrapper',
      template: function ChildComponentTemplate(ctx: {items: string[]}, cm: boolean) {
        if (cm) {
          container(0);
        }
        containerRefreshStart(0);
        {
          const cm0 = embeddedViewStart(0);
          { showItems({items: ctx.items}, cm0); }
          embeddedViewEnd();
        }
        containerRefreshEnd();
      },
      factory: () => new WrapperComponent,
      inputs: {items: 'items'}
    });
  }

  function template(ctx: {items: string[]}, cm: boolean) {
    if (cm) {
      elementStart(0, WrapperComponent);
      elementEnd();
    }
    elementProperty(0, 'items', bind(ctx.items));
    WrapperComponent.ngComponentDef.h(1, 0);
    directiveRefresh(1, 0);
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
          elementStart(0, EncapsulatedComponent);
          elementEnd();
        }
        EncapsulatedComponent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
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
          text(0, 'foo');
          elementStart(1, LeafComponent);
          elementEnd();
        }
        LeafComponent.ngComponentDef.h(2, 1);
        directiveRefresh(2, 1);
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
          elementStart(0, 'span');
          { text(1, 'bar'); }
          elementEnd();
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
            elementStart(0, LeafComponentwith);
            elementEnd();
          }
          LeafComponentwith.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
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
            elementStart(0, 'span');
            { text(1, 'bar'); }
            elementEnd();
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

  describe('markDirty, detectChanges, whenRendered, getRenderedText', () => {
    class MyComponent implements DoCheck {
      value: string = 'works';
      doCheckCount = 0;
      ngDoCheck(): void { this.doCheckCount++; }

      static ngComponentDef = defineComponent({
        type: MyComponent,
        tag: 'my-comp',
        factory: () => new MyComponent(),
        template: (ctx: MyComponent, cm: boolean) => {
          if (cm) {
            elementStart(0, 'span');
            text(1);
            elementEnd();
          }
          textBinding(1, bind(ctx.value));
        }
      });
    }

    it('should mark a component dirty and schedule change detection', withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent);
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         markDirty(myComp);
         expect(getRenderedText(myComp)).toEqual('works');
         requestAnimationFrame.flush();
         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges on a component', withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent);
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         detectChanges(myComp);
         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges only once if markDirty is called multiple times',
       withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent);
         expect(getRenderedText(myComp)).toEqual('works');
         expect(myComp.doCheckCount).toBe(1);
         myComp.value = 'ignore';
         markDirty(myComp);
         myComp.value = 'updated';
         markDirty(myComp);
         expect(getRenderedText(myComp)).toEqual('works');
         requestAnimationFrame.flush();
         expect(getRenderedText(myComp)).toEqual('updated');
         expect(myComp.doCheckCount).toBe(2);
       }));

    it('should notify whenRendered', withBody('my-comp', async() => {
         const myComp = renderComponent(MyComponent);
         await whenRendered(myComp);
         myComp.value = 'updated';
         markDirty(myComp);
         setTimeout(requestAnimationFrame.flush, 0);
         await whenRendered(myComp);
         expect(getRenderedText(myComp)).toEqual('updated');
       }));
  });
});
