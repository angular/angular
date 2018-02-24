/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, DoCheck} from '../../src/core';
import {getRenderedText} from '../../src/render3/component';
import {defineComponent} from '../../src/render3/index';
import {bind, detectChanges, directiveRefresh, elementEnd, elementProperty, elementStart, interpolation1, interpolation2, listener, text, textBinding} from '../../src/render3/instructions';
import {containerEl, renderComponent, requestAnimationFrame} from './render_util';

describe('OnPush change detection', () => {
  let comp: MyComponent;

  class MyComponent implements DoCheck {
    /* @Input() */
    name = 'Nancy';
    doCheckCount = 0;

    ngDoCheck(): void { this.doCheckCount++; }

    onClick() {}

    static ngComponentDef = defineComponent({
      type: MyComponent,
      tag: 'my-comp',
      factory: () => comp = new MyComponent(),
      /**
       * {{ doCheckCount }} - {{ name }}
       * <button (click)="onClick()"></button>
       */
      template: (ctx: MyComponent, cm: boolean) => {
        if (cm) {
          text(0);
          elementStart(1, 'button');
          {
            listener('click', () => { ctx.onClick(); });
          }
          elementEnd();
        }
        textBinding(0, interpolation2('', ctx.doCheckCount, ' - ', ctx.name, ''));
      },
      changeDetection: ChangeDetectionStrategy.OnPush,
      inputs: {name: 'name'}
    });
  }

  class MyApp {
    name: string = 'Nancy';

    static ngComponentDef = defineComponent({
      type: MyApp,
      tag: 'my-app',
      factory: () => new MyApp(),
      /** <my-comp [name]="name"></my-comp> */
      template: (ctx: MyApp, cm: boolean) => {
        if (cm) {
          elementStart(0, MyComponent);
          elementEnd();
        }
        elementProperty(0, 'name', bind(ctx.name));
        MyComponent.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      }
    });
  }

  it('should check OnPush components on initialization', () => {
    const myApp = renderComponent(MyApp);
    expect(getRenderedText(myApp)).toEqual('1 - Nancy');
  });

  it('should call doCheck even when OnPush components are not dirty', () => {
    const myApp = renderComponent(MyApp);

    detectChanges(myApp);
    expect(comp.doCheckCount).toEqual(2);

    detectChanges(myApp);
    expect(comp.doCheckCount).toEqual(3);
  });

  it('should skip OnPush components in update mode when they are not dirty', () => {
    const myApp = renderComponent(MyApp);

    detectChanges(myApp);
    // doCheckCount is 2, but 1 should be rendered since it has not been marked dirty.
    expect(getRenderedText(myApp)).toEqual('1 - Nancy');

    detectChanges(myApp);
    // doCheckCount is 3, but 1 should be rendered since it has not been marked dirty.
    expect(getRenderedText(myApp)).toEqual('1 - Nancy');
  });

  it('should check OnPush components in update mode when inputs change', () => {
    const myApp = renderComponent(MyApp);

    myApp.name = 'Bess';
    detectChanges(myApp);
    expect(getRenderedText(myApp)).toEqual('2 - Bess');

    myApp.name = 'George';
    detectChanges(myApp);
    expect(getRenderedText(myApp)).toEqual('3 - George');

    detectChanges(myApp);
    expect(getRenderedText(myApp)).toEqual('3 - George');
  });

  it('should check OnPush components in update mode when component events occur', () => {
    const myApp = renderComponent(MyApp);
    expect(getRenderedText(myApp)).toEqual('1 - Nancy');

    const button = containerEl.querySelector('button') !;
    button.click();
    requestAnimationFrame.flush();
    expect(getRenderedText(myApp)).toEqual('2 - Nancy');

    detectChanges(myApp);
    expect(getRenderedText(myApp)).toEqual('2 - Nancy');
  });

  it('should not check OnPush components in update mode when parent events occur', () => {
    class ButtonParent {
      noop() {}

      static ngComponentDef = defineComponent({
        type: ButtonParent,
        tag: 'button-parent',
        factory: () => new ButtonParent(),
        /**
         * <my-comp></my-comp>
         * <button id="parent" (click)="noop()"></button>
         */
        template: (ctx: ButtonParent, cm: boolean) => {
          if (cm) {
            elementStart(0, MyComponent);
            elementEnd();
            elementStart(2, 'button', ['id', 'parent']);
            { listener('click', () => ctx.noop()); }
            elementEnd();
          }
          MyComponent.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
        }
      });
    }
    const buttonParent = renderComponent(ButtonParent);
    expect(getRenderedText(buttonParent)).toEqual('1 - Nancy');

    const button = containerEl.querySelector('button#parent') !;
    (button as HTMLButtonElement).click();
    requestAnimationFrame.flush();
    expect(getRenderedText(buttonParent)).toEqual('1 - Nancy');
  });

  it('should check parent OnPush components in update mode when child events occur', () => {
    let parent: ButtonParent;

    class ButtonParent implements DoCheck {
      doCheckCount = 0;
      ngDoCheck(): void { this.doCheckCount++; }

      static ngComponentDef = defineComponent({
        type: ButtonParent,
        tag: 'button-parent',
        factory: () => parent = new ButtonParent(),
        /** {{ doCheckCount }} - <my-comp></my-comp> */
        template: (ctx: ButtonParent, cm: boolean) => {
          if (cm) {
            text(0);
            elementStart(1, MyComponent);
            elementEnd();
          }
          textBinding(0, interpolation1('', ctx.doCheckCount, ' - '));
          MyComponent.ngComponentDef.h(2, 1);
          directiveRefresh(2, 1);
        },
        changeDetection: ChangeDetectionStrategy.OnPush
      });
    }

    class MyButtonApp {
      static ngComponentDef = defineComponent({
        type: MyButtonApp,
        tag: 'my-button-app',
        factory: () => new MyButtonApp(),
        /** <button-parent></button-parent> */
        template: (ctx: MyButtonApp, cm: boolean) => {
          if (cm) {
            elementStart(0, ButtonParent);
            elementEnd();
          }
          ButtonParent.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
        }
      });
    }

    const myButtonApp = renderComponent(MyButtonApp);
    expect(parent !.doCheckCount).toEqual(1);
    expect(comp !.doCheckCount).toEqual(1);
    expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

    detectChanges(myButtonApp);
    expect(parent !.doCheckCount).toEqual(2);
    // parent isn't checked, so child doCheck won't run
    expect(comp !.doCheckCount).toEqual(1);
    expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

    const button = containerEl.querySelector('button');
    button !.click();
    requestAnimationFrame.flush();
    expect(parent !.doCheckCount).toEqual(3);
    expect(comp !.doCheckCount).toEqual(2);
    expect(getRenderedText(myButtonApp)).toEqual('3 - 2 - Nancy');
  });

});
