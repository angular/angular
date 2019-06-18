/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dispatchEvent} from '@angular/platform-browser/testing/src/browser_util';

import {markDirty, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵreference, ɵɵresolveBody, ɵɵresolveDocument, ɵɵselect, ɵɵtextBinding} from '../../src/render3/index';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵgetCurrentView, ɵɵlistener, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {GlobalTargetResolver} from '../../src/render3/interfaces/renderer';
import {ɵɵrestoreView} from '../../src/render3/state';
import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, TemplateFixture, containerEl, createComponent, getDirectiveOnNode, renderToHtml, requestAnimationFrame} from './render_util';


describe('event listeners', () => {
  let comps: any[] = [];
  let events: any[] = [];

  class MyComp {
    showing = true;
    counter = 0;

    onClick() { this.counter++; }

    static ngComponentDef = ɵɵdefineComponent({
      type: MyComp,
      selectors: [['comp']],
      consts: 2,
      vars: 0,
      /** <button (click)="onClick()"> Click me </button> */
      template: function CompTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'button');
          {
            ɵɵlistener('click', function() { return ctx.onClick(); });
            ɵɵtext(1, 'Click me');
          }
          ɵɵelementEnd();
        }
      },
      factory: () => {
        let comp = new MyComp();
        comps.push(comp);
        return comp;
      }
    });
  }

  class MyCompWithGlobalListeners {
    /* @HostListener('document:custom') */
    onDocumentCustomEvent() { events.push('component - document:custom'); }

    /* @HostListener('body:click') */
    onBodyClick() { events.push('component - body:click'); }

    static ngComponentDef = ɵɵdefineComponent({
      type: MyCompWithGlobalListeners,
      selectors: [['comp']],
      consts: 1,
      vars: 0,
      template: function CompTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵtext(0, 'Some text');
        }
      },
      factory: () => {
        let comp = new MyCompWithGlobalListeners();
        comps.push(comp);
        return comp;
      },
      hostBindings: function HostListenerDir_HostBindings(
          rf: RenderFlags, ctx: any, elIndex: number) {
        if (rf & RenderFlags.Create) {
          ɵɵlistener('custom', function() {
            return ctx.onDocumentCustomEvent();
          }, false, ɵɵresolveDocument as GlobalTargetResolver);
          ɵɵlistener('click', function() {
            return ctx.onBodyClick();
          }, false, ɵɵresolveBody as GlobalTargetResolver);
        }
      }
    });
  }

  class GlobalHostListenerDir {
    /* @HostListener('document:custom') */
    onDocumentCustomEvent() { events.push('directive - document:custom'); }

    /* @HostListener('body:click') */
    onBodyClick() { events.push('directive - body:click'); }

    static ngDirectiveDef = ɵɵdefineDirective({
      type: GlobalHostListenerDir,
      selectors: [['', 'hostListenerDir', '']],
      factory: function HostListenerDir_Factory() { return new GlobalHostListenerDir(); },
      hostBindings: function HostListenerDir_HostBindings(
          rf: RenderFlags, ctx: any, elIndex: number) {
        if (rf & RenderFlags.Create) {
          ɵɵlistener('custom', function() {
            return ctx.onDocumentCustomEvent();
          }, false, ɵɵresolveDocument as GlobalTargetResolver);
          ɵɵlistener('click', function() {
            return ctx.onBodyClick();
          }, false, ɵɵresolveBody as GlobalTargetResolver);
        }
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

    static ngComponentDef = ɵɵdefineComponent({
      type: PreventDefaultComp,
      selectors: [['prevent-default-comp']],
      factory: () => new PreventDefaultComp(),
      consts: 2,
      vars: 0,
      /** <button (click)="onClick($event)">Click</button> */
      template: (rf: RenderFlags, ctx: PreventDefaultComp) => {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'button');
          {
            ɵɵlistener('click', function($event: any) { return ctx.onClick($event); });
            ɵɵtext(1, 'Click');
          }
          ɵɵelementEnd();
        }
      }
    });
  }

  beforeEach(() => {
    comps = [];
    events = [];
  });

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
        ɵɵelementStart(0, 'button');
        {
          ɵɵlistener('click', function() {
            ctx.onClick();
            return ctx.onClick2();
          });
          ɵɵtext(1, 'Click me');
        }
        ɵɵelementEnd();
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
        ɵɵelementStart(0, 'button');
        {
          ɵɵlistener('click', function() { return ctx.showing = !ctx.showing; });
          ɵɵtext(1, 'Click me');
        }
        ɵɵelementEnd();
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
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        {
          if (ctx.showing) {
            if (ɵɵembeddedViewStart(1, 2, 0)) {
              ɵɵelementStart(0, 'button');
              {
                ɵɵlistener('click', function() { return ctx.onClick(); });
                ɵɵtext(1, 'Click me');
              }
              ɵɵelementEnd();
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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

      static ngComponentDef = ɵɵdefineComponent({
        type: AppComp,
        selectors: [['app-comp']],
        factory: () => new AppComp(),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵcontainer(0);
          }
          if (rf & RenderFlags.Update) {
            ɵɵcontainerRefreshStart(0);
            {
              if (ctx.showing) {
                if (ɵɵembeddedViewStart(0, 2, 0)) {
                  ɵɵelementStart(0, 'button');
                  {
                    ɵɵlistener('click', function() { return ctx.onClick(); });
                    ɵɵtext(1, 'Click me');
                  }
                  ɵɵelementEnd();
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
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

      static ngComponentDef = ɵɵdefineComponent({
        type: AppComp,
        selectors: [['app-comp']],
        factory: () => new AppComp(),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵcontainer(0);
          }
          if (rf & RenderFlags.Update) {
            ɵɵcontainerRefreshStart(0);
            {
              for (let i = 0; i < ctx.buttons; i++) {
                if (ɵɵembeddedViewStart(0, 2, 0)) {
                  ɵɵelementStart(0, 'button');
                  {
                    ɵɵlistener('click', function() { return ctx.onClick(i); });
                    ɵɵtext(1, 'Click me');
                  }
                  ɵɵelementEnd();
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
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

      static ngComponentDef = ɵɵdefineComponent({
        type: AppComp,
        selectors: [['app-comp']],
        factory: () => new AppComp(),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵcontainer(0);
          }
          if (rf & RenderFlags.Update) {
            ɵɵcontainerRefreshStart(0);
            {
              for (let i = 0; i < ctx.buttons; i++) {
                const rf1 = ɵɵembeddedViewStart(1, 4, 1);
                if (rf1 & RenderFlags.Create) {
                  ɵɵelementStart(0, 'button');
                  {
                    ɵɵlistener('click', function() { return ctx.onClick(i); });
                    ɵɵtext(1, 'Click me');
                  }
                  ɵɵelementEnd();
                  ɵɵelementStart(2, 'div');
                  { ɵɵtext(3); }
                  ɵɵelementEnd();
                }
                if (rf1 & RenderFlags.Update) {
                  ɵɵselect(3);
                  ɵɵtextBinding(ctx.counters[i]);
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
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

  it('should support host listeners on components', () => {
    let events: string[] = [];
    class MyComp {
      /* @HostListener('click') */
      onClick() { events.push('click!'); }

      static ngComponentDef = ɵɵdefineComponent({
        type: MyComp,
        selectors: [['comp']],
        consts: 1,
        vars: 0,
        template: function CompTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵtext(0, 'Some text');
          }
        },
        factory: () => { return new MyComp(); },
        hostBindings: function HostListenerDir_HostBindings(
            rf: RenderFlags, ctx: any, elIndex: number) {
          if (rf & RenderFlags.Create) {
            ɵɵlistener('click', function() { return ctx.onClick(); });
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyComp);
    const host = fixture.hostElement;

    host.click();
    expect(events).toEqual(['click!']);

    host.click();
    expect(events).toEqual(['click!', 'click!']);
  });

  it('should support global host listeners on components', () => {
    const fixture = new ComponentFixture(MyCompWithGlobalListeners);
    const doc = fixture.hostElement.ownerDocument !;

    dispatchEvent(doc, 'custom');
    expect(events).toEqual(['component - document:custom']);

    dispatchEvent(doc.body, 'click');
    expect(events).toEqual(['component - document:custom', 'component - body:click']);

    // invoke destroy for this fixture to cleanup all listeners setup for global objects
    fixture.destroy();
  });

  it('should support host listeners on directives', () => {
    let events: string[] = [];

    class HostListenerDir {
      /* @HostListener('click') */
      onClick() { events.push('click!'); }

      static ngDirectiveDef = ɵɵdefineDirective({
        type: HostListenerDir,
        selectors: [['', 'hostListenerDir', '']],
        factory: function HostListenerDir_Factory() { return new HostListenerDir(); },
        hostBindings: function HostListenerDir_HostBindings(
            rf: RenderFlags, ctx: any, elIndex: number) {
          if (rf & RenderFlags.Create) {
            ɵɵlistener('click', function() { return ctx.onClick(); });
          }
        }
      });
    }

    const fixture = new TemplateFixture(() => {
      ɵɵelementStart(0, 'button', ['hostListenerDir', '']);
      ɵɵtext(1, 'Click');
      ɵɵelementEnd();
    }, () => {}, 2, 0, [HostListenerDir]);

    const button = fixture.hostElement.querySelector('button') !;

    button.click();
    expect(events).toEqual(['click!']);

    button.click();
    expect(events).toEqual(['click!', 'click!']);
  });

  it('should support global host listeners on directives', () => {
    const fixture = new TemplateFixture(() => {
      ɵɵelement(0, 'div', ['hostListenerDir', '']);
    }, () => {}, 1, 0, [GlobalHostListenerDir]);

    const doc = fixture.hostElement.ownerDocument !;

    dispatchEvent(doc, 'custom');
    expect(events).toEqual(['directive - document:custom']);

    dispatchEvent(doc.body, 'click');
    expect(events).toEqual(['directive - document:custom', 'directive - body:click']);

    // invoke destroy for this fixture to cleanup all listeners setup for global objects
    fixture.destroy();
  });

  it('should support listeners with specified set of args', () => {
    class MyComp {
      counter = 0;
      data = {a: 1, b: 2};

      onClick(a: any, b: any) { this.counter += a + b; }

      static ngComponentDef = ɵɵdefineComponent({
        type: MyComp,
        selectors: [['comp']],
        consts: 2,
        vars: 0,
        /** <button (click)="onClick(data.a, data.b)"> Click me </button> */
        template: function CompTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'button');
            {
              ɵɵlistener('click', function() { return ctx.onClick(ctx.data.a, ctx.data.b); });
              ɵɵtext(1, 'Click me');
            }
            ɵɵelementEnd();
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
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        {
          if (ctx.showing) {
            let rf1 = ɵɵembeddedViewStart(0, 2, 0);
            if (rf1 & RenderFlags.Create) {
              ɵɵtext(0, 'Hello');
              ɵɵcontainer(1);
            }
            if (rf1 & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(1);
              {
                if (ctx.button) {
                  let rf1 = ɵɵembeddedViewStart(0, 2, 0);
                  if (rf1 & RenderFlags.Create) {
                    ɵɵelementStart(0, 'button');
                    {
                      ɵɵlistener('click', function() { return ctx.onClick(); });
                      ɵɵtext(1, 'Click');
                    }
                    ɵɵelementEnd();
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        {
          if (ctx.showing) {
            let rf1 = ɵɵembeddedViewStart(0, 3, 0);
            if (rf1 & RenderFlags.Create) {
              ɵɵtext(0, 'Hello');
              ɵɵelement(1, 'comp');
              ɵɵelement(2, 'comp');
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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

  it('should destroy global listeners in component views', () => {
    const ctx = {showing: true};

    const fixture = new TemplateFixture(
        () => { ɵɵcontainer(0); },
        () => {
          ɵɵcontainerRefreshStart(0);
          {
            if (ctx.showing) {
              let rf1 = ɵɵembeddedViewStart(0, 1, 0);
              if (rf1 & RenderFlags.Create) {
                ɵɵelement(0, 'comp');
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
        },
        1, 0, [MyCompWithGlobalListeners]);

    const body = fixture.hostElement.ownerDocument !.body;

    body.click();
    expect(events).toEqual(['component - body:click']);

    // the child view listener should be removed when the parent view is removed
    ctx.showing = false;
    fixture.update();

    body.click();
    // expecting no changes in events array
    expect(events).toEqual(['component - body:click']);
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
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(0, 3, 0);
            if (rf1 & RenderFlags.Create) {
              ɵɵtext(0, 'Hello');
              ɵɵcontainer(1);
              ɵɵcontainer(2);
            }
            if (rf1 & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(1);
              {
                if (ctx.sub1) {
                  let rf1 = ɵɵembeddedViewStart(0, 2, 0);
                  if (rf1 & RenderFlags.Create) {
                    ɵɵelementStart(0, 'button');
                    {
                      ɵɵlistener('click', function() { return ctx.counter1++; });
                      ɵɵtext(1, 'Click');
                    }
                    ɵɵelementEnd();
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
              ɵɵcontainerRefreshStart(2);
              {
                if (ctx.sub2) {
                  let rf1 = ɵɵembeddedViewStart(0, 2, 0);
                  if (rf1 & RenderFlags.Create) {
                    ɵɵelementStart(0, 'button');
                    {
                      ɵɵlistener('click', function() { return ctx.counter2++; });
                      ɵɵtext(1, 'Click');
                    }
                    ɵɵelementEnd();
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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

      static ngComponentDef = ɵɵdefineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        consts: 3,
        vars: 0,
        template: (rf: RenderFlags, ctx: App) => {
          if (rf & RenderFlags.Create) {
            const state = ɵɵgetCurrentView();
            ɵɵelement(0, 'comp', null, ['comp', '']);
            ɵɵelementStart(2, 'button');
            {
              ɵɵlistener('click', function() {
                ɵɵrestoreView(state);
                const comp = ɵɵreference(1);
                return ctx.onClick(comp);
              });
            }
            ɵɵelementEnd();
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
