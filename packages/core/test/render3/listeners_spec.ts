/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HEADER_OFFSET} from '@angular/core/src/render3/interfaces/view';
import {dispatchEvent} from '@angular/platform-browser/testing/src/browser_util';
import {ɵɵdefineComponent, ɵɵdefineDirective, ɵɵreference, ɵɵresolveBody, ɵɵresolveDocument} from '../../src/render3/index';
import {ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵgetCurrentView, ɵɵlistener, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {GlobalTargetResolver} from '../../src/render3/interfaces/renderer';
import {ɵɵrestoreView} from '../../src/render3/state';
import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, containerEl, createComponent, getDirectiveOnNode, renderToHtml, TemplateFixture} from './render_util';


describe('event listeners', () => {
  let comps: any[] = [];
  let events: any[] = [];

  class MyComp {
    showing = true;
    counter = 0;

    onClick() {
      this.counter++;
    }

    static ɵfac =
        () => {
          let comp = new MyComp();
          comps.push(comp);
          return comp;
        }

    static ɵcmp = ɵɵdefineComponent({
      type: MyComp,
      selectors: [['comp']],
      decls: 2,
      vars: 0,
      /** <button (click)="onClick()"> Click me </button> */
      template:
          function CompTemplate(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'button');
              {
                ɵɵlistener('click', function() {
                  return ctx.onClick();
                });
                ɵɵtext(1, 'Click me');
              }
              ɵɵelementEnd();
            }
          }
    });
  }

  class MyCompWithGlobalListeners {
    /* @HostListener('document:custom') */
    onDocumentCustomEvent() {
      events.push('component - document:custom');
    }

    /* @HostListener('body:click') */
    onBodyClick() {
      events.push('component - body:click');
    }

    static ɵfac =
        () => {
          let comp = new MyCompWithGlobalListeners();
          comps.push(comp);
          return comp;
        }

    static ɵcmp = ɵɵdefineComponent({
      type: MyCompWithGlobalListeners,
      selectors: [['comp']],
      decls: 1,
      vars: 0,
      template:
          function CompTemplate(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵtext(0, 'Some text');
            }
          },
      hostBindings:
          function HostListenerDir_HostBindings(rf: RenderFlags, ctx: any) {
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
    onDocumentCustomEvent() {
      events.push('directive - document:custom');
    }

    /* @HostListener('body:click') */
    onBodyClick() {
      events.push('directive - body:click');
    }

    static ɵfac = function HostListenerDir_Factory() {
      return new GlobalHostListenerDir();
    };
    static ɵdir = ɵɵdefineDirective({
      type: GlobalHostListenerDir,
      selectors: [['', 'hostListenerDir', '']],
      hostBindings:
          function HostListenerDir_HostBindings(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵlistener('custom', function() {
                return ctx.onDocumentCustomEvent();
              }, false, ɵɵresolveDocument as GlobalTargetResolver)('click', function() {
                return ctx.onBodyClick();
              }, false, ɵɵresolveBody as GlobalTargetResolver);
            }
          }
    });
  }

  class PreventDefaultComp {
    handlerReturnValue: any = true;
    // TODO(issue/24571): remove '!'.
    event!: Event;

    onClick(e: any) {
      this.event = e;

      // stub preventDefault() to check whether it's called
      Object.defineProperty(
          this.event, 'preventDefault',
          {value: jasmine.createSpy('preventDefault'), writable: true});

      return this.handlerReturnValue;
    }

    static ɵfac = () => new PreventDefaultComp();
    static ɵcmp = ɵɵdefineComponent({
      type: PreventDefaultComp,
      selectors: [['prevent-default-comp']],
      decls: 2,
      vars: 0,
      /** <button (click)="onClick($event)">Click</button> */
      template:
          (rf: RenderFlags, ctx: PreventDefaultComp) => {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'button');
              {
                ɵɵlistener('click', function($event: any) {
                  return ctx.onClick($event);
                });
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
    const button = fixture.hostElement.querySelector('button')!;

    button.click();
    expect(comp.counter).toEqual(1);

    button.click();
    expect(comp.counter).toEqual(2);
  });

  it('should retain event handler return values using document', () => {
    const fixture = new ComponentFixture(PreventDefaultComp);
    const preventDefaultComp = fixture.component;
    const button = fixture.hostElement.querySelector('button')!;

    button.click();
    expect(preventDefaultComp.event!.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = undefined;
    button.click();
    expect(preventDefaultComp.event!.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = false;
    button.click();
    expect(preventDefaultComp.event!.preventDefault).toHaveBeenCalled();
  });

  it('should retain event handler return values with renderer2', () => {
    const fixture =
        new ComponentFixture(PreventDefaultComp, {rendererFactory: getRendererFactory2(document)});
    const preventDefaultComp = fixture.component;
    const button = fixture.hostElement.querySelector('button')!;

    button.click();
    expect(preventDefaultComp.event!.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = undefined;
    button.click();
    expect(preventDefaultComp.event!.preventDefault).not.toHaveBeenCalled();

    preventDefaultComp.handlerReturnValue = false;
    button.click();
    expect(preventDefaultComp.event!.preventDefault).toHaveBeenCalled();
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
      onClick: function() {
        this.counter++;
      },
      onClick2: function() {
        this.counter2++;
      }
    };
    renderToHtml(Template, ctx, 2);
    const button = containerEl.querySelector('button')!;

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
          ɵɵlistener('click', function() {
            return ctx.showing = !ctx.showing;
          });
          ɵɵtext(1, 'Click me');
        }
        ɵɵelementEnd();
      }
    }

    const ctx = {showing: false};
    renderToHtml(Template, ctx, 2);
    const button = containerEl.querySelector('button')!;

    button.click();
    expect(ctx.showing).toBe(true);

    button.click();
    expect(ctx.showing).toBe(false);
  });

  it('should support host listeners on components', () => {
    let events: string[] = [];
    class MyComp {
      /* @HostListener('click') */
      onClick() {
        events.push('click!');
      }

      static ɵfac =
          () => {
            return new MyComp();
          }

      static ɵcmp = ɵɵdefineComponent({
        type: MyComp,
        selectors: [['comp']],
        decls: 1,
        vars: 0,
        template:
            function CompTemplate(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0, 'Some text');
              }
            },
        hostBindings:
            function HostListenerDir_HostBindings(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵlistener('click', function() {
                  return ctx.onClick();
                });
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
    const doc = fixture.hostElement.ownerDocument!;

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
      onClick() {
        events.push('click!');
      }

      static ɵfac = function HostListenerDir_Factory() {
        return new HostListenerDir();
      };
      static ɵdir = ɵɵdefineDirective({
        type: HostListenerDir,
        selectors: [['', 'hostListenerDir', '']],
        hostBindings:
            function HostListenerDir_HostBindings(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵlistener('click', function() {
                  return ctx.onClick();
                });
              }
            }
      });
    }

    const fixture = new TemplateFixture({
      create: () => {
        ɵɵelementStart(0, 'button', 0);
        ɵɵtext(1, 'Click');
        ɵɵelementEnd();
      },
      decls: 2,
      directives: [HostListenerDir],
      consts: [['hostListenerDir', '']]
    });

    const button = fixture.hostElement.querySelector('button')!;

    button.click();
    expect(events).toEqual(['click!']);

    button.click();
    expect(events).toEqual(['click!', 'click!']);
  });

  it('should support global host listeners on directives', () => {
    const fixture = new TemplateFixture({
      create: () => {
        ɵɵelement(0, 'div', 0);
      },
      decls: 1,
      directives: [GlobalHostListenerDir],
      consts: [['hostListenerDir', '']]
    });

    const doc = fixture.hostElement.ownerDocument!;

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

      onClick(a: any, b: any) {
        this.counter += a + b;
      }

      static ɵfac = () => new MyComp();
      static ɵcmp = ɵɵdefineComponent({
        type: MyComp,
        selectors: [['comp']],
        decls: 2,
        vars: 0,
        /** <button (click)="onClick(data.a, data.b)"> Click me </button> */
        template:
            function CompTemplate(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'button');
                {
                  ɵɵlistener('click', function() {
                    return ctx.onClick(ctx.data.a, ctx.data.b);
                  });
                  ɵɵtext(1, 'Click me');
                }
                ɵɵelementEnd();
              }
            }
      });
    }

    const fixture = new ComponentFixture(MyComp);
    const comp = fixture.component;
    const button = fixture.hostElement.querySelector('button')!;

    button.click();
    expect(comp.counter).toEqual(3);

    button.click();
    expect(comp.counter).toEqual(6);
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

      onClick(comp: any) {
        this.comp = comp;
      }

      static ɵfac = () => new App();
      static ɵcmp = ɵɵdefineComponent({
        type: App,
        selectors: [['app']],
        decls: 3,
        vars: 0,
        consts: [['comp', '']],
        template:
            (rf: RenderFlags, ctx: App) => {
              if (rf & RenderFlags.Create) {
                const state = ɵɵgetCurrentView();
                ɵɵelement(0, 'comp', null, 0);
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
              compInstance = getDirectiveOnNode(HEADER_OFFSET);
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
