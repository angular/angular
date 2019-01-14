/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createInjector} from '@angular/core';

import {StaticInjector} from '../../src/di/injector';
import {getComponent, getContext, getDirectives, getInjectionTokens, getInjector, getListeners, getLocalRefs, getRootComponents, getViewComponent, loadLContext} from '../../src/render3/discovery_utils';
import {ProvidersFeature, RenderFlags, defineComponent, defineDirective, elementContainerEnd, elementContainerStart, getHostElement, i18n, i18nApply, i18nExp} from '../../src/render3/index';
import {element, elementEnd, elementStart, elementStyling, elementStylingApply, template, bind, elementProperty, text, textBinding, markDirty, listener} from '../../src/render3/instructions';
import {ComponentFixture} from './render_util';
import {NgIf} from './common_with_def';

describe('discovery utils', () => {
  let fixture: ComponentFixture<MyApp>;
  let myApp: MyApp;
  let dirA: DirectiveA[];
  let childComponent: DirectiveA[];
  let child: NodeListOf<Element>;
  let span: NodeListOf<Element>;
  let div: NodeListOf<Element>;
  let p: NodeListOf<Element>;
  let log: any[];

  beforeEach(() => {
    log = [];
    dirA = [];
    childComponent = [];
    fixture = new ComponentFixture(
        MyApp, {injector: createInjector(null, null, [{provide: String, useValue: 'Module'}])});
    child = fixture.hostElement.querySelectorAll('child');
    span = fixture.hostElement.querySelectorAll('span');
    div = fixture.hostElement.querySelectorAll('div');
    p = fixture.hostElement.querySelectorAll('p');
  });

  /**
   * For all tests assume this set up
   *
   * ```
   * <my-app>
   *   <#VIEW>
   *     <span (click)=" log.push($event) ">{{text}}</span>
   *     <div dirA #div #foo="dirA"></div>
   *     <child>
   *       <#VIEW>
   *         <p></p>
   *       <VIEW>
   *     </child>
   *     <child dirA #child>
   *       <#VIEW>
   *         <p></p>
   *       <VIEW>
   *     </child>
   *     <child dirA *ngIf="true">
   *       <#VIEW>
   *         <p></p>
   *       <VIEW>
   *     </child>
   *     <i18n>ICU expression</i18n>
   *   </#VIEW>
   * </my-app>
   * ```
   */
  class Child {
    constructor() { childComponent.push(this); }

    static ngComponentDef = defineComponent({
      type: Child,
      selectors: [['child']],
      factory: () => new Child(),
      consts: 1,
      vars: 0,
      template: (rf: RenderFlags, ctx: Child) => {
        if (rf & RenderFlags.Create) {
          element(0, 'p');
        }
      },
      features: [ProvidersFeature([{provide: String, useValue: 'Child'}])]
    });
  }

  class DirectiveA {
    constructor() { dirA.push(this); }

    static ngDirectiveDef = defineDirective({
      type: DirectiveA,
      selectors: [['', 'dirA', '']],
      exportAs: ['dirA'],
      factory: () => new DirectiveA(),
    });
  }

  const MSG_DIV = `{�0�, select,
        other {ICU expression}
      }`;

  class MyApp {
    text: string = 'INIT';
    constructor() { myApp = this; }

    static ngComponentDef = defineComponent({
      type: MyApp,
      selectors: [['my-app']],
      factory: () => new MyApp(),
      consts: 13,
      vars: 1,
      directives: [Child, DirectiveA, NgIf],
      template: (rf: RenderFlags, ctx: MyApp) => {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          listener('click', $event => log.push($event));
          text(1);
          elementEnd();
          element(2, 'div', ['dirA', ''], ['div', '', 'foo', 'dirA']);
          element(5, 'child');
          element(6, 'child', ['dirA', ''], ['child', '']);
          template(8, function(rf: RenderFlags, ctx: never) {
            if (rf & RenderFlags.Create) {
              element(0, 'child');
            }
          }, 1, 0, 'child', ['ngIf', '']);
          elementStart(9, 'i18n');
          i18n(10, MSG_DIV);
          elementEnd();
          elementContainerStart(11);
          { text(12, 'content'); }
          elementContainerEnd();
        }
        if (rf & RenderFlags.Update) {
          textBinding(1, bind(ctx.text));
          elementProperty(8, 'ngIf', bind(true));
          i18nExp(bind(ctx.text));
          i18nApply(10);
        }
      }
    });
  }

  describe('getComponent', () => {
    it('should return null if no component', () => {
      expect(getComponent(span[0])).toEqual(null);
      expect(getComponent(div[0])).toEqual(null);
      expect(getComponent(p[0])).toEqual(null);
    });
    it('should throw when called on non-element', () => {
      expect(() => getComponent(dirA[0] as any)).toThrowError(/Expecting instance of DOM Node/);
      expect(() => getComponent(dirA[1] as any)).toThrowError(/Expecting instance of DOM Node/);
    });
    it('should return component from element', () => {
      expect(getComponent<MyApp>(fixture.hostElement)).toEqual(myApp);
      expect(getComponent<Child>(child[0])).toEqual(childComponent[0]);
      expect(getComponent<Child>(child[1])).toEqual(childComponent[1]);
    });
  });

  describe('getContext', () => {
    it('should throw when called on non-element', () => {
      expect(() => getContext(dirA[0] as any)).toThrowError(/Expecting instance of DOM Node/);
      expect(() => getContext(dirA[1] as any)).toThrowError(/Expecting instance of DOM Node/);
    });
    it('should return context from element', () => {
      expect(getContext<MyApp>(child[0])).toEqual(myApp);
      expect(getContext<{$implicit: boolean}>(child[2]) !.$implicit).toEqual(true);
      expect(getContext<Child>(p[0])).toEqual(childComponent[0]);
    });
  });

  describe('getHostElement', () => {
    it('should return element on component', () => {
      expect(getHostElement(myApp)).toEqual(fixture.hostElement);
      expect(getHostElement(childComponent[0])).toEqual(child[0]);
      expect(getHostElement(childComponent[1])).toEqual(child[1]);
    });
    it('should return element on directive', () => {
      expect(getHostElement(dirA[0])).toEqual(div[0]);
      expect(getHostElement(dirA[1])).toEqual(child[1]);
    });
    it('should throw on unknown target', () => {
      expect(() => getHostElement({})).toThrowError();  //
    });
  });

  describe('getInjector', () => {
    it('should return node-injector from element', () => {
      expect(getInjector(fixture.hostElement).get(String)).toEqual('Module');
      expect(getInjector(child[0]).get(String)).toEqual('Child');
      expect(getInjector(p[0]).get(String)).toEqual('Child');
    });
    it('should return node-injector from component with providers', () => {
      expect(getInjector(myApp).get(String)).toEqual('Module');
      expect(getInjector(childComponent[0]).get(String)).toEqual('Child');
      expect(getInjector(childComponent[1]).get(String)).toEqual('Child');
    });
    it('should return node-injector from directive without providers', () => {
      expect(getInjector(dirA[0]).get(String)).toEqual('Module');
      expect(getInjector(dirA[1]).get(String)).toEqual('Child');
    });
  });

  describe('getDirectives', () => {
    it('should return empty array if no directives', () => {
      expect(getDirectives(fixture.hostElement)).toEqual([]);
      expect(getDirectives(span[0])).toEqual([]);
      expect(getDirectives(child[0])).toEqual([]);
    });
    it('should return just directives', () => {
      expect(getDirectives(div[0])).toEqual([dirA[0]]);
      expect(getDirectives(child[1])).toEqual([dirA[1]]);
    });
  });

  describe('getViewComponent', () => {
    it('should return null when called on root component', () => {
      expect(getViewComponent(fixture.hostElement)).toEqual(null);
      expect(getViewComponent(myApp)).toEqual(null);
    });
    it('should return containing component of child component', () => {
      expect(getViewComponent<MyApp>(child[0])).toEqual(myApp);
      expect(getViewComponent<MyApp>(child[1])).toEqual(myApp);
      expect(getViewComponent<MyApp>(child[2])).toEqual(myApp);

      expect(getViewComponent<MyApp>(childComponent[0])).toEqual(myApp);
      expect(getViewComponent<MyApp>(childComponent[1])).toEqual(myApp);
      expect(getViewComponent<MyApp>(childComponent[2])).toEqual(myApp);
    });
    it('should return containing component of any view element', () => {
      expect(getViewComponent<MyApp>(span[0])).toEqual(myApp);
      expect(getViewComponent<MyApp>(div[0])).toEqual(myApp);
      expect(getViewComponent<Child>(p[0])).toEqual(childComponent[0]);
      expect(getViewComponent<Child>(p[1])).toEqual(childComponent[1]);
      expect(getViewComponent<Child>(p[2])).toEqual(childComponent[2]);
    });
    it('should return containing component of child directive', () => {
      expect(getViewComponent<MyApp>(dirA[0])).toEqual(myApp);
      expect(getViewComponent<MyApp>(dirA[1])).toEqual(myApp);
    });
  });

  describe('getLocalRefs', () => {
    it('should retrieve empty map', () => {
      expect(getLocalRefs(fixture.hostElement)).toEqual({});
      expect(getLocalRefs(myApp)).toEqual({});
      expect(getLocalRefs(span[0])).toEqual({});
      expect(getLocalRefs(child[0])).toEqual({});
    });

    it('should retrieve the local map', () => {
      expect(getLocalRefs(div[0])).toEqual({div: div[0], foo: dirA[0]});
      expect(getLocalRefs(dirA[0])).toEqual({div: div[0], foo: dirA[0]});

      expect(getLocalRefs(child[1])).toEqual({child: childComponent[1]});
      expect(getLocalRefs(dirA[1])).toEqual({child: childComponent[1]});
    });
  });

  describe('getRootComponents', () => {
    it('should return root components from component', () => {
      const rootComponents = [myApp];
      expect(getRootComponents(myApp)).toEqual(rootComponents);
      expect(getRootComponents(childComponent[0])).toEqual(rootComponents);
      expect(getRootComponents(childComponent[1])).toEqual(rootComponents);
      expect(getRootComponents(dirA[0])).toEqual(rootComponents);
      expect(getRootComponents(dirA[1])).toEqual(rootComponents);
      expect(getRootComponents(child[0])).toEqual(rootComponents);
      expect(getRootComponents(child[1])).toEqual(rootComponents);
      expect(getRootComponents(div[0])).toEqual(rootComponents);
      expect(getRootComponents(p[0])).toEqual(rootComponents);
    });
  });

  describe('getListeners', () => {
    it('should return no listeners', () => {
      expect(getListeners(fixture.hostElement)).toEqual([]);
      expect(getListeners(child[0])).toEqual([]);
    });
    it('should return the listeners', () => {
      const listeners = getListeners(span[0]);
      expect(listeners.length).toEqual(1);
      expect(listeners[0].name).toEqual('click');
      expect(listeners[0].element).toEqual(span[0]);
      expect(listeners[0].useCapture).toEqual(false);
      listeners[0].callback('CLICKED');
      expect(log).toEqual(['CLICKED']);
    });
  });

  describe('getInjectionTokens', () => {
    it('should retrieve tokens', () => {
      expect(getInjectionTokens(fixture.hostElement)).toEqual([MyApp]);
      expect(getInjectionTokens(child[0])).toEqual([String, Child]);
      expect(getInjectionTokens(child[1])).toEqual([String, Child, DirectiveA]);
    });
  });

  describe('markDirty', () => {
    it('should re-render component', () => {
      expect(span[0].textContent).toEqual('INIT');
      myApp.text = 'WORKS';
      markDirty(myApp);
      fixture.requestAnimationFrame.flush();
      expect(span[0].textContent).toEqual('WORKS');
    });
  });

  describe('loadLContext', () => {
    it('should work on components', () => {
      const lContext = loadLContext(child[0]);
      expect(lContext).toBeDefined();
      expect(lContext.native as any).toBe(child[0]);
    });

    it('should work on templates', () => {
      const templateComment = Array.from(fixture.hostElement.childNodes)
                                  .find((node: ChildNode) => node.nodeType === Node.COMMENT_NODE) !;
      const lContext = loadLContext(templateComment);
      expect(lContext).toBeDefined();
      expect(lContext.native as any).toBe(templateComment);
    });

    it('should work on ICU expressions', () => {
      const icuComment = Array.from(fixture.hostElement.querySelector('i18n') !.childNodes)
                             .find((node: ChildNode) => node.nodeType === Node.COMMENT_NODE) !;
      const lContext = loadLContext(icuComment);
      expect(lContext).toBeDefined();
      expect(lContext.native as any).toBe(icuComment);
    });

    it('should work on ng-container', () => {
      const ngContainerComment = Array.from(fixture.hostElement.childNodes)
                                     .find(
                                         (node: ChildNode) => node.nodeType === Node.COMMENT_NODE &&
                                             node.textContent === `ng-container`) !;
      const lContext = loadLContext(ngContainerComment);
      expect(lContext).toBeDefined();
      expect(lContext.native as any).toBe(ngContainerComment);
    });
  });
});

describe('discovery utils deprecated', () => {

  describe('getRootComponents()', () => {
    it('should return a list of the root components of the application from an element', () => {
      let innerComp: InnerComp;

      class InnerComp {
        static ngComponentDef = defineComponent({
          type: InnerComp,
          selectors: [['inner-comp']],
          factory: () => innerComp = new InnerComp(),
          consts: 1,
          vars: 0,
          template: (rf: RenderFlags, ctx: InnerComp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');
            }
          }
        });
      }

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          factory: () => new Comp(),
          consts: 1,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'inner-comp');
            }
          },
          directives: [InnerComp]
        });
      }

      const fixture = new ComponentFixture(Comp);
      fixture.update();

      const hostElm = fixture.hostElement;
      const innerElm = hostElm.querySelector('inner-comp') !;
      const divElm = hostElm.querySelector('div') !;
      const component = fixture.component;

      expect(getRootComponents(hostElm) !).toEqual([component]);
      expect(getRootComponents(innerElm) !).toEqual([component]);
      expect(getRootComponents(divElm) !).toEqual([component]);
    });
  });

  describe('getDirectives()', () => {
    it('should return a list of the directives that are on the given element', () => {
      let myDir1Instance: MyDir1|null = null;
      let myDir2Instance: MyDir2|null = null;
      let myDir3Instance: MyDir2|null = null;

      class MyDir1 {
        static ngDirectiveDef = defineDirective({
          type: MyDir1,
          selectors: [['', 'my-dir-1', '']],
          factory: () => myDir1Instance = new MyDir1()
        });
      }

      class MyDir2 {
        static ngDirectiveDef = defineDirective({
          type: MyDir2,
          selectors: [['', 'my-dir-2', '']],
          factory: () => myDir2Instance = new MyDir2()
        });
      }

      class MyDir3 {
        static ngDirectiveDef = defineDirective({
          type: MyDir3,
          selectors: [['', 'my-dir-3', '']],
          factory: () => myDir3Instance = new MyDir2()
        });
      }

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          factory: () => new Comp(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div', ['my-dir-1', '', 'my-dir-2', '']);
              element(1, 'div', ['my-dir-3']);
            }
          },
          directives: [MyDir1, MyDir2, MyDir3]
        });
      }

      const fixture = new ComponentFixture(Comp);
      fixture.update();

      const hostElm = fixture.hostElement;
      const elements = hostElm.querySelectorAll('div');

      const elm1 = elements[0];
      const elm1Dirs = getDirectives(elm1);
      expect(elm1Dirs).toContain(myDir1Instance !);
      expect(elm1Dirs).toContain(myDir2Instance !);

      const elm2 = elements[1];
      const elm2Dirs = getDirectives(elm2);
      expect(elm2Dirs).toContain(myDir3Instance !);
    });
  });

  describe('getInjector', () => {

    it('should return an injector that can return directive instances', () => {

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          factory: () => new Comp(),
          consts: 0,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {}
        });
      }

      const fixture = new ComponentFixture(Comp);
      fixture.update();

      const nodeInjector = getInjector(fixture.hostElement);
      expect(nodeInjector.get(Comp)).toEqual(jasmine.any(Comp));
    });

    it('should return an injector that falls-back to a module injector', () => {

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          factory: () => new Comp(),
          consts: 0,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {}
        });
      }

      class TestToken {}

      const staticInjector = new StaticInjector([{provide: TestToken, useValue: new TestToken()}]);
      const fixture = new ComponentFixture(Comp, {injector: staticInjector});
      fixture.update();

      const nodeInjector = getInjector(fixture.hostElement);
      expect(nodeInjector.get(TestToken)).toEqual(jasmine.any(TestToken));
    });
  });

  describe('getLocalRefs', () => {
    it('should return a map of local refs for an element', () => {

      class MyDir {
        static ngDirectiveDef = defineDirective({
          type: MyDir,
          selectors: [['', 'myDir', '']],
          exportAs: ['myDir'],
          factory: () => new MyDir()
        });
      }

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          factory: () => new Comp(),
          consts: 3,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {
            if (rf & RenderFlags.Create) {
              // <div myDir #elRef #dirRef="myDir">
              element(0, 'div', ['myDir'], ['elRef', '', 'dirRef', 'myDir']);
            }
          },
          directives: [MyDir]
        });
      }

      const fixture = new ComponentFixture(Comp);
      fixture.update();

      const divEl = fixture.hostElement.querySelector('div') !;
      const localRefs = getLocalRefs(divEl);

      expect(localRefs.elRef.tagName.toLowerCase()).toBe('div');
      expect(localRefs.dirRef.constructor).toBe(MyDir);
    });

    it('should return a map of local refs for an element with styling context', () => {
      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          factory: () => new Comp(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, ctx: Comp) => {
            if (rf & RenderFlags.Create) {
              // <div #elRef class="fooClass">
              elementStart(0, 'div', null, ['elRef', '']);
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementStylingApply(0);
            }
          }
        });
      }

      const fixture = new ComponentFixture(Comp);
      fixture.update();

      const divEl = fixture.hostElement.querySelector('div') !;
      const localRefs = getLocalRefs(divEl);

      expect(localRefs.elRef.tagName.toLowerCase()).toBe('div');
    });
  });
});
