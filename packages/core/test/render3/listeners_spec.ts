/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {C, E, L, T, V, cR, cr, defineComponent, e, r, v} from '../../src/render3/index';

import {containerEl, renderComponent, renderToHtml} from './render_util';


describe('event listeners', () => {
  let comps: MyComp[] = [];

  class MyComp {
    showing = true;
    counter = 0;

    onClick() { this.counter++; }

    static ngComponentDef = defineComponent({
      type: MyComp,
      tag: 'comp',
      /** <button (click)="onClick()"> Click me </button> */
      template: function CompTemplate(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'button');
          {
            L('click', ctx.onClick.bind(ctx));
            T(1, 'Click me');
          }
          e();
        }
      },
      factory: () => {
        let comp = new MyComp();
        comps.push(comp);
        return comp;
      }
    });
  }

  beforeEach(() => { comps = []; });

  it('should call function on event emit', () => {
    const comp = renderComponent(MyComp);
    const button = containerEl.querySelector('button') !;
    button.click();
    expect(comp.counter).toEqual(1);

    button.click();
    expect(comp.counter).toEqual(2);
  });

  it('should evaluate expression on event emit', () => {

    /** <button (click)="showing=!showing"> Click me </button> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        E(0, 'button');
        {
          L('click', () => ctx.showing = !ctx.showing);
          T(1, 'Click me');
        }
        e();
      }
    }

    const ctx = {showing: false};
    renderToHtml(Template, ctx);
    const button = containerEl.querySelector('button') !;

    button.click();
    expect(ctx.showing).toBe(true);

    button.click();
    expect(ctx.showing).toBe(false);
  });

  it('should support listeners in views', () => {

    /**
     * % if (ctx.showing) {
       *  <button (click)="onClick()"> Click me </button>
       * % }
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        C(0);
      }
      cR(0);
      {
        if (ctx.showing) {
          if (V(1)) {
            E(0, 'button');
            {
              L('click', ctx.onClick.bind(ctx));
              T(1, 'Click me');
            }
            e();
          }
          v();
        }
      }
      cr();
    }

    let comp = new MyComp();
    renderToHtml(Template, comp);
    const button = containerEl.querySelector('button') !;

    button.click();
    expect(comp.counter).toEqual(1);

    button.click();
    expect(comp.counter).toEqual(2);

    // the listener should be removed when the view is removed
    comp.showing = false;
    renderToHtml(Template, comp);
    button.click();
    expect(comp.counter).toEqual(2);
  });

  it('should destroy listeners in nested views', () => {

    /**
     * % if (showing) {
       *    Hello
       *    % if (button) {
       *      <button (click)="onClick()"> Click </button>
       *    % }
       * % }
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        C(0);
      }
      cR(0);
      {
        if (ctx.showing) {
          if (V(0)) {
            T(0, 'Hello');
            C(1);
          }
          cR(1);
          {
            if (ctx.button) {
              if (V(0)) {
                E(0, 'button');
                {
                  L('click', ctx.onClick.bind(ctx));
                  T(1, 'Click');
                }
                e();
              }
              v();
            }
          }
          cr();
          v();
        }
      }
      cr();
    }

    const comp = {showing: true, counter: 0, button: true, onClick: function() { this.counter++; }};
    renderToHtml(Template, comp);
    const button = containerEl.querySelector('button') !;

    button.click();
    expect(comp.counter).toEqual(1);

    // the child view listener should be removed when the parent view is removed
    comp.showing = false;
    renderToHtml(Template, comp);
    button.click();
    expect(comp.counter).toEqual(1);
  });

  it('should destroy listeners in component views', () => {

    /**
     * % if (showing) {
       *    Hello
       *    <comp></comp>
       *    <comp></comp>
       * % }
     *
     * comp:
     * <button (click)="onClick()"> Click </button>
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        C(0);
      }
      cR(0);
      {
        if (ctx.showing) {
          if (V(0)) {
            T(0, 'Hello');
            E(1, MyComp);
            e();
            E(3, MyComp);
            e();
          }
          MyComp.ngComponentDef.h(2, 1);
          MyComp.ngComponentDef.h(4, 3);
          r(2, 1);
          r(4, 3);
          v();
        }
      }
      cr();
    }

    const ctx = {showing: true};
    renderToHtml(Template, ctx);
    const buttons = containerEl.querySelectorAll('button') !;

    buttons[0].click();
    expect(comps[0] !.counter).toEqual(1);

    buttons[1].click();
    expect(comps[1] !.counter).toEqual(1);

    // the child view listener should be removed when the parent view is removed
    ctx.showing = false;
    renderToHtml(Template, ctx);
    buttons[0].click();
    buttons[1].click();
    expect(comps[0] !.counter).toEqual(1);
    expect(comps[1] !.counter).toEqual(1);
  });

  it('should support listeners with sibling nested containers', () => {
    /**
     * % if (condition) {
     *   Hello
     *   % if (sub1) {
     *     <button (click)="counter1++">there</button>
     *   % }
     *
     *   % if (sub2) {
     *    <button (click)="counter2++">world</button>
     *   % }
     * % }
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        C(0);
      }
      cR(0);
      {
        if (ctx.condition) {
          if (V(0)) {
            T(0, 'Hello');
            C(1);
            C(2);
          }
          cR(1);
          {
            if (ctx.sub1) {
              if (V(0)) {
                E(0, 'button');
                {
                  L('click', () => ctx.counter1++);
                  T(1, 'Click');
                }
                e();
              }
              v();
            }
          }
          cr();
          cR(2);
          {
            if (ctx.sub2) {
              if (V(0)) {
                E(0, 'button');
                {
                  L('click', () => ctx.counter2++);
                  T(1, 'Click');
                }
                e();
              }
              v();
            }
          }
          cr();
          v();
        }
      }
      cr();
    }

    const ctx = {condition: true, counter1: 0, counter2: 0, sub1: true, sub2: true};
    renderToHtml(Template, ctx);
    const buttons = containerEl.querySelectorAll('button') !;

    buttons[0].click();
    expect(ctx.counter1).toEqual(1);

    buttons[1].click();
    expect(ctx.counter2).toEqual(1);

    // the child view listeners should be removed when the parent view is removed
    ctx.condition = false;
    renderToHtml(Template, ctx);
    buttons[0].click();
    buttons[1].click();
    expect(ctx.counter1).toEqual(1);
    expect(ctx.counter2).toEqual(1);

  });

});
