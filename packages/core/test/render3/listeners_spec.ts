/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bind, defineComponent, defineDirective, markDirty, reference, textBinding} from '../../src/render3/index';
import {container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementStart, embeddedViewEnd, embeddedViewStart, listener, text} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {getCurrentView, restoreView} from '../../src/render3/state';

import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, containerEl, createComponent, getDirectiveOnNode, renderToHtml, requestAnimationFrame} from './render_util';


describe('event listeners', () => {
  let comps: MyComp[] = [];

  class MyComp {
    showing = true;
    counter = 0;

    onClick() { this.counter++; }

    static ngComponentDef = defineComponent({
      type: MyComp,
      selectors: [['comp']],
      consts: 2,
      vars: 0,
      /** <button (click)="onClick()"> Click me </button> */
      template: function CompTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button');
          {
            listener('click', function() { return ctx.onClick(); });
            text(1, 'Click me');
          }
          elementEnd();
        }
      },
      factory: () => {
        let comp = new MyComp();
        comps.push(comp);
        return comp;
      }
    });
  }

  class PreventDefaultComp {
    handlerReturnValue: any = true;
    // TODO(issue/24571): remove '!'.
    event !: Event;

    onClick(e: any) {
      this.event = e;

      // stub preventDefault() to check whether it's called
      Object.defineProperty(
          this.event, 'preventDefault',
          {value: jasmine.createSpy('preventDefault'), writable: true});

      return this.handlerReturnValue;
    }

    static ngComponentDef = defineComponent({
      type: PreventDefaultComp,
      selectors: [['prevent-default-comp']],
      factory: () => new PreventDefaultComp(),
      consts: 2,
      vars: 0,
      /** <button (click)="onClick($event)">Click</button> */
      template: (rf: RenderFlags, ctx: PreventDefaultComp) => {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button');
          {
            listener('click', function($event: any) { return ctx.onClick($event); });
            text(1, 'Click');
          }
          elementEnd();
        }
      }
    });
  }

  beforeEach(() => { comps = []; });

  it('should call function on event emit', () => {
    const fixture = new ComponentFixture(MyComp);
    const comp = fixture.component;
    const button = fixture.hostElement.querySelector('button') !;

    button.click();
    expect(comp.counter).toEqual(1);

    button.click();
    expect(comp.counter).toEqual(2);
  });

  it('should retain event handler return values using document', () => {
    const fixture = new ComponentFixture(PreventDefaultComp);
    const preventDefaultComp = fixture.component;
    const button = fixture.hostElement.querySelector('button') !;

    button.click();
    expect(preventDefaultComp.event !.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = undefined;
    button.click();
    expect(preventDefaultComp.event !.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = false;
    button.click();
    expect(preventDefaultComp.event !.preventDefault).toHaveBeenCalled();
  });

  it('should retain event handler return values with renderer2', () => {
    const fixture =
        new ComponentFixture(PreventDefaultComp, {rendererFactory: getRendererFactory2(document)});
    const preventDefaultComp = fixture.component;
    const button = fixture.hostElement.querySelector('button') !;

    button.click();
    expect(preventDefaultComp.event !.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = undefined;
    button.click();
    expect(preventDefaultComp.event !.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = false;
    button.click();
    expect(preventDefaultComp.event !.preventDefault).toHaveBeenCalled();
  });

  it('should call function chain on event emit', () => {
    /** <button (click)="onClick(); onClick2(); "> Click me </button> */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button');
        {
          listener('click', function() {
            ctx.onClick();
            return ctx.onClick2();
          });
          text(1, 'Click me');
        }
        elementEnd();
      }
    }

    const ctx = {
      counter: 0,
      counter2: 0,
      onClick: function() { this.counter++; },
      onClick2: function() { this.counter2++; }
    };
    renderToHtml(Template, ctx, 2);
    const button = containerEl.querySelector('button') !;

    button.click();
    expect(ctx.counter).toBe(1);
    expect(ctx.counter2).toBe(1);

    button.click();
    expect(ctx.counter).toBe(2);
    expect(ctx.counter2).toBe(2);
  });

  it('should evaluate expression on event emit', () => {

    /** <button (click)="showing=!showing"> Click me </button> */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button');
        {
          listener('click', function() { return ctx.showing = !ctx.showing; });
          text(1, 'Click me');
        }
        elementEnd();
      }
    }

    const ctx = {showing: false};
    renderToHtml(Template, ctx, 2);
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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.showing) {
            if (embeddedViewStart(1, 2, 0)) {
              elementStart(0, 'button');
              {
                listener('click', function() { return ctx.onClick(); });
                text(1, 'Click me');
              }
              elementEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    let comp = new MyComp();
    renderToHtml(Template, comp, 1);
    const button = containerEl.querySelector('button') !;

    button.click();
    expect(comp.counter).toEqual(1);

    button.click();
    expect(comp.counter).toEqual(2);

    // the listener should be removed when the view is removed
    comp.showing = false;
    renderToHtml(Template, comp, 1);
    button.click();
    expect(comp.counter).toEqual(2);
  });

  it('should destroy listeners in views with renderer2', () => {

    /**
       * % if (ctx.showing) {
       *  <button (click)="onClick()"> Click me </button>
       * % }
     */
    class AppComp {
      counter = 0;
      showing = true;

      onClick() { this.counter++; }

      static ngComponentDef = defineComponent({
        type: AppComp,
        selectors: [['app-comp']],
        factory: () => new AppComp(),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            container(0);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(0);
            {
              if (ctx.showing) {
                if (embeddedViewStart(0, 2, 0)) {
                  elementStart(0, 'button');
                  {
                    listener('click', function() { return ctx.onClick(); });
                    text(1, 'Click me');
                  }
                  elementEnd();
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
        }
      });
    }

    const fixture = new ComponentFixture(AppComp, {rendererFactory: getRendererFactory2(document)});
    const comp = fixture.component;
    const button = fixture.hostElement.querySelector('button') !;

    button.click();
    expect(comp.counter).toEqual(1);

    button.click();
    expect(comp.counter).toEqual(2);

    // the listener should be removed when the view is removed
    comp.showing = false;
    fixture.update();
    button.click();
    expect(comp.counter).toEqual(2);
  });

  it('should destroy listeners in for loops', () => {

    /**
       * % for (let i = 0; i < ctx.buttons; i++) {
       *  <button (click)="onClick(i)"> Click me </button>
       * % }
     */
    class AppComp {
      buttons = 2;
      counters = [0, 0];

      onClick(index: number) { this.counters[index]++; }

      static ngComponentDef = defineComponent({
        type: AppComp,
        selectors: [['app-comp']],
        factory: () => new AppComp(),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            container(0);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(0);
            {
              for (let i = 0; i < ctx.buttons; i++) {
                if (embeddedViewStart(0, 2, 0)) {
                  elementStart(0, 'button');
                  {
                    listener('click', function() { return ctx.onClick(i); });
                    text(1, 'Click me');
                  }
                  elementEnd();
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
        }
      });
    }

    const fixture = new ComponentFixture(AppComp);
    const comp = fixture.component;
    const buttons = fixture.hostElement.querySelectorAll('button') !;

    buttons[0].click();
    expect(comp.counters).toEqual([1, 0]);

    buttons[1].click();
    expect(comp.counters).toEqual([1, 1]);

    // the listener should be removed when the view is removed
    comp.buttons = 0;
    fixture.update();

    buttons[0].click();
    buttons[1].click();
    expect(comp.counters).toEqual([1, 1]);
  });

  it('should destroy listeners in for loops with renderer2', () => {

    /**
       * % for (let i = 0; i < ctx.buttons; i++) {
       *  <button (click)="onClick(i)"> Click me </button>
       *    {{ counters[i] }}
       * % }
     */
    class AppComp {
      buttons = 2;
      counters = [0, 0];

      onClick(index: number) { this.counters[index]++; }

      static ngComponentDef = defineComponent({
        type: AppComp,
        selectors: [['app-comp']],
        factory: () => new AppComp(),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            container(0);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(0);
            {
              for (let i = 0; i < ctx.buttons; i++) {
                const rf1 = embeddedViewStart(1, 4, 1);
                if (rf1 & RenderFlags.Create) {
                  elementStart(0, 'button');
                  {
                    listener('click', function() { return ctx.onClick(i); });
                    text(1, 'Click me');
                  }
                  elementEnd();
                  elementStart(2, 'div');
                  { text(3); }
                  elementEnd();
                }
                if (rf1 & RenderFlags.Update) {
                  textBinding(3, bind(ctx.counters[i]));
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
        }
      });
    }

    const fixture = new ComponentFixture(AppComp, {rendererFactory: getRendererFactory2(document)});
    const comp = fixture.component;
    const buttons = fixture.hostElement.querySelectorAll('button') !;
    const divs = fixture.hostElement.querySelectorAll('div');

    buttons[0].click();
    expect(comp.counters).toEqual([1, 0]);
    expect(divs[0].textContent).toEqual('0');
    expect(divs[1].textContent).toEqual('0');

    markDirty(comp);
    requestAnimationFrame.flush();
    expect(divs[0].textContent).toEqual('1');
    expect(divs[1].textContent).toEqual('0');

    buttons[1].click();
    expect(comp.counters).toEqual([1, 1]);
    expect(divs[0].textContent).toEqual('1');
    expect(divs[1].textContent).toEqual('0');

    markDirty(comp);
    requestAnimationFrame.flush();
    expect(divs[0].textContent).toEqual('1');
    expect(divs[1].textContent).toEqual('1');

    // the listener should be removed when the view is removed
    comp.buttons = 0;
    fixture.update();

    buttons[0].click();
    buttons[1].click();
    expect(comp.counters).toEqual([1, 1]);
  });

  it('should support host listeners', () => {
    let events: string[] = [];

    class HostListenerDir {
      /* @HostListener('click') */
      onClick() { events.push('click!'); }

      static ngDirectiveDef = defineDirective({
        type: HostListenerDir,
        selectors: [['', 'hostListenerDir', '']],
        factory: function HostListenerDir_Factory() {
          const $dir$ = new HostListenerDir();
          listener('click', function() { return $dir$.onClick(); });
          return $dir$;
        },
      });
    }

    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button', ['hostListenerDir', '']);
        text(1, 'Click');
        elementEnd();
      }
    }

    renderToHtml(Template, {}, 2, 0, [HostListenerDir]);
    const button = containerEl.querySelector('button') !;
    button.click();
    expect(events).toEqual(['click!']);

    button.click();
    expect(events).toEqual(['click!', 'click!']);
  });

  it('should support listeners with specified set of args', () => {
    class MyComp {
      counter = 0;
      data = {a: 1, b: 2};

      onClick(a: any, b: any) { this.counter += a + b; }

      static ngComponentDef = defineComponent({
        type: MyComp,
        selectors: [['comp']],
        consts: 2,
        vars: 0,
        /** <button (click)="onClick(data.a, data.b)"> Click me </button> */
        template: function CompTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'button');
            {
              listener('click', function() { return ctx.onClick(ctx.data.a, ctx.data.b); });
              text(1, 'Click me');
            }
            elementEnd();
          }
        },
        factory: () => new MyComp()
      });
    }

    const fixture = new ComponentFixture(MyComp);
    const comp = fixture.component;
    const button = fixture.hostElement.querySelector('button') !;

    button.click();
    expect(comp.counter).toEqual(3);

    button.click();
    expect(comp.counter).toEqual(6);
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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.showing) {
            let rf1 = embeddedViewStart(0, 2, 0);
            if (rf1 & RenderFlags.Create) {
              text(0, 'Hello');
              container(1);
            }
            if (rf1 & RenderFlags.Update) {
              containerRefreshStart(1);
              {
                if (ctx.button) {
                  let rf1 = embeddedViewStart(0, 2, 0);
                  if (rf1 & RenderFlags.Create) {
                    elementStart(0, 'button');
                    {
                      listener('click', function() { return ctx.onClick(); });
                      text(1, 'Click');
                    }
                    elementEnd();
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    const comp = {showing: true, counter: 0, button: true, onClick: function() { this.counter++; }};
    renderToHtml(Template, comp, 1);
    const button = containerEl.querySelector('button') !;

    button.click();
    expect(comp.counter).toEqual(1);

    // the child view listener should be removed when the parent view is removed
    comp.showing = false;
    renderToHtml(Template, comp, 1);
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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.showing) {
            let rf1 = embeddedViewStart(0, 3, 0);
            if (rf1 & RenderFlags.Create) {
              text(0, 'Hello');
              element(1, 'comp');
              element(2, 'comp');
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    const ctx = {showing: true};
    renderToHtml(Template, ctx, 1, 0, [MyComp]);
    const buttons = containerEl.querySelectorAll('button') !;

    buttons[0].click();
    expect(comps[0] !.counter).toEqual(1);

    buttons[1].click();
    expect(comps[1] !.counter).toEqual(1);

    // the child view listener should be removed when the parent view is removed
    ctx.showing = false;
    renderToHtml(Template, ctx, 1, 0, [MyComp]);
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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(0, 3, 0);
            if (rf1 & RenderFlags.Create) {
              text(0, 'Hello');
              container(1);
              container(2);
            }
            if (rf1 & RenderFlags.Update) {
              containerRefreshStart(1);
              {
                if (ctx.sub1) {
                  let rf1 = embeddedViewStart(0, 2, 0);
                  if (rf1 & RenderFlags.Create) {
                    elementStart(0, 'button');
                    {
                      listener('click', function() { return ctx.counter1++; });
                      text(1, 'Click');
                    }
                    elementEnd();
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
              containerRefreshStart(2);
              {
                if (ctx.sub2) {
                  let rf1 = embeddedViewStart(0, 2, 0);
                  if (rf1 & RenderFlags.Create) {
                    elementStart(0, 'button');
                    {
                      listener('click', function() { return ctx.counter2++; });
                      text(1, 'Click');
                    }
                    elementEnd();
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    const ctx = {condition: true, counter1: 0, counter2: 0, sub1: true, sub2: true};
    renderToHtml(Template, ctx, 1);
    const buttons = containerEl.querySelectorAll('button') !;

    buttons[0].click();
    expect(ctx.counter1).toEqual(1);

    buttons[1].click();
    expect(ctx.counter2).toEqual(1);

    // the child view listeners should be removed when the parent view is removed
    ctx.condition = false;
    renderToHtml(Template, ctx, 1);
    buttons[0].click();
    buttons[1].click();
    expect(ctx.counter1).toEqual(1);
    expect(ctx.counter2).toEqual(1);

  });

  it('should support local refs in listeners', () => {
    let compInstance: any;

    const Comp = createComponent('comp', (rf: RenderFlags, ctx: any) => {});

    /**
     * <comp #comp></comp>
     * <button (click)="onClick(comp)"></button>
     */
    class App {
      comp: any = null;

      onClick(comp: any) { this.comp = comp; }

      static ngComponentDef = defineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        consts: 3,
        vars: 0,
        template: (rf: RenderFlags, ctx: App) => {
          if (rf & RenderFlags.Create) {
            const state = getCurrentView();
            element(0, 'comp', null, ['comp', '']);
            elementStart(2, 'button');
            {
              listener('click', function() {
                restoreView(state);
                const comp = reference(1);
                return ctx.onClick(comp);
              });
            }
            elementEnd();
          }

          // testing only
          compInstance = getDirectiveOnNode(0);
        },
        directives: [Comp]
      });
    }

    const fixture = new ComponentFixture(App);
    expect(fixture.component.comp).toEqual(null);

    const button = fixture.hostElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(fixture.component.comp).toEqual(compInstance);
  });

});
