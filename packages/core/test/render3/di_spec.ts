/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Host, Inject, InjectFlags, Injector, Optional, Renderer2, Self, SkipSelf, ViewContainerRef, ɵɵdefineInjector} from '@angular/core';
import {createLView, createNodeAtIndex, createTView} from '@angular/core/src/render3/instructions/shared';
import {ComponentType, RenderFlags} from '@angular/core/src/render3/interfaces/definition';

import {createInjector} from '../../src/di/r3_injector';
import {ɵɵdefineComponent} from '../../src/render3/definition';
import {bloomAdd, bloomHasToken, bloomHashBitOrFactory as bloomHash, getOrCreateNodeInjectorForNode} from '../../src/render3/di';
import {ɵɵProvidersFeature, ɵɵbind, ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵdefineDirective, ɵɵdirectiveInject, ɵɵelement, ɵɵelementEnd, ɵɵelementProperty, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵinterpolation2, ɵɵprojection, ɵɵprojectionDef, ɵɵreference, ɵɵtemplate, ɵɵtext, ɵɵtextBinding} from '../../src/render3/index';
import {TNODE} from '../../src/render3/interfaces/injector';
import {AttributeMarker, TNodeType} from '../../src/render3/interfaces/node';
import {isProceduralRenderer} from '../../src/render3/interfaces/renderer';
import {LViewFlags} from '../../src/render3/interfaces/view';
import {enterView, leaveView} from '../../src/render3/state';
import {ViewRef} from '../../src/render3/view_ref';

import {NgIf} from './common_with_def';
import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, createComponent, createDirective, getDirectiveOnNode, renderComponent, toHtml} from './render_util';

describe('di', () => {
  describe('directive injection', () => {
    let log: string[] = [];

    class DirB {
      value = 'DirB';
      constructor() { log.push(this.value); }

      static ngDirectiveDef = ɵɵdefineDirective({
        selectors: [['', 'dirB', '']],
        type: DirB,
        factory: () => new DirB(),
        inputs: {value: 'value'}
      });
    }

    beforeEach(() => log = []);

    /**
     * This test needs to be moved to acceptance/di_spec.ts
     * when Ivy compiler supports inline views.
     */
    it('should inject directives in the correct order in a for loop', () => {
      class DirA {
        constructor(dir: DirB) { log.push(`DirA (dep: ${dir.value})`); }

        static ngDirectiveDef = ɵɵdefineDirective({
          selectors: [['', 'dirA', '']],
          type: DirA,
          factory: () => new DirA(ɵɵdirectiveInject(DirB))
        });
      }

      /**
       * % for(let i = 0; i < 3; i++) {
       *   <div dirA dirB></div>
       * % }
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵcontainer(0);
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(0);
          {
            for (let i = 0; i < 3; i++) {
              if (ɵɵembeddedViewStart(0, 1, 0)) {
                ɵɵelement(0, 'div', ['dirA', '', 'dirB', '']);
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
        }
      }, 1, 0, [DirA, DirB]);

      new ComponentFixture(App);
      expect(log).toEqual(
          ['DirB', 'DirA (dep: DirB)', 'DirB', 'DirA (dep: DirB)', 'DirB', 'DirA (dep: DirB)']);
    });

    describe('dependencies in parent views', () => {

      class DirA {
        injector: Injector;
        constructor(public dirB: DirB, public vcr: ViewContainerRef) {
          this.injector = vcr.injector;
        }

        static ngDirectiveDef = ɵɵdefineDirective({
          type: DirA,
          selectors: [['', 'dirA', '']],
          factory:
              () => new DirA(ɵɵdirectiveInject(DirB), ɵɵdirectiveInject(ViewContainerRef as any)),
          exportAs: ['dirA']
        });
      }

      /**
       * This test needs to be moved to acceptance/di_spec.ts
       * when Ivy compiler supports inline views.
       */
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
            ɵɵelementStart(0, 'div', ['dirB', '']);
            { ɵɵcontainer(1); }
            ɵɵelementEnd();
          }
          if (rf & RenderFlags.Update) {
            ɵɵcontainerRefreshStart(1);
            {
              if (!ctx.skipContent) {
                let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                {
                  if (rf1 & RenderFlags.Create) {
                    ɵɵcontainer(0);
                  }
                  if (rf1 & RenderFlags.Update) {
                    ɵɵcontainerRefreshStart(0);
                    {
                      if (!ctx.skipContent2) {
                        let rf2 = ɵɵembeddedViewStart(0, 3, 1);
                        {
                          if (rf2 & RenderFlags.Create) {
                            ɵɵelementStart(0, 'div', ['dirA', ''], ['dir', 'dirA']);
                            { ɵɵtext(2); }
                            ɵɵelementEnd();
                          }
                          if (rf2 & RenderFlags.Update) {
                            const dir = ɵɵreference(1) as DirA;
                            ɵɵtextBinding(2, ɵɵbind(dir.dirB.value));
                          }
                        }
                        ɵɵembeddedViewEnd();
                      }
                    }
                    ɵɵcontainerRefreshEnd();
                  }
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
          }
        }, 2, 0, [DirA, DirB]);

        const fixture = new ComponentFixture(App);
        expect(fixture.hostElement.textContent).toEqual(`DirB`);
      });
    });

    describe('flags', () => {

      class DirB {
        // TODO(issue/24571): remove '!'.
        value !: string;

        static ngDirectiveDef = ɵɵdefineDirective({
          type: DirB,
          selectors: [['', 'dirB', '']],
          factory: () => new DirB(),
          inputs: {value: 'dirB'}
        });
      }

      describe('Optional', () => {
        let dirA: DirA|null = null;

        class DirA {
          constructor(@Optional() public dirB: DirB|null) {}

          static ngDirectiveDef = ɵɵdefineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.Optional))
          });
        }

        beforeEach(() => dirA = null);

        it('should not throw if dependency is @Optional (limp mode)', () => {

          /** <div dirA></div> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirA', '']);
            }
          }, 1, 0, [DirA, DirB]);

          expect(() => { new ComponentFixture(App); }).not.toThrow();
          expect(dirA !.dirB).toEqual(null);
        });

        it('should not throw if dependency is @Optional (module injector)', () => {
          class SomeModule {
            static ngInjectorDef = ɵɵdefineInjector({factory: () => new SomeModule()});
          }

          /** <div dirA></div> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirA', '']);
            }
          }, 1, 0, [DirA, DirB]);

          expect(() => {
            const injector = createInjector(SomeModule);
            new ComponentFixture(App, {injector});
          }).not.toThrow();
          expect(dirA !.dirB).toEqual(null);
        });

        it('should return null if @Optional dependency has @Self flag', () => {
          let dirC !: DirC;

          class DirC {
            constructor(@Optional() @Self() public dirB: DirB|null) {}

            static ngDirectiveDef = ɵɵdefineDirective({
              type: DirC,
              selectors: [['', 'dirC', '']],
              factory: () => dirC =
                           new DirC(ɵɵdirectiveInject(DirB, InjectFlags.Optional|InjectFlags.Self))
            });
          }

          /** <div dirC></div> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirC', '']);
            }
          }, 1, 0, [DirC, DirB]);

          expect(() => { new ComponentFixture(App); }).not.toThrow();
          expect(dirC !.dirB).toEqual(null);
        });

        it('should not throw if dependency is @Optional but defined elsewhere', () => {
          let dirA: DirA;

          class DirA {
            constructor(@Optional() public dirB: DirB|null) {}

            static ngDirectiveDef = ɵɵdefineDirective({
              type: DirA,
              selectors: [['', 'dirA', '']],
              factory: () => dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.Optional))
            });
          }

          /**
           * <div dirB></div>
           * <div dirA></div>
           */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirB', '']);
              ɵɵelement(1, 'div', ['dirA', '']);
            }
          }, 2, 0, [DirA, DirB]);

          expect(() => {
            new ComponentFixture(App);
            expect(dirA !.dirB).toEqual(null);
          }).not.toThrow();
        });
      });

      it('should skip the current node with @SkipSelf', () => {
        let dirA: DirA;

        class DirA {
          constructor(@SkipSelf() public dirB: DirB) {}

          static ngDirectiveDef = ɵɵdefineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.SkipSelf))
          });
        }

        /** <div dirA dirB="self"></div> */
        const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'div', ['dirA', '', 'dirB', 'self']);
          }
        }, 1, 0, [DirA, DirB]);

        /* <comp dirB="parent"></comp> */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'comp', ['dirB', 'parent']);
          }
        }, 1, 0, [Comp, DirB]);

        new ComponentFixture(App);
        expect(dirA !.dirB.value).toEqual('parent');
      });

      it('should check only the current node with @Self', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Self() public dirB: DirB) {}

          static ngDirectiveDef = ɵɵdefineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.Self))
          });
        }

        /**
         * <div dirB>
         *   <div dirA></div>
         * </div>
         */
        const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'div', ['dirB', '']);
            ɵɵelement(1, 'div', ['dirA', '']);
            ɵɵelementEnd();
          }
        }, 2, 0, [DirA, DirB]);

        expect(() => {
          new ComponentFixture(App);
        }).toThrowError(/NodeInjector: NOT_FOUND \[DirB\]/);
      });

      it('should check only the current node with @Self even with false positive', () => {
        let dirA: DirA;

        class DirA {
          constructor(@Self() public dirB: DirB) {}

          static ngDirectiveDef = ɵɵdefineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.Self))
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
            ɵɵelementStart(0, 'div', ['dirB', '']);
            ɵɵelement(1, 'div', ['dirA', '', 'dirC', '']);
            ɵɵelementEnd();
          }
        }, 2, 0, [DirA, DirB, DirC]);

        expect(() => {
          (DirA as any)['__NG_ELEMENT_ID__'] = 1;
          (DirC as any)['__NG_ELEMENT_ID__'] = 257;
          new ComponentFixture(App);
        }).toThrowError(/NodeInjector: NOT_FOUND \[DirB\]/);
      });

      describe('@Host', () => {
        let dirA: DirA|null = null;
        let dirString: DirString|null = null;

        beforeEach(() => {
          dirA = null;
          dirString = null;
        });

        class DirA {
          constructor(@Host() public dirB: DirB) {}

          static ngDirectiveDef = ɵɵdefineDirective({
            type: DirA,
            selectors: [['', 'dirA', '']],
            factory: () => dirA = new DirA(ɵɵdirectiveInject(DirB, InjectFlags.Host))
          });
        }

        class DirString {
          constructor(@Host() public s: String) {}

          static ngDirectiveDef = ɵɵdefineDirective({
            type: DirString,
            selectors: [['', 'dirString', '']],
            factory: () => dirString = new DirString(ɵɵdirectiveInject(String, InjectFlags.Host))
          });
        }

        it('should find viewProviders on the host itself', () => {
          /** <div dirString></div> */
          const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirString', '']);
            }
          }, 1, 0, [DirString], [], null, [], [{provide: String, useValue: 'Foo'}]);

          /* <comp></comp> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'comp');
            }
          }, 1, 0, [Comp]);

          new ComponentFixture(App);
          expect(dirString !.s).toEqual('Foo');
        });

        it('should find host component on the host itself', () => {
          let dirComp: DirComp|null = null;

          class DirComp {
            constructor(@Host() public comp: any) {}

            static ngDirectiveDef = ɵɵdefineDirective({
              type: DirComp,
              selectors: [['', 'dirCmp', '']],
              factory: () => dirComp = new DirComp(ɵɵdirectiveInject(Comp, InjectFlags.Host))
            });
          }

          /** <div dirCmp></div> */
          const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirCmp', '']);
            }
          }, 1, 0, [DirComp]);

          /* <comp></comp> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'comp');
            }
          }, 1, 0, [Comp]);

          new ComponentFixture(App);
          expect(dirComp !.comp instanceof Comp).toBeTruthy();
        });

        it('should not find providers on the host itself', () => {
          /** <div dirString></div> */
          const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirString', '']);
            }
          }, 1, 0, [DirString], [], null, [{provide: String, useValue: 'Foo'}]);

          /* <comp></comp> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'comp');
            }
          }, 1, 0, [Comp]);

          expect(() => {
            new ComponentFixture(App);
          }).toThrowError(/NodeInjector: NOT_FOUND \[String\]/);
        });

        it('should not find other directives on the host itself', () => {
          /** <div dirA></div> */
          const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirA', '']);
            }
          }, 1, 0, [DirA]);

          /* <comp dirB></comp> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'comp', ['dirB', '']);
            }
          }, 1, 0, [Comp, DirB]);

          expect(() => {
            new ComponentFixture(App);
          }).toThrowError(/NodeInjector: NOT_FOUND \[DirB\]/);
        });

        it('should not find providers on the host itself if in inline view', () => {
          let comp !: any;

          /**
           * % if (showing) {
           *   <div dirA></div>
           * % }
           */
          const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵcontainer(0);
            }
            if (rf & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(0);
              {
                if (ctx.showing) {
                  let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                  if (rf1 & RenderFlags.Create) {
                    ɵɵelement(0, 'div', ['dirA', '']);
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
            }
          }, 1, 0, [DirA, DirB]);

          /* <comp dirB></comp> */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'comp', ['dirB', '']);
            }
            if (rf & RenderFlags.Update) {
              comp = getDirectiveOnNode(0);
            }
          }, 1, 0, [Comp, DirB]);

          const fixture = new ComponentFixture(App);
          expect(() => {
            comp.showing = true;
            fixture.update();
          }).toThrowError(/NodeInjector: NOT_FOUND \[DirB\]/);
        });

        it('should find providers across embedded views if not passing component boundary', () => {
          let dirB !: DirB;

          function IfTemplate(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirA', '']);
            }
          }

          /**
           * <div dirB>
           *   <div *ngIf="showing" dirA></div>
           * </div>
           */
          const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', ['dirB', '']);
              {
                ɵɵtemplate(
                    1, IfTemplate, 1, 0, 'div', ['dirA', '', AttributeMarker.Template, 'ngIf']);
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              ɵɵelementProperty(1, 'ngIf', ɵɵbind(ctx.showing));

              // testing only
              dirB = getDirectiveOnNode(0);
            }
          }, 2, 1, [NgIf, DirA, DirB]);

          const fixture = new ComponentFixture(App);
          fixture.component.showing = true;
          fixture.update();

          expect(dirA !.dirB).toEqual(dirB);
        });

        it('should not find component above the host', () => {
          let dirComp: DirComp|null = null;

          class DirComp {
            constructor(@Host() public comp: any) {}

            static ngDirectiveDef = ɵɵdefineDirective({
              type: DirComp,
              selectors: [['', 'dirCmp', '']],
              factory: () => dirComp = new DirComp(ɵɵdirectiveInject(App, InjectFlags.Host))
            });
          }

          /** <div dirCmp></div> */
          const Comp = createComponent('comp', function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['dirCmp', '']);
            }
          }, 1, 0, [DirComp]);

          /* <comp></comp> */
          class App {
            static ngComponentDef = ɵɵdefineComponent({
              type: App,
              selectors: [['app']],
              consts: 1,
              vars: 0,
              factory: () => new App,
              template: function(rf: RenderFlags, ctx: any) {
                if (rf & RenderFlags.Create) {
                  ɵɵelement(0, 'comp');
                }
              },
              directives: [Comp],
            });
          }

          expect(() => {
            new ComponentFixture(App);
          }).toThrowError(/NodeInjector: NOT_FOUND \[App\]/);
        });

        describe('regression', () => {
          // based on https://stackblitz.com/edit/angular-riss8k?file=src/app/app.component.ts
          it('should allow directives with Host flag to inject view providers from containing component',
             () => {
               let controlContainers: ControlContainer[] = [];
               let injectedControlContainer: ControlContainer|null = null;

               class ControlContainer {}

               /*
               @Directive({
                 selector: '[group]',
                 providers: [{provide: ControlContainer, useExisting: GroupDirective}]
               })
               */
               class GroupDirective {
                 constructor() { controlContainers.push(this); }

                 static ngDirectiveDef = ɵɵdefineDirective({
                   type: GroupDirective,
                   selectors: [['', 'group', '']],
                   factory: () => new GroupDirective(),
                   features: [ɵɵProvidersFeature(
                       [{provide: ControlContainer, useExisting: GroupDirective}])],
                 });
               }

               // @Directive({selector: '[controlName]'})
               class ControlNameDirective {
                 constructor(@Host() @SkipSelf() @Inject(ControlContainer) parent:
                                 ControlContainer) {
                   injectedControlContainer = parent;
                 }

                 static ngDirectiveDef = ɵɵdefineDirective({
                   type: ControlNameDirective,
                   selectors: [['', 'controlName', '']],
                   factory: () => new ControlNameDirective(ɵɵdirectiveInject(
                                ControlContainer, InjectFlags.Host|InjectFlags.SkipSelf))
                 });
               }

               /*
               @Component({
                 selector: 'child',
                 template: `
                   <input controlName type="text">
                 `,
                 viewProviders: [{provide: ControlContainer, useExisting: GroupDirective}]
               })
               */
               class ChildComponent {
                 static ngComponentDef = ɵɵdefineComponent({
                   type: ChildComponent,
                   selectors: [['child']],
                   consts: 1,
                   vars: 0,
                   factory: () => new ChildComponent(),
                   template: function(rf: RenderFlags, ctx: ChildComponent) {
                     if (rf & RenderFlags.Create) {
                       ɵɵelement(0, 'input', ['controlName', '', 'type', 'text']);
                     }
                   },
                   directives: [ControlNameDirective],
                   features: [ɵɵProvidersFeature(
                       [], [{provide: ControlContainer, useExisting: GroupDirective}])],
                 });
               }
               /*
               @Component({
                 selector: 'my-app',
                 template: `
                   <div group>
                     <child></child>
                   </div>
                 `
               })
               */
               class AppComponent {
                 static ngComponentDef = ɵɵdefineComponent({
                   type: AppComponent,
                   selectors: [['my-app']],
                   consts: 2,
                   vars: 0,
                   factory: () => new AppComponent(),
                   template: function(rf: RenderFlags, ctx: AppComponent) {
                     if (rf & RenderFlags.Create) {
                       ɵɵelementStart(0, 'div', ['group', '']);
                       ɵɵelement(1, 'child');
                       ɵɵelementEnd();
                     }
                   },
                   directives: [ChildComponent, GroupDirective]
                 });
               }

               const fixture = new ComponentFixture(AppComponent as ComponentType<AppComponent>);
               expect(fixture.html)
                   .toEqual(
                       '<div group=""><child><input controlname="" type="text"></child></div>');

               expect(controlContainers).toEqual([injectedControlContainer !]);

             });
        });
      });
    });
  });

  describe('Special tokens', () => {

    describe('ChangeDetectorRef', () => {
      let dir: Directive;
      let dirSameInstance: DirectiveSameInstance;
      let comp: MyComp;

      class MyComp {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = ɵɵdefineComponent({
          type: MyComp,
          selectors: [['my-comp']],
          factory: () => comp = new MyComp(ɵɵdirectiveInject(ChangeDetectorRef as any)),
          consts: 1,
          vars: 0,
          template: function(rf: RenderFlags, ctx: MyComp) {
            if (rf & RenderFlags.Create) {
              ɵɵprojectionDef();
              ɵɵprojection(0);
            }
          }
        });
      }

      class Directive {
        value: string;

        constructor(public cdr: ChangeDetectorRef) { this.value = (cdr.constructor as any).name; }

        static ngDirectiveDef = ɵɵdefineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => dir = new Directive(ɵɵdirectiveInject(ChangeDetectorRef as any)),
          exportAs: ['dir']
        });
      }

      class DirectiveSameInstance {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngDirectiveDef = ɵɵdefineDirective({
          type: DirectiveSameInstance,
          selectors: [['', 'dirSame', '']],
          factory: () => dirSameInstance =
                       new DirectiveSameInstance(ɵɵdirectiveInject(ChangeDetectorRef as any))
        });
      }

      const directives = [MyComp, Directive, DirectiveSameInstance, NgIf];

      /**
       * This test needs to be moved to acceptance/di_spec.ts
       * when Ivy compiler supports inline views.
       */
      it('should inject host component ChangeDetectorRef into directives in embedded views', () => {

        class MyApp {
          showing = true;

          constructor(public cdr: ChangeDetectorRef) {}

          static ngComponentDef = ɵɵdefineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: () => new MyApp(ɵɵdirectiveInject(ChangeDetectorRef as any)),
            consts: 1,
            vars: 0,
            /**
             * % if (showing) {
             *   <div dir dirSame #dir="dir"> {{ dir.value }} </div>
             * % }
             */
            template: function(rf: RenderFlags, ctx: MyApp) {
              if (rf & RenderFlags.Create) {
                ɵɵcontainer(0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵcontainerRefreshStart(0);
                {
                  if (ctx.showing) {
                    let rf1 = ɵɵembeddedViewStart(0, 3, 1);
                    if (rf1 & RenderFlags.Create) {
                      ɵɵelementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
                      { ɵɵtext(2); }
                      ɵɵelementEnd();
                    }
                    if (rf1 & RenderFlags.Update) {
                      const tmp = ɵɵreference(1) as any;
                      ɵɵtextBinding(2, ɵɵbind(tmp.value));
                    }
                  }
                  ɵɵembeddedViewEnd();
                }
                ɵɵcontainerRefreshEnd();
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
    class MyComp {
      constructor(public renderer: Renderer2) {}

      static ngComponentDef = ɵɵdefineComponent({
        type: MyComp,
        selectors: [['my-comp']],
        factory: () => new MyComp(ɵɵdirectiveInject(Renderer2 as any)),
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: MyComp) {
          if (rf & RenderFlags.Create) {
            ɵɵtext(0, 'Foo');
          }
        }
      });
    }

    it('should inject the Renderer2 used by the application', () => {
      const rendererFactory = getRendererFactory2(document);
      const fixture = new ComponentFixture(MyComp, {rendererFactory: rendererFactory});
      expect(isProceduralRenderer(fixture.component.renderer)).toBeTruthy();
    });

    it('should throw when injecting Renderer2 but the application is using Renderer3',
       () => { expect(() => new ComponentFixture(MyComp)).toThrow(); });
  });

  describe('ɵɵinject', () => {
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

        expect(bloomHasToken(bloomHash(Dir0) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir1) as number, 0, mockTView.data)).toEqual(false);
        expect(bloomHasToken(bloomHash(Dir33) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir66) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir99) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir132) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir165) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir198) as number, 0, mockTView.data)).toEqual(true);
        expect(bloomHasToken(bloomHash(Dir231) as number, 0, mockTView.data)).toEqual(true);
      });
    });

    it('should inject from parent view', () => {
      const ParentDirective = createDirective('parentDir');

      class ChildDirective {
        value: string;
        constructor(public parent: any) { this.value = (parent.constructor as any).name; }
        static ngDirectiveDef = ɵɵdefineDirective({
          type: ChildDirective,
          selectors: [['', 'childDir', '']],
          factory: () => new ChildDirective(ɵɵdirectiveInject(ParentDirective)),
          exportAs: ['childDir']
        });
      }

      class Child2Directive {
        value: boolean;
        constructor(parent: any, child: ChildDirective) { this.value = parent === child.parent; }
        static ngDirectiveDef = ɵɵdefineDirective({
          selectors: [['', 'child2Dir', '']],
          type: Child2Directive,
          factory: () => new Child2Directive(
                       ɵɵdirectiveInject(ParentDirective), ɵɵdirectiveInject(ChildDirective)),
          exportAs: ['child2Dir']
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
          ɵɵelementStart(0, 'div', ['parentDir', '']);
          { ɵɵcontainer(1); }
          ɵɵelementEnd();
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(1);
          {
            let rf1 = ɵɵembeddedViewStart(0, 4, 2);
            if (rf1 & RenderFlags.Create) {
              ɵɵelementStart(
                  0, 'span', ['childDir', '', 'child2Dir', ''],
                  ['child1', 'childDir', 'child2', 'child2Dir']);
              { ɵɵtext(3); }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const tmp1 = ɵɵreference(1) as any;
              const tmp2 = ɵɵreference(2) as any;
              ɵɵtextBinding(3, ɵɵinterpolation2('', tmp1.value, '-', tmp2.value, ''));
            }
            ɵɵembeddedViewEnd();
          }
          ɵɵcontainerRefreshEnd();
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
      const contentView = createLView(
          null, createTView(-1, null, 1, 0, null, null, null, null), null, LViewFlags.CheckAlways,
          null, null, {} as any, {} as any);
      const oldView = enterView(contentView, null);
      try {
        const parentTNode = createNodeAtIndex(0, TNodeType.Element, null, null, null);
        // Simulate the situation where the previous parent is not initialized.
        // This happens on first bootstrap because we don't init existing values
        // so that we have smaller HelloWorld.
        (parentTNode as{parent: any}).parent = undefined;

        const injector = getOrCreateNodeInjectorForNode(parentTNode, contentView);
        expect(injector).not.toEqual(-1);
      } finally {
        leaveView(oldView);
      }
    });
  });

});
