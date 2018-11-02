/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StaticInjector} from '../../src/di/injector';
import {getComponent, getDirectives, getHostComponent, getInjector, getLocalRefs, getRootComponents} from '../../src/render3/discovery_utils';
import {RenderFlags, defineComponent, defineDirective} from '../../src/render3/index';
import {element, elementEnd, elementStart, elementStyling, elementStylingApply} from '../../src/render3/instructions';

import {ComponentFixture} from './render_util';

describe('discovery utils', () => {
  describe('getComponent()', () => {
    it('should return the component instance for a DOM element', () => {
      class InnerComp {
        static ngComponentDef = defineComponent({
          type: InnerComp,
          selectors: [['inner-comp']],
          factory: () => new InnerComp(),
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
      const innerCompElm = hostElm.querySelector('inner-comp');
      const component = fixture.component;

      expect(getComponent(innerCompElm !) !).toBe(component);
      expect(getComponent(hostElm) !).toBeFalsy();
    });
  });

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

  describe('getHostComponent()', () => {
    it('should return the component instance for a DOM element', () => {
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

      expect(getHostComponent(hostElm) !).toBe(component);
      expect(getHostComponent(innerElm) !).toBe(innerComp !);
      expect(getHostComponent(divElm) !).toBeFalsy();
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
          exportAs: 'myDir',
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
              elementStyling(['fooClass']);
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
