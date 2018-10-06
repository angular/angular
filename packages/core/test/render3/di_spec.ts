/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, ChangeDetectorRef, ElementRef, Host, InjectFlags, Injector, Optional, Renderer2, Self, SkipSelf, TemplateRef, ViewContainerRef, defineInjectable} from '@angular/core';
import {RenderFlags} from '@angular/core/src/render3/interfaces/definition';

import {defineComponent} from '../../src/render3/definition';
import {bloomAdd, bloomHashBitOrFactory as bloomHash, getOrCreateInjectable, getOrCreateNodeInjector, injectAttribute, injectorHasToken} from '../../src/render3/di';
import {PublicFeature, defineDirective, directiveInject, elementProperty, injectRenderer2, load, templateRefExtractor} from '../../src/render3/index';

import {bind, container, containerRefreshEnd, containerRefreshStart, createNodeAtIndex, createLViewData, createTView, element, elementEnd, elementStart, embeddedViewEnd, embeddedViewStart, enterView, interpolation2, leaveView, projection, projectionDef, reference, template, text, textBinding, loadDirective, elementContainerStart, elementContainerEnd, _getViewData, getTNode} from '../../src/render3/instructions';
import {isProceduralRenderer} from '../../src/render3/interfaces/renderer';
import {AttributeMarker, LContainerNode, LElementNode, TNodeType} from '../../src/render3/interfaces/node';

import {LViewFlags} from '../../src/render3/interfaces/view';
import {ViewRef} from '../../src/render3/view_ref';

import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, createComponent, createDirective, getDirectiveOnNode, renderComponent, toHtml} from './render_util';
import {NgIf} from './common_with_def';
import {TNODE} from '../../src/render3/interfaces/injector';

describe('di', () => {
  describe('no dependencies', () => {
    it('should create directive with no deps', () => {
      class Directive {
        value: string = 'Created';
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => new Directive,
          exportAs: 'dir'
        });
      }

      /** <div dir #dir="dir"> {{ dir.value }}  </div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['dir', ''], ['dir', 'dir']);
          { text(2); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const tmp = reference(1) as any;
          textBinding(2, bind(tmp.value));
        }
      }, 3, 1, [Directive]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div dir="">Created</div>');
    });
  });

  describe('directive injection', () => {
    let log: string[] = [];

    class DirB {
      value = 'DirB';
      constructor() { log.push(this.value); }

      static ngDirectiveDef = defineDirective({
        selectors: [['', 'dirB', '']],
        type: DirB,
        factory: () => new DirB(),
        features: [PublicFeature],
        inputs: {value: 'value'}
      });
    }

    beforeEach(() => log = []);

    it('should create directive with intra view dependencies', () => {
      class DirA {
        value: string = 'DirA';
        static ngDirectiveDef = defineDirective({
          type: DirA,
          selectors: [['', 'dirA', '']],
          factory: () => new DirA(),
          features: [PublicFeature]
        });
      }

      class DirC {
        value: string;
        constructor(a: DirA, b: DirB) { this.value = a.value + b.value; }
        static ngDirectiveDef = defineDirective({
          type: DirC,
          selectors: [['', 'dirC', '']],
          factory: () => new DirC(directiveInject(DirA), directiveInject(DirB)),
          exportAs: 'dirC'
        });
      }

      /**
       * <div dirA>
       *  <span dirB dirC #dir="dirC"> {{ dir.value }} </span>
       * </div>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['dirA', '']);
          {
            elementStart(1, 'span', ['dirB', '', 'dirC', ''], ['dir', 'dirC']);
            { text(3); }
            elementEnd();
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const tmp = reference(2) as any;
          textBinding(3, bind(tmp.value));
        }
      }, 4, 1, [DirA, DirB, DirC]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual('<div dira=""><span dirb="" dirc="">DirADirB</span></div>');
    });

    it('should instantiate injected directives in dependency order', () => {
      class DirA {
        constructor(dir: DirB) { log.push(`DirA (dep: ${dir.value})`); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(directiveInject(DirB)),
        });
      }

      /** <div dirA dirB></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dirA', '', 'dirB', '']);
        }
      }, 1, 0, [DirA, DirB]);

      new ComponentFixture(App);
      expect(log).toEqual(['DirB', 'DirA (dep: DirB)']);
    });

    it('should fallback to the module injector', () => {
      class DirA {
        constructor(dir: DirB) { log.push(`DirA (dep: ${dir.value})`); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(directiveInject(DirB)),
        });
      }

      // `<div dirB></div><div dirA></div>`
      // - dirB is know to the node injectors (it uses the diPublic feature)
      // - then when dirA tries to inject dirB, it will check the node injector first tree
      // - if not found, it will check the module injector tree
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dirB', '']);
          element(1, 'div', ['dirA', '']);
        }
      }, 2, 0, [DirA, DirB]);

      const fakeModuleInjector: any = {
        get: function(token: any) {
          const value = token === DirB ? 'module' : 'fail';
          return {value: value};
        }
      };

      new ComponentFixture(App, {injector: fakeModuleInjector});
      expect(log).toEqual(['DirB', 'DirA (dep: module)']);
    });

    it('should instantiate injected directives before components', () => {
      class Comp {
        constructor(dir: DirB) { log.push(`Comp (dep: ${dir.value})`); }

        static ngComponentDef = defineComponent({
          selectors: [['comp']],
          type: Comp,
          consts: 0,
          vars: 0,
          factory: () => new Comp(directiveInject(DirB)),
          template: (ctx: any, fm: boolean) => {}
        });
      }

      /** <comp dirB></comp> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp', ['dirB', '']);
        }
      }, 1, 0, [Comp, DirB]);

      new ComponentFixture(App);
      expect(log).toEqual(['DirB', 'Comp (dep: DirB)']);
    });

    it('should inject directives in the correct order in a for loop', () => {
      class DirA {
        constructor(dir: DirB) { log.push(`DirA (dep: ${dir.value})`); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(directiveInject(DirB))
        });
      }

      /**
       * % for(let i = 0; i < 3; i++) {
       *   <div dirA dirB></div>
       * % }
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            for (let i = 0; i < 3; i++) {
              if (embeddedViewStart(0, 1, 0)) {
                element(0, 'div', ['dirA', '', 'dirB', '']);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }, 1, 0, [DirA, DirB]);

      new ComponentFixture(App);
      expect(log).toEqual(
          ['DirB', 'DirA (dep: DirB)', 'DirB', 'DirA (dep: DirB)', 'DirB', 'DirA (dep: DirB)']);
    });

    it('should instantiate directives with multiple out-of-order dependencies', () => {
      class DirA {
        value = 'DirA';
        constructor() { log.push(this.value); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(),
          features: [PublicFeature]
        });
      }

      class DirB {
        constructor(dirA: DirA, dirC: DirC) {
          log.push(`DirB (deps: ${dirA.value} and ${dirC.value})`);
        }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirB', '']],
          type: DirB,
          factory: () => new DirB(directiveInject(DirA), directiveInject(DirC))
        });
      }

      class DirC {
        value = 'DirC';
        constructor() { log.push(this.value); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirC', '']],
          type: DirC,
          factory: () => new DirC(),
          features: [PublicFeature]
        });
      }

      /** <div dirA dirB dirC></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dirA', '', 'dirB', '', 'dirC', '']);
        }
      }, 1, 0, [DirA, DirB, DirC]);

      new ComponentFixture(App);
      expect(log).toEqual(['DirA', 'DirC', 'DirB (deps: DirA and DirC)']);
    });

    it('should instantiate in the correct order for complex case', () => {
      class Comp {
        constructor(dir: DirD) { log.push(`Comp (dep: ${dir.value})`); }

        static ngComponentDef = defineComponent({
          selectors: [['comp']],
          type: Comp,
          consts: 0,
          vars: 0,
          factory: () => new Comp(directiveInject(DirD)),
          template: (ctx: any, fm: boolean) => {}
        });
      }

      class DirA {
        value = 'DirA';
        constructor(dir: DirC) { log.push(`DirA (dep: ${dir.value})`); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(directiveInject(DirC)),
          features: [PublicFeature]
        });
      }

      class DirC {
        value = 'DirC';
        constructor(dir: DirB) { log.push(`DirC (dep: ${dir.value})`); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirC', '']],
          type: DirC,
          factory: () => new DirC(directiveInject(DirB)),
          features: [PublicFeature]
        });
      }

      class DirD {
        value = 'DirD';
        constructor(dir: DirA) { log.push(`DirD (dep: ${dir.value})`); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirD', '']],
          type: DirD,
          factory: () => new DirD(directiveInject(DirA)),
          features: [PublicFeature]
        });
      }

      /** <comp dirA dirB dirC dirD></comp> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp', ['dirA', '', 'dirB', '', 'dirC', '', 'dirD', '']);
        }
      }, 1, 0, [Comp, DirA, DirB, DirC, DirD]);

      new ComponentFixture(App);
      expect(log).toEqual(
          ['DirB', 'DirC (dep: DirB)', 'DirA (dep: DirC)', 'DirD (dep: DirA)', 'Comp (dep: DirD)']);
    });

    it('should instantiate in correct order with mixed parent and peer dependencies', () => {
      class DirA {
        constructor(dirB: DirB, app: App) {
          log.push(`DirA (deps: ${dirB.value} and ${app.value})`);
        }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(directiveInject(DirB), directiveInject(App)),
        });
      }

      class App {
        value = 'App';

        static ngComponentDef = defineComponent({
          selectors: [['app']],
          type: App,
          factory: () => new App(),
          consts: 1,
          vars: 0,
          /** <div dirA dirB dirC></div> */
          template: (rf: RenderFlags, ctx: any) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div', ['dirA', '', 'dirB', '', 'dirC', 'dirC']);
            }
          },
          directives: [DirA, DirB],
          features: [PublicFeature],
        });
      }

      new ComponentFixture(App);
      expect(log).toEqual(['DirB', 'DirA (deps: DirB and App)']);
    });

    it('should not use a parent when peer dep is available', () => {
      let count = 1;

      class DirA {
        constructor(dirB: DirB) { log.push(`DirA (dep: DirB - ${dirB.count})`); }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(directiveInject(DirB)),
        });
      }

      class DirB {
        count: number;

        constructor() {
          log.push(`DirB`);
          this.count = count++;
        }

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirB', '']],
          type: DirB,
          factory: () => new DirB(),
          features: [PublicFeature],
        });
      }

      /** <div dirA dirB></div> */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dirA', '', 'dirB', '']);
        }
      }, 1, 0, [DirA, DirB]);

      /** <parent dirB></parent> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'parent', ['dirB', '']);
        }
      }, 1, 0, [Parent, DirB]);

      new ComponentFixture(App);
      expect(log).toEqual(['DirB', 'DirB', 'DirA (dep: DirB - 2)']);
    });

    describe('dependencies in parent views', () => {

      class DirA {
        injector: Injector;
        constructor(public dirB: DirB, public vcr: ViewContainerRef) {
          this.injector = vcr.injector;
        }

        static ngDirectiveDef = defineDirective({
          type: DirA,
          selectors: [['', 'dirA', '']],
          factory: () => new DirA(directiveInject(DirB), directiveInject(ViewContainerRef as any)),
          features: [PublicFeature],
          exportAs: 'dirA'
        });
      }

      /**
       * <div dirA #dir="dirA">
       *    {{ dir.dirB.value }}
       * </div>
       */
      const Comp = createComponent('comp', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['dirA', ''], ['dir', 'dirA']);
          { text(2); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const dir = reference(1) as DirA;
          textBinding(2, bind(dir.dirB.value));
        }
      }, 3, 1, [DirA]);

      it('should find dependencies on component hosts', () => {
        /** <comp dirB>/comp> */
        const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            element(0, 'comp', ['dirB', '']);
          }
        }, 1, 0, [Comp, DirB]);

        const fixture = new ComponentFixture(App);
        expect(fixture.hostElement.textContent).toEqual(`DirB`);
      });

      it('should find dependencies for directives in embedded views', () => {

        function IfTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div');
            {
              elementStart(1, 'div', ['dirA', ''], ['dir', 'dirA']);
              { text(3); }
              elementEnd();
            }
            elementEnd();
          }

          if (rf & RenderFlags.Update) {
            const dir = reference(2) as DirA;
            textBinding(3, bind(dir.dirB.value));
          }
        }

        /**
         * <div dirB>
         *    <div *ngIf="showing">
         *       <div dirA #dir="dirA"> {{ dir.dirB.value }} </div>
         *    </div>
         * </div>
         */
        const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', ['dirB', '']);
            { template(1, IfTemplate, 4, 1, '', [AttributeMarker.SelectOnly, 'ngIf', '']); }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            elementProperty(1, 'ngIf', bind(ctx.showing));
          }
        }, 2, 1, [DirA, DirB, NgIf]);

        const fixture = new ComponentFixture(App);
        fixture.component.showing = true;
        fixture.update();

        expect(fixture.hostElement.textContent).toEqual(`DirB`);
      });

      it('should find dependencies of directives nested deeply in inline views', () => {
        /**
         * <div dirB>
         *     % if (!skipContent) {
         *        % if (!skipContent2) {
         *           <div dirA #dir="dirA"> {{ dir.dirB.value }} </div>
         *        % }
         *     % }
         * </div>
         */
        const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', ['dirB', '']);
            { container(1); }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(1);
            {
              if (!ctx.skipContent) {
                let rf1 = embeddedViewStart(0, 1, 0);
                {
                  if (rf1 & RenderFlags.Create) {
                    container(0);
                  }
                  if (rf1 & RenderFlags.Update) {
                    containerRefreshStart(0);
                    {
                      if (!ctx.skipContent2) {
                        let rf2 = embeddedViewStart(0, 3, 1);
                        {
                          if (rf2 & RenderFlags.Create) {
                            elementStart(0, 'div', ['dirA', ''], ['dir', 'dirA']);
                            { text(2); }
                            elementEnd();
                          }
                          if (rf2 & RenderFlags.Update) {
                            const dir = reference(1) as DirA;
                            textBinding(2, bind(dir.dirB.value));
                          }
                        }
                        embeddedViewEnd();
                      }
                    }
                    containerRefreshEnd();
                  }
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
        }, 2, 0, [DirA, DirB]);

        const fixture = new ComponentFixture(App);
        expect(fixture.hostElement.textContent).toEqual(`DirB`);
      });

      it('should find dependencies in declaration tree of ng-template (not insertion tree)', () => {
        let structuralDir !: StructuralDir;

        class StructuralDir {
          // @Input()
          tmp !: TemplateRef<any>;

          constructor(public vcr: ViewContainerRef) {}

          create() { this.vcr.createEmbeddedView(this.tmp); }

          static ngDirectiveDef = defineDirective({
            type: StructuralDir,
            selectors: [['', 'structuralDir', '']],
            factory: () => structuralDir =
                         new StructuralDir(directiveInject(ViewContainerRef as any)),
            inputs: {tmp: 'tmp'},
            features: [PublicFeature]
          });
        }

        function FooTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', ['dirA', ''], ['dir', 'dirA']);
            { text(2); }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            const dir = reference(1) as DirA;
            textBinding(2, bind(dir.dirB.value));
          }
        }

        /**
         * <div dirB value="declaration">
         *   <ng-template #foo>
         *       <div dirA dir="dirA"> {{ dir.dirB.value }} </div>
         *   </ng-template>
         * </div>
         *
         * <div dirB value="insertion">
         *   <div structuralDir [tmp]="foo"></div>
         *   // insertion point
         * </div>
         */
        const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', ['dirB', '', 'value', 'declaration']);
            { template(1, FooTemplate, 3, 1, '', null, ['foo', ''], templateRefExtractor); }
            elementEnd();
            elementStart(3, 'div', ['dirB', '', 'value', 'insertion']);
            { element(4, 'div', ['structuralDir', '']); }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            const foo = reference(2) as any;
            elementProperty(4, 'tmp', bind(foo));
          }
        }, 5, 1, [DirA, DirB, StructuralDir]);

        const fixture = new ComponentFixture(App);
        structuralDir.create();
        fixture.update();
        expect(fixture.hostElement.textContent).toEqual(`declaration`);
      });

      it('should create injectors on second template pass', () => {
        /**
         * <comp dirB></comp>
         * <comp dirB></comp>
         */
        const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            element(0, 'comp', ['dirB', '']);
            element(1, 'comp', ['dirB', '']);
          }
        }, 2, 0, [Comp, DirB]);

        const fixture = new ComponentFixture(App);
        expect(fixture.hostElement.textContent).toEqual(`DirBDirB`);
      });

      it('should create injectors and host bindings in same view', () => {
        let hostBindingDir !: HostBindingDir;

        class HostBindingDir {
          // @HostBinding('id')
          id = 'foo';

          static ngDirectiveDef = defineDirective({
            type: HostBindingDir,
            selectors: [['', 'hostBindingDir', '']],
            factory: () => hostBindingDir = new HostBindingDir(),
            hostVars: 1,
            hostBindings: (directiveIndex: number, elementIndex: number) => {
              elementProperty(
                  elementIndex, 'id', bind(loadDirective<HostBindingDir>(directiveIndex).id));
            }
          });
        }

        let dir !: DirA;
        /**
         * <div dirB hostBindingDir>
         *     <p dirA #dir="dirA">
         *         {{ dir.dirB.value }}
         *     </p>
         * </div>
         */
        const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', [
              'dirB',
              '',
              'hostBindingDir',
              '',
            ]);
            {
              elementStart(1, 'p', ['dirA', ''], ['dir', 'dirA']);
              { text(3); }
              elementEnd();
            }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            dir = reference(2) as DirA;
            textBinding(3, bind(dir.dirB.value));
          }
        }, 4, 1, [HostBindingDir, DirA, DirB]);

        const fixture = new ComponentFixture(App);
        expect(fixture.hostElement.textContent).toEqual(`DirB`);
        const hostDirEl = fixture.hostElement.querySelector('div') as HTMLElement;
        expect(hostDirEl.id).toEqual('foo');
        // The injector should not be overwritten by host bindings
        expect(dir.vcr.injector).toEqual(dir.injector);

        hostBindingDir.id = 'bar';
        fixture.update();
        expect(hostDirEl.id).toEqual('bar');
      });
    });

    it('should create instance even when no injector present', () => {
      class MyService {
        value = 'MyService';
        static ngInjectableDef =
            defineInjectable({providedIn: 'root', factory: () => new MyService()});
      }

      class MyComponent {
        constructor(public myService: MyService) {}
        static ngComponentDef = defineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          consts: 1,
          vars: 1,
          factory: () => new MyComponent(directiveInject(MyService)),
          template: function(rf: RenderFlags, ctx: MyComponent) {
            if (rf & RenderFlags.Create) {
              text(0);
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, bind(ctx.myService.value));
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyComponent);
      fixture.update();
      expect(fixture.html).toEqual('MyService');
    });

    it('should throw if directive is not found anywhere', () => {
      class Dir {
        constructor(siblingDir: OtherDir) {}

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dir', '']],
          type: Dir,
          factory: () => new Dir(directiveInject(OtherDir)),
          features: [PublicFeature]
        });
      }

      class OtherDir {
        static ngDirectiveDef = defineDirective({
          selectors: [['', 'other', '']],
          type: OtherDir,
          factory: () => new OtherDir(),
          features: [PublicFeature]
        });
      }

      /** <div dir></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dir', '']);
        }
      }, 1, 0, [Dir, OtherDir]);

      expect(() => new ComponentFixture(App)).toThrowError(/Injector: NOT_FOUND \[OtherDir\]/);
    });

    it('should throw if directive is not found in ancestor tree', () => {
      class Dir {
        constructor(siblingDir: OtherDir) {}

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dir', '']],
          type: Dir,
          factory: () => new Dir(directiveInject(OtherDir)),
          features: [PublicFeature]
        });
      }

      class OtherDir {
        static ngDirectiveDef = defineDirective({
          selectors: [['', 'other', '']],
          type: OtherDir,
          factory: () => new OtherDir(),
          features: [PublicFeature]
        });
      }

      /**
       * <div other></div>
       * <div dir></div>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['other', '']);
          element(1, 'div', ['dir', '']);
        }
      }, 2, 0, [Dir, OtherDir]);

      expect(() => new ComponentFixture(App)).toThrowError(/Injector: NOT_FOUND \[OtherDir\]/);
    });


    it('should throw if directives try to inject each other', () => {
      class DirA {
        constructor(dir: DirB) {}

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(directiveInject(DirB)),
          features: [PublicFeature]
        });
      }

      class DirB {
        constructor(dir: DirA) {}

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dirB', '']],
          type: DirB,
          factory: () => new DirB(directiveInject(DirA)),
          features: [PublicFeature]
        });
      }

      /** <div dirA dirB></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dirA', '', 'dirB', '']);
        }
      }, 1, 0, [DirA, DirB]);

      expect(() => new ComponentFixture(App)).toThrowError(/Cannot instantiate cyclic dependency!/);
    });

    it('should throw if directive tries to inject itself', () => {
      class Dir {
        constructor(dir: Dir) {}

        static ngDirectiveDef = defineDirective({
          selectors: [['', 'dir', '']],
          type: Dir,
          factory: () => new Dir(directiveInject(Dir)),
          features: [PublicFeature]
        });
      }

      /** <div dir></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['dir', '']);
        }
      }, 1, 0, [Dir]);

      expect(() => new ComponentFixture(App)).toThrowError(/Cannot instantiate cyclic dependency!/);
    });

    describe('flags', () => {

      class DirB {
        // TODO(issue/24571): remove '!'.
        value !: string;

        static ngDirectiveDef = defineDirective({
          type: DirB,
          selectors: [['', 'dirB', '']],
          factory: () => new DirB(),
          inputs: {value: 'dirB'},
          features: [PublicFeature]
        });
      }

      it('should not throw if dependency is @Optional', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Optional() public dirB: DirB|null) {}

          static ngDirectiveDef = defineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(directiveInject(DirB, InjectFlags.Optional))
          });
        }

        /** <div dirA></div> */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', ['dirA', '']);
          }
        }, 1, 0, [DirA, DirB]);

        expect(() => {
          new ComponentFixture(App);
          expect(dirA !.dirB).toEqual(null);
        }).not.toThrow();
      });

      it('should not throw if dependency is @Optional but defined elsewhere', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Optional() public dirB: DirB|null) {}

          static ngDirectiveDef = defineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(directiveInject(DirB, InjectFlags.Optional))
          });
        }

        /**
         * <div dirB></div>
         * <div dirA></div>
         */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', ['dirB', '']);
            element(1, 'div', ['dirA', '']);
          }
        }, 2, 0, [DirA, DirB]);

        expect(() => {
          new ComponentFixture(App);
          expect(dirA !.dirB).toEqual(null);
        }).not.toThrow();
      });

      it('should skip the current node with @SkipSelf', () => {
        let dirA: DirA;

        class DirA {
          constructor(@SkipSelf() public dirB: DirB) {}

          static ngDirectiveDef = defineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(directiveInject(DirB, InjectFlags.SkipSelf))
          });
        }

        /** <div dirA dirB="self"></div> */
        const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', ['dirA', '', 'dirB', 'self']);
          }
        }, 1, 0, [DirA, DirB]);

        /* <comp dirB="parent"></comp> */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'comp', ['dirB', 'parent']);
          }
        }, 1, 0, [Comp, DirB]);

        new ComponentFixture(App);
        expect(dirA !.dirB.value).toEqual('parent');
      });

      it('should check only the current node with @Self', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Self() public dirB: DirB) {}

          static ngDirectiveDef = defineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(directiveInject(DirB, InjectFlags.Self))
          });
        }

        /**
         * <div dirB>
         *   <div dirA></div>
         * </div>
         */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', ['dirB', '']);
            element(1, 'div', ['dirA', '']);
            elementEnd();
          }
        }, 2, 0, [DirA, DirB]);

        expect(() => { new ComponentFixture(App); }).toThrowError(/Injector: NOT_FOUND \[DirB\]/);
      });

      it('should check only the current node with @Self even with false positive', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Self() public dirB: DirB) {}

          static ngDirectiveDef = defineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(directiveInject(DirB, InjectFlags.Self))
          });
        }

        const DirC = createDirective('dirC');

        /**
         * <div dirB>
         *   <div dirA dirC></div>
         * </div>
         */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', ['dirB', '']);
            element(1, 'div', ['dirA', '', 'dirC', '']);
            elementEnd();
          }
        }, 2, 0, [DirA, DirB, DirC]);

        expect(() => {
          (DirA as any)['__NG_ELEMENT_ID__'] = 1;
          (DirC as any)['__NG_ELEMENT_ID__'] = 257;
          new ComponentFixture(App);
        }).toThrowError(/Injector: NOT_FOUND \[DirB\]/);
      });

      it('should not pass component boundary with @Host', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Host() public dirB: DirB) {}

          static ngDirectiveDef = defineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(directiveInject(DirB, InjectFlags.Host))
          });
        }

        /** <div dirA></div> */
        const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', ['dirA', '']);
          }
        }, 1, 0, [DirA, DirB]);

        /* <comp dirB></comp> */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'comp', ['dirB', '']);
          }
        }, 1, 0, [Comp, DirB]);

        expect(() => { new ComponentFixture(App); }).toThrowError(/Injector: NOT_FOUND \[DirB\]/);

      });

    });

  });

  describe('Special tokens', () => {

    describe('ElementRef', () => {

      it('should create directive with ElementRef dependencies', () => {
        let dir !: Directive;
        let dirSameInstance !: DirectiveSameInstance;
        let divNode !: LElementNode;

        class Directive {
          value: string;
          constructor(public elementRef: ElementRef) {
            this.value = (elementRef.constructor as any).name;
          }
          static ngDirectiveDef = defineDirective({
            type: Directive,
            selectors: [['', 'dir', '']],
            factory: () => dir = new Directive(directiveInject(ElementRef)),
            features: [PublicFeature],
            exportAs: 'dir'
          });
        }

        class DirectiveSameInstance {
          isSameInstance: boolean;
          constructor(public elementRef: ElementRef, directive: Directive) {
            this.isSameInstance = elementRef === directive.elementRef;
          }
          static ngDirectiveDef = defineDirective({
            type: DirectiveSameInstance,
            selectors: [['', 'dirSame', '']],
            factory: () => dirSameInstance = new DirectiveSameInstance(
                         directiveInject(ElementRef), directiveInject(Directive)),
            exportAs: 'dirSame'
          });
        }

        /** <div dir dirSame></div> */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div', ['dir', '', 'dirSame', '']);
            elementEnd();
            divNode = load(0);
          }
        }, 1, 0, [Directive, DirectiveSameInstance]);

        const fixture = new ComponentFixture(App);
        expect(dir.value).toContain('ElementRef');
        expect(dir.elementRef.nativeElement).toEqual(divNode.native);
        expect(dirSameInstance.elementRef.nativeElement).toEqual(divNode.native);

        // Each ElementRef instance should be unique
        expect(dirSameInstance.isSameInstance).toBe(false);
      });

      it('should create ElementRef with comment if requesting directive is on <ng-template> node',
         () => {
           let dir !: Directive;
           let commentNode !: LContainerNode;

           class Directive {
             value: string;
             constructor(public elementRef: ElementRef) {
               this.value = (elementRef.constructor as any).name;
             }
             static ngDirectiveDef = defineDirective({
               type: Directive,
               selectors: [['', 'dir', '']],
               factory: () => dir = new Directive(directiveInject(ElementRef)),
               features: [PublicFeature],
               exportAs: 'dir'
             });
           }

           /** <ng-template dir></ng-template> */
           const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               template(0, () => {}, 0, 0, null, ['dir', '']);
               commentNode = load(0);
             }
           }, 1, 0, [Directive]);

           const fixture = new ComponentFixture(App);
           expect(dir.value).toContain('ElementRef');
           expect(dir.elementRef.nativeElement).toEqual(commentNode.native);
         });
    });

    describe('TemplateRef', () => {
      it('should create directive with TemplateRef dependencies', () => {

        class Directive {
          value: string;
          constructor(public templateRef: TemplateRef<any>) {
            this.value = (templateRef.constructor as any).name;
          }
          static ngDirectiveDef = defineDirective({
            type: Directive,
            selectors: [['', 'dir', '']],
            factory: () => new Directive(directiveInject(TemplateRef as any)),
            features: [PublicFeature],
            exportAs: 'dir'
          });
        }

        class DirectiveSameInstance {
          isSameInstance: boolean;
          constructor(templateRef: TemplateRef<any>, directive: Directive) {
            this.isSameInstance = templateRef === directive.templateRef;
          }
          static ngDirectiveDef = defineDirective({
            type: DirectiveSameInstance,
            selectors: [['', 'dirSame', '']],
            factory: () => new DirectiveSameInstance(
                         directiveInject(TemplateRef as any), directiveInject(Directive)),
            exportAs: 'dirSame'
          });
        }

        /**
         * <ng-template dir dirSame #dir="dir" #dirSame="dirSame">
         *   {{ dir.value }} - {{ dirSame.value }}
         * </ng-template>
         */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            template(0, function() {
            }, 0, 0, undefined, ['dir', '', 'dirSame', ''], ['dir', 'dir', 'dirSame', 'dirSame']);
            text(3);
          }
          if (rf & RenderFlags.Update) {
            const tmp1 = reference(1) as any;
            const tmp2 = reference(2) as any;
            textBinding(3, interpolation2('', tmp1.value, '-', tmp2.isSameInstance, ''));
          }
        }, 4, 2, [Directive, DirectiveSameInstance]);

        const fixture = new ComponentFixture(App);
        // Each TemplateRef instance should be unique
        expect(fixture.html).toContain('TemplateRef');
        expect(fixture.html).toContain('false');
      });
    });

    describe('ViewContainerRef', () => {
      it('should create directive with ViewContainerRef dependencies', () => {
        class Directive {
          value: string;
          constructor(public viewContainerRef: ViewContainerRef) {
            this.value = (viewContainerRef.constructor as any).name;
          }
          static ngDirectiveDef = defineDirective({
            type: Directive,
            selectors: [['', 'dir', '']],
            factory: () => new Directive(directiveInject(ViewContainerRef as any)),
            features: [PublicFeature],
            exportAs: 'dir'
          });
        }

        class DirectiveSameInstance {
          isSameInstance: boolean;
          constructor(viewContainerRef: ViewContainerRef, directive: Directive) {
            this.isSameInstance = viewContainerRef === directive.viewContainerRef;
          }
          static ngDirectiveDef = defineDirective({
            type: DirectiveSameInstance,
            selectors: [['', 'dirSame', '']],
            factory: () => new DirectiveSameInstance(
                         directiveInject(ViewContainerRef as any), directiveInject(Directive)),
            exportAs: 'dirSame'
          });
        }

        /**
         * <div dir dirSame #dir="dir" #dirSame="dirSame">
         *   {{ dir.value }} - {{ dirSame.value }}
         * </div>
         */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(
                0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir', 'dirSame', 'dirSame']);
            { text(3); }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            const tmp1 = reference(1) as any;
            const tmp2 = reference(2) as any;
            textBinding(3, interpolation2('', tmp1.value, '-', tmp2.isSameInstance, ''));
          }
        }, 4, 2, [Directive, DirectiveSameInstance]);

        const fixture = new ComponentFixture(App);
        // Each ViewContainerRef instance should be unique
        expect(fixture.html).toContain('ViewContainerRef');
        expect(fixture.html).toContain('false');
      });
    });

    describe('ChangeDetectorRef', () => {
      let dir: Directive;
      let dirSameInstance: DirectiveSameInstance;
      let comp: MyComp;

      class MyComp {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: MyComp,
          selectors: [['my-comp']],
          factory: () => comp = new MyComp(directiveInject(ChangeDetectorRef as any)),
          consts: 1,
          vars: 0,
          template: function(rf: RenderFlags, ctx: MyComp) {
            if (rf & RenderFlags.Create) {
              projectionDef();
              projection(0);
            }
          }
        });
      }

      class Directive {
        value: string;

        constructor(public cdr: ChangeDetectorRef) { this.value = (cdr.constructor as any).name; }

        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => dir = new Directive(directiveInject(ChangeDetectorRef as any)),
          features: [PublicFeature],
          exportAs: 'dir'
        });
      }

      class DirectiveSameInstance {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngDirectiveDef = defineDirective({
          type: DirectiveSameInstance,
          selectors: [['', 'dirSame', '']],
          factory: () => dirSameInstance =
                       new DirectiveSameInstance(directiveInject(ChangeDetectorRef as any))
        });
      }

      const directives = [MyComp, Directive, DirectiveSameInstance, NgIf];

      it('should inject current component ChangeDetectorRef into directives on the same node as components',
         () => {
           /** <my-comp dir dirSameInstance #dir="dir"></my-comp> {{ dir.value }} */
           const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               element(0, 'my-comp', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
               text(2);
             }
             if (rf & RenderFlags.Update) {
               const tmp = reference(1) as any;
               textBinding(2, bind(tmp.value));
             }
           }, 3, 1, directives);

           const app = renderComponent(MyApp);
           // ChangeDetectorRef is the token, ViewRef has historically been the constructor
           expect(toHtml(app)).toEqual('<my-comp dir="" dirsame=""></my-comp>ViewRef');
           expect((comp !.cdr as ViewRef<MyComp>).context).toBe(comp);

           // Each ChangeDetectorRef instance should be unique
           expect(dir !.cdr).not.toBe(comp !.cdr);
           expect(dir !.cdr).not.toBe(dirSameInstance !.cdr);
         });

      it('should inject host component ChangeDetectorRef into directives on normal elements',
         () => {

           class MyApp {
             constructor(public cdr: ChangeDetectorRef) {}

             static ngComponentDef = defineComponent({
               type: MyApp,
               selectors: [['my-app']],
               consts: 3,
               vars: 1,
               factory: () => new MyApp(directiveInject(ChangeDetectorRef as any)),
               /** <div dir dirSameInstance #dir="dir"> {{ dir.value }} </div> */
               template: function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
                   { text(2); }
                   elementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                   const tmp = reference(1) as any;
                   textBinding(2, bind(tmp.value));
                 }
               },
               directives: directives
             });
           }

           const app = renderComponent(MyApp);
           expect(toHtml(app)).toEqual('<div dir="" dirsame="">ViewRef</div>');
           expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

           // Each ChangeDetectorRef instance should be unique
           expect(dir !.cdr).not.toBe(app.cdr);
           expect(dir !.cdr).not.toBe(dirSameInstance !.cdr);
         });

      it('should inject host component ChangeDetectorRef into directives in a component\'s ContentChildren',
         () => {
           class MyApp {
             constructor(public cdr: ChangeDetectorRef) {}

             static ngComponentDef = defineComponent({
               type: MyApp,
               selectors: [['my-app']],
               consts: 4,
               vars: 1,
               factory: () => new MyApp(directiveInject(ChangeDetectorRef as any)),
               /**
                * <my-comp>
                *   <div dir dirSameInstance #dir="dir"></div>
                * </my-comp>
                * {{ dir.value }}
                */
               template: function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   elementStart(0, 'my-comp');
                   { element(1, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']); }
                   elementEnd();
                   text(3);
                 }
                 if (rf & RenderFlags.Update) {
                   const tmp = reference(2) as any;
                   textBinding(3, bind(tmp.value));
                 }
               },
               directives: directives
             });
           }

           const app = renderComponent(MyApp);
           expect(toHtml(app)).toEqual('<my-comp><div dir="" dirsame=""></div></my-comp>ViewRef');
           expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

           // Each ChangeDetectorRef instance should be unique
           expect(dir !.cdr).not.toBe(app !.cdr);
           expect(dir !.cdr).not.toBe(dirSameInstance !.cdr);
         });

      it('should inject host component ChangeDetectorRef into directives in embedded views', () => {

        class MyApp {
          showing = true;

          constructor(public cdr: ChangeDetectorRef) {}

          static ngComponentDef = defineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: () => new MyApp(directiveInject(ChangeDetectorRef as any)),
            consts: 1,
            vars: 0,
            /**
             * % if (showing) {
           *   <div dir dirSameInstance #dir="dir"> {{ dir.value }} </div>
           * % }
             */
            template: function(rf: RenderFlags, ctx: MyApp) {
              if (rf & RenderFlags.Create) {
                container(0);
              }
              if (rf & RenderFlags.Update) {
                containerRefreshStart(0);
                {
                  if (ctx.showing) {
                    let rf1 = embeddedViewStart(0, 3, 1);
                    if (rf1 & RenderFlags.Create) {
                      elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
                      { text(2); }
                      elementEnd();
                    }
                    if (rf1 & RenderFlags.Update) {
                      const tmp = reference(1) as any;
                      textBinding(2, bind(tmp.value));
                    }
                  }
                  embeddedViewEnd();
                }
                containerRefreshEnd();
              }
            },
            directives: directives
          });
        }

        const app = renderComponent(MyApp);
        expect(toHtml(app)).toEqual('<div dir="" dirsame="">ViewRef</div>');
        expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

        // Each ChangeDetectorRef instance should be unique
        expect(dir !.cdr).not.toBe(app.cdr);
        expect(dir !.cdr).not.toBe(dirSameInstance !.cdr);
      });

      it('should inject host component ChangeDetectorRef into directives on containers', () => {
        function C1(rf1: RenderFlags, ctx1: any) {
          if (rf1 & RenderFlags.Create) {
            elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
            { text(2); }
            elementEnd();
          }
          if (rf1 & RenderFlags.Update) {
            const tmp = reference(1) as any;
            textBinding(2, bind(tmp.value));
          }
        }

        class MyApp {
          showing = true;

          constructor(public cdr: ChangeDetectorRef) {}

          static ngComponentDef = defineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: () => new MyApp(directiveInject(ChangeDetectorRef as any)),
            consts: 1,
            vars: 0,
            /** <div *ngIf="showing" dir dirSameInstance #dir="dir"> {{ dir.value }} </div> */
            template: function(rf: RenderFlags, ctx: MyApp) {
              if (rf & RenderFlags.Create) {
                template(0, C1, 3, 1, null, ['ngIf', 'showing']);
              }
            },
            directives: directives
          });
        }

        const app = renderComponent(MyApp);
        expect(toHtml(app)).toEqual('<div dir="" dirsame="">ViewRef</div>');
        expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

        // Each ChangeDetectorRef instance should be unique
        expect(dir !.cdr).not.toBe(app.cdr);
        expect(dir !.cdr).not.toBe(dirSameInstance !.cdr);
      });
    });
  });

  describe('Renderer2', () => {
    let comp: MyComp;

    class MyComp {
      constructor(public renderer: Renderer2) {}

      static ngComponentDef = defineComponent({
        type: MyComp,
        selectors: [['my-comp']],
        factory: () => comp = new MyComp(injectRenderer2()),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: MyComp) {
          if (rf & RenderFlags.Create) {
            text(0, 'Foo');
          }
        }
      });
    }

    it('should inject the Renderer2 used by the application', () => {
      const rendererFactory = getRendererFactory2(document);
      new ComponentFixture(MyComp, {rendererFactory: rendererFactory});
      expect(isProceduralRenderer(comp.renderer)).toBeTruthy();
    });

    it('should throw when injecting Renderer2 but the application is using Renderer3',
       () => { expect(() => new ComponentFixture(MyComp)).toThrow(); });
  });

  describe('@Attribute', () => {

    class MyDirective {
      exists = 'wrong' as string | undefined;
      myDirective = 'wrong' as string | undefined;
      constructor(
          @Attribute('exist') existAttrValue: string|undefined,
          @Attribute('myDirective') myDirectiveAttrValue: string|undefined) {
        this.exists = existAttrValue;
        this.myDirective = myDirectiveAttrValue;
      }

      static ngDirectiveDef = defineDirective({
        type: MyDirective,
        selectors: [['', 'myDirective', '']],
        factory: () => new MyDirective(injectAttribute('exist'), injectAttribute('myDirective'))
      });
    }

    it('should inject attribute', () => {
      let exist = 'wrong' as string | undefined;
      let nonExist = 'wrong' as string | undefined;

      const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['exist', 'existValue', 'other', 'ignore']);
          exist = injectAttribute('exist');
          nonExist = injectAttribute('nonExist');
        }
      }, 1);

      new ComponentFixture(MyApp);
      expect(exist).toEqual('existValue');
      expect(nonExist).toEqual(undefined);
    });

    // https://stackblitz.com/edit/angular-scawyi?file=src%2Fapp%2Fapp.component.ts
    it('should inject attributes on <ng-template>', () => {
      let myDirectiveInstance: MyDirective;

      /* <ng-template myDirective="initial" exist="existValue" other="ignore"></ng-template>*/
      const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          template(
              0, null, 0, 0, null,
              ['myDirective', 'initial', 'exist', 'existValue', 'other', 'ignore']);
        }
        if (rf & RenderFlags.Update) {
          myDirectiveInstance = getDirectiveOnNode(0);
        }
      }, 1, 0, [MyDirective]);

      new ComponentFixture(MyApp);
      expect(myDirectiveInstance !.exists).toEqual('existValue');
      expect(myDirectiveInstance !.myDirective).toEqual('initial');
    });

    // https://stackblitz.com/edit/angular-scawyi?file=src%2Fapp%2Fapp.component.ts
    it('should inject attributes on <ng-container>', () => {
      let myDirectiveInstance: MyDirective;

      /* <ng-container myDirective="initial" exist="existValue" other="ignore"></ng-container>*/
      const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementContainerStart(
              0, ['myDirective', 'initial', 'exist', 'existValue', 'other', 'ignore']);
          elementContainerEnd();
        }
        if (rf & RenderFlags.Update) {
          myDirectiveInstance = getDirectiveOnNode(0);
        }
      }, 1, 0, [MyDirective]);

      new ComponentFixture(MyApp);
      expect(myDirectiveInstance !.exists).toEqual('existValue');
      expect(myDirectiveInstance !.myDirective).toEqual('initial');
    });

    // https://stackblitz.com/edit/angular-8ytqkp?file=src%2Fapp%2Fapp.component.ts
    it('should not inject attributes representing bindings and outputs', () => {
      let exist = 'wrong' as string | undefined;
      let nonExist = 'wrong' as string | undefined;

      const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['exist', 'existValue', AttributeMarker.SelectOnly, 'nonExist']);
          exist = injectAttribute('exist');
          nonExist = injectAttribute('nonExist');
        }
      }, 1);

      new ComponentFixture(MyApp);
      expect(exist).toEqual('existValue');
      expect(nonExist).toEqual(undefined);
    });

    it('should not accidentally inject attributes representing bindings and outputs', () => {
      let exist = 'wrong' as string | undefined;
      let nonExist = 'wrong' as string | undefined;

      const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', [
            'exist', 'existValue', AttributeMarker.SelectOnly, 'binding1', 'nonExist', 'binding2'
          ]);
          exist = injectAttribute('exist');
          nonExist = injectAttribute('nonExist');
        }
      }, 1);

      new ComponentFixture(MyApp);
      expect(exist).toEqual('existValue');
      expect(nonExist).toEqual(undefined);
    });
  });

  describe('inject', () => {
    describe('bloom filter', () => {
      let mockTView: any;
      beforeEach(() => {
        mockTView = {data: [0, 0, 0, 0, 0, 0, 0, 0, null], firstTemplatePass: true};
      });

      function bloomState() { return mockTView.data.slice(0, TNODE).reverse(); }

      class Dir0 {
        /** @internal */ static __NG_ELEMENT_ID__ = 0;
      }
      class Dir1 {
        /** @internal */ static __NG_ELEMENT_ID__ = 1;
      }
      class Dir33 {
        /** @internal */ static __NG_ELEMENT_ID__ = 33;
      }
      class Dir66 {
        /** @internal */ static __NG_ELEMENT_ID__ = 66;
      }
      class Dir99 {
        /** @internal */ static __NG_ELEMENT_ID__ = 99;
      }
      class Dir132 {
        /** @internal */ static __NG_ELEMENT_ID__ = 132;
      }
      class Dir165 {
        /** @internal */ static __NG_ELEMENT_ID__ = 165;
      }
      class Dir198 {
        /** @internal */ static __NG_ELEMENT_ID__ = 198;
      }
      class Dir231 {
        /** @internal */ static __NG_ELEMENT_ID__ = 231;
      }

      it('should add values', () => {
        bloomAdd(0, mockTView, Dir0);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
        bloomAdd(0, mockTView, Dir33);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 0, 2, 1]);
        bloomAdd(0, mockTView, Dir66);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir99);
        expect(bloomState()).toEqual([0, 0, 0, 0, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir132);
        expect(bloomState()).toEqual([0, 0, 0, 16, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir165);
        expect(bloomState()).toEqual([0, 0, 32, 16, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir198);
        expect(bloomState()).toEqual([0, 64, 32, 16, 8, 4, 2, 1]);
        bloomAdd(0, mockTView, Dir231);
        expect(bloomState()).toEqual([128, 64, 32, 16, 8, 4, 2, 1]);
      });

      it('should query values', () => {
        bloomAdd(0, mockTView, Dir0);
        bloomAdd(0, mockTView, Dir33);
        bloomAdd(0, mockTView, Dir66);
        bloomAdd(0, mockTView, Dir99);
        bloomAdd(0, mockTView, Dir132);
        bloomAdd(0, mockTView, Dir165);
        bloomAdd(0, mockTView, Dir198);
        bloomAdd(0, mockTView, Dir231);

        expect(injectorHasToken(bloomHash(Dir0) as number, 0, mockTView.data)).toEqual(true);
        expect(injectorHasToken(bloomHash(Dir1) as number, 0, mockTView.data)).toEqual(false);
        expect(injectorHasToken(bloomHash(Dir33) as number, 0, mockTView.data)).toEqual(true);
        expect(injectorHasToken(bloomHash(Dir66) as number, 0, mockTView.data)).toEqual(true);
        expect(injectorHasToken(bloomHash(Dir99) as number, 0, mockTView.data)).toEqual(true);
        expect(injectorHasToken(bloomHash(Dir132) as number, 0, mockTView.data)).toEqual(true);
        expect(injectorHasToken(bloomHash(Dir165) as number, 0, mockTView.data)).toEqual(true);
        expect(injectorHasToken(bloomHash(Dir198) as number, 0, mockTView.data)).toEqual(true);
        expect(injectorHasToken(bloomHash(Dir231) as number, 0, mockTView.data)).toEqual(true);
      });
    });

    it('should inject from parent view', () => {
      const ParentDirective = createDirective('parentDir');

      class ChildDirective {
        value: string;
        constructor(public parent: any) { this.value = (parent.constructor as any).name; }
        static ngDirectiveDef = defineDirective({
          type: ChildDirective,
          selectors: [['', 'childDir', '']],
          factory: () => new ChildDirective(directiveInject(ParentDirective)),
          features: [PublicFeature],
          exportAs: 'childDir'
        });
      }

      class Child2Directive {
        value: boolean;
        constructor(parent: any, child: ChildDirective) { this.value = parent === child.parent; }
        static ngDirectiveDef = defineDirective({
          selectors: [['', 'child2Dir', '']],
          type: Child2Directive,
          factory: () => new Child2Directive(
                       directiveInject(ParentDirective), directiveInject(ChildDirective)),
          exportAs: 'child2Dir'
        });
      }

      /**
       * <div parentDir>
       *    % if (...) {
       *    <span childDir child2Dir #child1="childDir" #child2="child2Dir">
       *      {{ child1.value }} - {{ child2.value }}
       *    </span>
       *    % }
       * </div>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['parentDir', '']);
          { container(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(1);
          {
            let rf1 = embeddedViewStart(0, 4, 2);
            if (rf1 & RenderFlags.Create) {
              elementStart(
                  0, 'span', ['childDir', '', 'child2Dir', ''],
                  ['child1', 'childDir', 'child2', 'child2Dir']);
              { text(3); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              const tmp1 = reference(1) as any;
              const tmp2 = reference(2) as any;
              textBinding(3, interpolation2('', tmp1.value, '-', tmp2.value, ''));
            }
            embeddedViewEnd();
          }
          containerRefreshEnd();
        }
      }, 2, 0, [ChildDirective, Child2Directive, ParentDirective]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html)
          .toEqual('<div parentdir=""><span child2dir="" childdir="">Directive-true</span></div>');
    });

    it('should inject from module Injector', () => {

                                             });
  });

  describe('getOrCreateNodeInjector', () => {
    it('should handle initial undefined state', () => {
      const contentView = createLViewData(
          null !, createTView(-1, null, 1, 0, null, null, null), null, LViewFlags.CheckAlways);
      const oldView = enterView(contentView, null);
      try {
        const parentTNode = createNodeAtIndex(0, TNodeType.Element, null, null, null, null);
        // Simulate the situation where the previous parent is not initialized.
        // This happens on first bootstrap because we don't init existing values
        // so that we have smaller HelloWorld.
        (parentTNode as{parent: any}).parent = undefined;

        const injector: any = getOrCreateNodeInjector();  // TODO: Review use of `any` here (#19904)
        expect(injector).not.toBe(null);
      } finally {
        leaveView(oldView);
      }
    });
  });

});
