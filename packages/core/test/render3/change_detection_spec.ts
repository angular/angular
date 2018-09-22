/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {withBody} from '@angular/private/testing';

import {ChangeDetectionStrategy, ChangeDetectorRef, DoCheck, RendererType2} from '../../src/core';
import {getRenderedText, whenRendered} from '../../src/render3/component';
import {directiveInject} from '../../src/render3/di';
import {LifecycleHooksFeature, defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, detectChanges, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, interpolation2, listener, markDirty, text, textBinding, tick} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {RElement, Renderer3, RendererFactory3} from '../../src/render3/interfaces/renderer';

import {containerEl, createComponent, renderComponent, requestAnimationFrame} from './render_util';

describe('change detection', () => {
  describe('markDirty, detectChanges, whenRendered, getRenderedText', () => {
    class MyComponent implements DoCheck {
      value: string = 'works';
      doCheckCount = 0;
      ngDoCheck(): void { this.doCheckCount++; }

      static ngComponentDef = defineComponent({
        type: MyComponent,
        selectors: [['my-comp']],
        factory: () => new MyComponent(),
        consts: 2,
        vars: 1,
        template: (rf: RenderFlags, ctx: MyComponent) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'span');
            text(1);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            textBinding(1, bind(ctx.value));
          }
        }
      });
    }

    it('should mark a component dirty and schedule change detection', withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent, {hostFeatures: [LifecycleHooksFeature]});
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         markDirty(myComp);
         expect(getRenderedText(myComp)).toEqual('works');
         requestAnimationFrame.flush();
         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges on a component', withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent, {hostFeatures: [LifecycleHooksFeature]});
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         detectChanges(myComp);
         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges only once if markDirty is called multiple times',
       withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent, {hostFeatures: [LifecycleHooksFeature]});
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
         const myComp = renderComponent(MyComponent, {hostFeatures: [LifecycleHooksFeature]});
         await whenRendered(myComp);
         myComp.value = 'updated';
         markDirty(myComp);
         setTimeout(requestAnimationFrame.flush, 0);
         await whenRendered(myComp);
         expect(getRenderedText(myComp)).toEqual('updated');
       }));
  });

  describe('onPush', () => {
    let comp: MyComponent;

    class MyComponent implements DoCheck {
      /* @Input() */
      name = 'Nancy';
      doCheckCount = 0;

      ngDoCheck(): void { this.doCheckCount++; }

      onClick() {}

      static ngComponentDef = defineComponent({
        type: MyComponent,
        selectors: [['my-comp']],
        factory: () => comp = new MyComponent(),
        consts: 2,
        vars: 2,
        /**
         * {{ doCheckCount }} - {{ name }}
         * <button (click)="onClick()"></button>
         */
        template: (rf: RenderFlags, ctx: MyComponent) => {
          if (rf & RenderFlags.Create) {
            text(0);
            elementStart(1, 'button');
            {
              listener('click', () => { ctx.onClick(); });
            }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            textBinding(0, interpolation2('', ctx.doCheckCount, ' - ', ctx.name, ''));
          }
        },
        changeDetection: ChangeDetectionStrategy.OnPush,
        inputs: {name: 'name'}
      });
    }

    class MyApp {
      name: string = 'Nancy';

      static ngComponentDef = defineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        consts: 1,
        vars: 1,
        /** <my-comp [name]="name"></my-comp> */
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            element(0, 'my-comp');
          }
          if (rf & RenderFlags.Update) {
            elementProperty(0, 'name', bind(ctx.name));
          }
        },
        directives: () => [MyComponent]
      });
    }

    it('should check OnPush components on initialization', () => {
      const myApp = renderComponent(MyApp);
      expect(getRenderedText(myApp)).toEqual('1 - Nancy');
    });

    it('should call doCheck even when OnPush components are not dirty', () => {
      const myApp = renderComponent(MyApp);

      tick(myApp);
      expect(comp.doCheckCount).toEqual(2);

      tick(myApp);
      expect(comp.doCheckCount).toEqual(3);
    });

    it('should skip OnPush components in update mode when they are not dirty', () => {
      const myApp = renderComponent(MyApp);

      tick(myApp);
      // doCheckCount is 2, but 1 should be rendered since it has not been marked dirty.
      expect(getRenderedText(myApp)).toEqual('1 - Nancy');

      tick(myApp);
      // doCheckCount is 3, but 1 should be rendered since it has not been marked dirty.
      expect(getRenderedText(myApp)).toEqual('1 - Nancy');
    });

    it('should check OnPush components in update mode when inputs change', () => {
      const myApp = renderComponent(MyApp);

      myApp.name = 'Bess';
      tick(myApp);
      expect(getRenderedText(myApp)).toEqual('2 - Bess');

      myApp.name = 'George';
      tick(myApp);
      expect(getRenderedText(myApp)).toEqual('3 - George');

      tick(myApp);
      expect(getRenderedText(myApp)).toEqual('3 - George');
    });

    it('should not check OnPush components in update mode when component events occur, unless marked dirty',
       () => {
         const myApp = renderComponent(MyApp);
         expect(comp.doCheckCount).toEqual(1);
         expect(getRenderedText(myApp)).toEqual('1 - Nancy');

         const button = containerEl.querySelector('button') !;
         button.click();
         requestAnimationFrame.flush();
         // No ticks should have been scheduled.
         expect(comp.doCheckCount).toEqual(1);
         expect(getRenderedText(myApp)).toEqual('1 - Nancy');

         tick(myApp);
         // The comp should still be clean. So doCheck will run, but the view should display 1.
         expect(comp.doCheckCount).toEqual(2);
         expect(getRenderedText(myApp)).toEqual('1 - Nancy');

         markDirty(comp);
         requestAnimationFrame.flush();
         // Now that markDirty has been manually called, the view should be dirty and a tick
         // should be scheduled to check the view.
         expect(comp.doCheckCount).toEqual(3);
         expect(getRenderedText(myApp)).toEqual('3 - Nancy');
       });

    it('should not check OnPush components in update mode when parent events occur', () => {
      function noop() {}

      const ButtonParent = createComponent('button-parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'my-comp');
          elementStart(1, 'button', ['id', 'parent']);
          { listener('click', () => noop()); }
          elementEnd();
        }
      }, 2, 0, [MyComponent]);

      const buttonParent = renderComponent(ButtonParent);
      expect(getRenderedText(buttonParent)).toEqual('1 - Nancy');

      const button = containerEl.querySelector('button#parent') !;
      (button as HTMLButtonElement).click();
      tick(buttonParent);
      // The comp should still be clean. So doCheck will run, but the view should display 1.
      expect(getRenderedText(buttonParent)).toEqual('1 - Nancy');
    });

    it('should not check parent OnPush components in update mode when child events occur, unless marked dirty',
       () => {
         let parent: ButtonParent;

         class ButtonParent implements DoCheck {
           doCheckCount = 0;
           ngDoCheck(): void { this.doCheckCount++; }

           static ngComponentDef = defineComponent({
             type: ButtonParent,
             selectors: [['button-parent']],
             factory: () => parent = new ButtonParent(),
             consts: 2,
             vars: 1,
             /** {{ doCheckCount }} - <my-comp></my-comp> */
             template: (rf: RenderFlags, ctx: ButtonParent) => {
               if (rf & RenderFlags.Create) {
                 text(0);
                 element(1, 'my-comp');
               }
               if (rf & RenderFlags.Update) {
                 textBinding(0, interpolation1('', ctx.doCheckCount, ' - '));
               }
             },
             directives: () => [MyComponent],
             changeDetection: ChangeDetectionStrategy.OnPush
           });
         }

         const MyButtonApp = createComponent('my-button-app', function(rf: RenderFlags, ctx: any) {
           if (rf & RenderFlags.Create) {
             element(0, 'button-parent');
           }
         }, 1, 0, [ButtonParent]);

         const myButtonApp = renderComponent(MyButtonApp);
         expect(parent !.doCheckCount).toEqual(1);
         expect(comp !.doCheckCount).toEqual(1);
         expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

         tick(myButtonApp);
         expect(parent !.doCheckCount).toEqual(2);
         // parent isn't checked, so child doCheck won't run
         expect(comp !.doCheckCount).toEqual(1);
         expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

         const button = containerEl.querySelector('button');
         button !.click();
         requestAnimationFrame.flush();
         // No ticks should have been scheduled.
         expect(parent !.doCheckCount).toEqual(2);
         expect(comp !.doCheckCount).toEqual(1);

         tick(myButtonApp);
         expect(parent !.doCheckCount).toEqual(3);
         // parent isn't checked, so child doCheck won't run
         expect(comp !.doCheckCount).toEqual(1);
         expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

         markDirty(comp);
         requestAnimationFrame.flush();
         // Now that markDirty has been manually called, both views should be dirty and a tick
         // should be scheduled to check the view.
         expect(parent !.doCheckCount).toEqual(4);
         expect(comp !.doCheckCount).toEqual(2);
         expect(getRenderedText(myButtonApp)).toEqual('4 - 2 - Nancy');
       });
  });

  describe('ChangeDetectorRef', () => {

    describe('detectChanges()', () => {
      let myComp: MyComp;
      let dir: Dir;

      class MyComp {
        doCheckCount = 0;
        name = 'Nancy';

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() { this.doCheckCount++; }

        static ngComponentDef = defineComponent({
          type: MyComp,
          selectors: [['my-comp']],
          factory: () => myComp = new MyComp(directiveInject(ChangeDetectorRef as any)),
          consts: 1,
          vars: 1,
          /** {{ name }} */
          template: (rf: RenderFlags, ctx: MyComp) => {
            if (rf & RenderFlags.Create) {
              text(0);
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, bind(ctx.name));
            }
          },
          changeDetection: ChangeDetectionStrategy.OnPush
        });
      }

      class ParentComp {
        doCheckCount = 0;

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() { this.doCheckCount++; }

        static ngComponentDef = defineComponent({
          type: ParentComp,
          selectors: [['parent-comp']],
          factory: () => new ParentComp(directiveInject(ChangeDetectorRef as any)),
          consts: 2,
          vars: 1,
          /**
           * {{ doCheckCount}} -
           * <my-comp></my-comp>
           */
          template: (rf: RenderFlags, ctx: ParentComp) => {
            if (rf & RenderFlags.Create) {
              text(0);
              element(1, 'my-comp');
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, interpolation1('', ctx.doCheckCount, ' - '));
            }
          },
          directives: () => [MyComp]
        });
      }

      class Dir {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngDirectiveDef = defineDirective({
          type: Dir,
          selectors: [['', 'dir', '']],
          factory: () => dir = new Dir(directiveInject(ChangeDetectorRef as any))
        });
      }


      it('should check the component view when called by component (even when OnPush && clean)',
         () => {
           const comp = renderComponent(MyComp, {hostFeatures: [LifecycleHooksFeature]});
           expect(getRenderedText(comp)).toEqual('Nancy');

           comp.name = 'Bess';  // as this is not an Input, the component stays clean
           comp.cdr.detectChanges();
           expect(getRenderedText(comp)).toEqual('Bess');
         });

      it('should NOT call component doCheck when called by a component', () => {
        const comp = renderComponent(MyComp, {hostFeatures: [LifecycleHooksFeature]});
        expect(comp.doCheckCount).toEqual(1);

        // NOTE: in current Angular, detectChanges does not itself trigger doCheck, but you
        // may see doCheck called in some cases bc of the extra CD run triggered by zone.js.
        // It's important not to call doCheck to allow calls to detectChanges in that hook.
        comp.cdr.detectChanges();
        expect(comp.doCheckCount).toEqual(1);
      });

      it('should NOT check the component parent when called by a child component', () => {
        const parentComp = renderComponent(ParentComp, {hostFeatures: [LifecycleHooksFeature]});
        expect(getRenderedText(parentComp)).toEqual('1 - Nancy');

        parentComp.doCheckCount = 100;
        myComp.cdr.detectChanges();
        expect(parentComp.doCheckCount).toEqual(100);
        expect(getRenderedText(parentComp)).toEqual('1 - Nancy');
      });

      it('should check component children when called by component if dirty or check-always',
         () => {
           const parentComp = renderComponent(ParentComp, {hostFeatures: [LifecycleHooksFeature]});
           expect(parentComp.doCheckCount).toEqual(1);

           myComp.name = 'Bess';
           parentComp.cdr.detectChanges();
           expect(parentComp.doCheckCount).toEqual(1);
           expect(myComp.doCheckCount).toEqual(2);
           // OnPush child is not dirty, so its change isn't rendered.
           expect(getRenderedText(parentComp)).toEqual('1 - Nancy');
         });

      it('should not group detectChanges calls (call every time)', () => {
        const parentComp = renderComponent(ParentComp, {hostFeatures: [LifecycleHooksFeature]});
        expect(myComp.doCheckCount).toEqual(1);

        parentComp.cdr.detectChanges();
        parentComp.cdr.detectChanges();
        expect(myComp.doCheckCount).toEqual(3);
      });

      it('should check component view when called by directive on component node', () => {
        /** <my-comp dir></my-comp> */
        const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'my-comp', ['dir', '']);
          }
        }, 1, 0, [MyComp, Dir]);

        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('Nancy');

        myComp.name = 'George';
        dir !.cdr.detectChanges();
        expect(getRenderedText(app)).toEqual('George');
      });

      it('should check host component when called by directive on element node', () => {
        /**
         * {{ name }}
         * <div dir></div>
         */
        const MyApp = createComponent('my-app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            text(0);
            element(1, 'div', ['dir', '']);
          }
          if (rf & RenderFlags.Update) {
            textBinding(1, bind(ctx.value));
          }
        }, 2, 1, [Dir]);

        const app = renderComponent(MyApp);
        app.value = 'Frank';
        tick(app);
        expect(getRenderedText(app)).toEqual('Frank');

        app.value = 'Joe';
        dir !.cdr.detectChanges();
        expect(getRenderedText(app)).toEqual('Joe');
      });

      it('should check the host component when called from EmbeddedViewRef', () => {
        class MyApp {
          showing = true;
          name = 'Amelia';

          constructor(public cdr: ChangeDetectorRef) {}

          static ngComponentDef = defineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: () => new MyApp(directiveInject(ChangeDetectorRef as any)),
            consts: 2,
            vars: 1,
            /**
             * {{ name}}
             * % if (showing) {
           *   <div dir></div>
           * % }
             */
            template: function(rf: RenderFlags, ctx: MyApp) {
              if (rf & RenderFlags.Create) {
                text(0);
                container(1);
              }
              if (rf & RenderFlags.Update) {
                textBinding(0, bind(ctx.name));
                containerRefreshStart(1);
                {
                  if (ctx.showing) {
                    let rf0 = embeddedViewStart(0, 1, 0);
                    if (rf0 & RenderFlags.Create) {
                      element(0, 'div', ['dir', '']);
                    }
                  }
                  embeddedViewEnd();
                }
                containerRefreshEnd();
              }
            },
            directives: [Dir]
          });
        }

        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('Amelia');

        app.name = 'Emerson';
        dir !.cdr.detectChanges();
        expect(getRenderedText(app)).toEqual('Emerson');
      });

      it('should support call in ngOnInit', () => {
        class DetectChangesComp {
          value = 0;

          constructor(public cdr: ChangeDetectorRef) {}

          ngOnInit() {
            this.value++;
            this.cdr.detectChanges();
          }

          static ngComponentDef = defineComponent({
            type: DetectChangesComp,
            selectors: [['detect-changes-comp']],
            factory: () => new DetectChangesComp(directiveInject(ChangeDetectorRef as any)),
            consts: 1,
            vars: 1,
            /** {{ value }} */
            template: (rf: RenderFlags, ctx: DetectChangesComp) => {
              if (rf & RenderFlags.Create) {
                text(0);
              }
              if (rf & RenderFlags.Update) {
                textBinding(0, bind(ctx.value));
              }
            }
          });
        }

        const comp = renderComponent(DetectChangesComp, {hostFeatures: [LifecycleHooksFeature]});
        expect(getRenderedText(comp)).toEqual('1');
      });

      it('should support call in ngDoCheck', () => {
        class DetectChangesComp {
          doCheckCount = 0;

          constructor(public cdr: ChangeDetectorRef) {}

          ngDoCheck() {
            this.doCheckCount++;
            this.cdr.detectChanges();
          }

          static ngComponentDef = defineComponent({
            type: DetectChangesComp,
            selectors: [['detect-changes-comp']],
            factory: () => new DetectChangesComp(directiveInject(ChangeDetectorRef as any)),
            consts: 1,
            vars: 1,
            /** {{ doCheckCount }} */
            template: (rf: RenderFlags, ctx: DetectChangesComp) => {
              if (rf & RenderFlags.Create) {
                text(0);
              }
              if (rf & RenderFlags.Update) {
                textBinding(0, bind(ctx.doCheckCount));
              }
            }
          });
        }

        const comp = renderComponent(DetectChangesComp, {hostFeatures: [LifecycleHooksFeature]});
        expect(getRenderedText(comp)).toEqual('1');
      });

    });

    describe('attach/detach', () => {
      let comp: DetachedComp;

      class MyApp {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: () => new MyApp(directiveInject(ChangeDetectorRef as any)),
          consts: 1,
          vars: 0,
          /** <detached-comp></detached-comp> */
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'detached-comp');
            }
          },
          directives: () => [DetachedComp]
        });
      }

      class DetachedComp {
        value = 'one';
        doCheckCount = 0;

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() { this.doCheckCount++; }

        static ngComponentDef = defineComponent({
          type: DetachedComp,
          selectors: [['detached-comp']],
          factory: () => comp = new DetachedComp(directiveInject(ChangeDetectorRef as any)),
          consts: 1,
          vars: 1,
          /** {{ value }} */
          template: (rf: RenderFlags, ctx: DetachedComp) => {
            if (rf & RenderFlags.Create) {
              text(0);
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, bind(ctx.value));
            }
          }
        });
      }

      it('should not check detached components', () => {
        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('one');

        comp.cdr.detach();

        comp.value = 'two';
        tick(app);
        expect(getRenderedText(app)).toEqual('one');
      });

      it('should check re-attached components', () => {
        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('one');

        comp.cdr.detach();
        comp.value = 'two';

        comp.cdr.reattach();
        tick(app);
        expect(getRenderedText(app)).toEqual('two');
      });

      it('should call lifecycle hooks on detached components', () => {
        const app = renderComponent(MyApp);
        expect(comp.doCheckCount).toEqual(1);

        comp.cdr.detach();

        tick(app);
        expect(comp.doCheckCount).toEqual(2);
      });

      it('should check detached component when detectChanges is called', () => {
        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('one');

        comp.cdr.detach();

        comp.value = 'two';
        detectChanges(comp);
        expect(getRenderedText(app)).toEqual('two');
      });

      it('should not check detached component when markDirty is called', () => {
        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('one');

        comp.cdr.detach();

        comp.value = 'two';
        markDirty(comp);
        requestAnimationFrame.flush();

        expect(getRenderedText(app)).toEqual('one');
      });

      it('should detach any child components when parent is detached', () => {
        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('one');

        app.cdr.detach();

        comp.value = 'two';
        tick(app);
        expect(getRenderedText(app)).toEqual('one');

        app.cdr.reattach();

        tick(app);
        expect(getRenderedText(app)).toEqual('two');
      });

      it('should detach OnPush components properly', () => {
        let onPushComp: OnPushComp;

        class OnPushComp {
          /** @Input() */
          // TODO(issue/24571): remove '!'.
          value !: string;

          constructor(public cdr: ChangeDetectorRef) {}

          static ngComponentDef = defineComponent({
            type: OnPushComp,
            selectors: [['on-push-comp']],
            factory: () => onPushComp = new OnPushComp(directiveInject(ChangeDetectorRef as any)),
            consts: 1,
            vars: 1,
            /** {{ value }} */
            template: (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Create) {
                text(0);
              }
              if (rf & RenderFlags.Update) {
                textBinding(0, bind(ctx.value));
              }
            },
            changeDetection: ChangeDetectionStrategy.OnPush,
            inputs: {value: 'value'}
          });
        }

        /** <on-push-comp [value]="value"></on-push-comp> */
        const OnPushApp = createComponent('on-push-app', function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'on-push-comp');
          }
          if (rf & RenderFlags.Update) {
            elementProperty(0, 'value', bind(ctx.value));
          }
        }, 1, 1, [OnPushComp]);

        const app = renderComponent(OnPushApp);
        app.value = 'one';
        tick(app);
        expect(getRenderedText(app)).toEqual('one');

        onPushComp !.cdr.detach();

        app.value = 'two';
        tick(app);
        expect(getRenderedText(app)).toEqual('one');

        onPushComp !.cdr.reattach();

        tick(app);
        expect(getRenderedText(app)).toEqual('two');
      });

    });

    describe('markForCheck()', () => {
      let comp: OnPushComp;

      class OnPushComp {
        value = 'one';

        doCheckCount = 0;

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() { this.doCheckCount++; }

        static ngComponentDef = defineComponent({
          type: OnPushComp,
          selectors: [['on-push-comp']],
          factory: () => comp = new OnPushComp(directiveInject(ChangeDetectorRef as any)),
          consts: 1,
          vars: 1,
          /** {{ value }} */
          template: (rf: RenderFlags, ctx: OnPushComp) => {
            if (rf & RenderFlags.Create) {
              text(0);
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, bind(ctx.value));
            }
          },
          changeDetection: ChangeDetectionStrategy.OnPush
        });
      }

      class OnPushParent {
        value = 'one';

        static ngComponentDef = defineComponent({
          type: OnPushParent,
          selectors: [['on-push-parent']],
          factory: () => new OnPushParent(),
          consts: 2,
          vars: 1,
          /**
           * {{ value }} -
           * <on-push-comp></on-push-comp>
           */
          template: (rf: RenderFlags, ctx: OnPushParent) => {
            if (rf & RenderFlags.Create) {
              text(0);
              element(1, 'on-push-comp');
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, interpolation1('', ctx.value, ' - '));
            }
          },
          directives: () => [OnPushComp],
          changeDetection: ChangeDetectionStrategy.OnPush
        });
      }

      it('should schedule check on OnPush components', () => {
        const parent = renderComponent(OnPushParent);
        expect(getRenderedText(parent)).toEqual('one - one');

        comp.value = 'two';
        tick(parent);
        expect(getRenderedText(parent)).toEqual('one - one');

        comp.cdr.markForCheck();
        requestAnimationFrame.flush();
        expect(getRenderedText(parent)).toEqual('one - two');
      });

      it('should only run change detection once with multiple calls to markForCheck', () => {
        renderComponent(OnPushParent);
        expect(comp.doCheckCount).toEqual(1);

        comp.cdr.markForCheck();
        comp.cdr.markForCheck();
        comp.cdr.markForCheck();
        comp.cdr.markForCheck();
        comp.cdr.markForCheck();
        requestAnimationFrame.flush();

        expect(comp.doCheckCount).toEqual(2);
      });

      it('should schedule check on ancestor OnPush components', () => {
        const parent = renderComponent(OnPushParent);
        expect(getRenderedText(parent)).toEqual('one - one');

        parent.value = 'two';
        tick(parent);
        expect(getRenderedText(parent)).toEqual('one - one');

        comp.cdr.markForCheck();
        requestAnimationFrame.flush();
        expect(getRenderedText(parent)).toEqual('two - one');

      });

      it('should schedule check on OnPush components in embedded views', () => {
        class EmbeddedViewParent {
          value = 'one';
          showing = true;

          static ngComponentDef = defineComponent({
            type: EmbeddedViewParent,
            selectors: [['embedded-view-parent']],
            factory: () => new EmbeddedViewParent(),
            consts: 2,
            vars: 1,
            /**
             * {{ value }} -
             * % if (ctx.showing) {
             *   <on-push-comp></on-push-comp>
             * % }
             */
            template: (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Create) {
                text(0);
                container(1);
              }
              if (rf & RenderFlags.Update) {
                textBinding(0, interpolation1('', ctx.value, ' - '));
                containerRefreshStart(1);
                {
                  if (ctx.showing) {
                    let rf0 = embeddedViewStart(0, 1, 0);
                    if (rf0 & RenderFlags.Create) {
                      element(0, 'on-push-comp');
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            },
            directives: () => [OnPushComp],
            changeDetection: ChangeDetectionStrategy.OnPush
          });
        }

        const parent = renderComponent(EmbeddedViewParent);
        expect(getRenderedText(parent)).toEqual('one - one');

        comp.value = 'two';
        tick(parent);
        expect(getRenderedText(parent)).toEqual('one - one');

        comp.cdr.markForCheck();
        requestAnimationFrame.flush();
        expect(getRenderedText(parent)).toEqual('one - two');

        parent.value = 'two';
        tick(parent);
        expect(getRenderedText(parent)).toEqual('one - two');

        comp.cdr.markForCheck();
        requestAnimationFrame.flush();
        expect(getRenderedText(parent)).toEqual('two - two');
      });

      // TODO(kara): add test for dynamic views once bug fix is in
    });

    describe('checkNoChanges', () => {
      let comp: NoChangesComp;

      class NoChangesComp {
        value = 1;
        doCheckCount = 0;
        contentCheckCount = 0;
        viewCheckCount = 0;

        ngDoCheck() { this.doCheckCount++; }

        ngAfterContentChecked() { this.contentCheckCount++; }

        ngAfterViewChecked() { this.viewCheckCount++; }

        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: NoChangesComp,
          selectors: [['no-changes-comp']],
          factory: () => comp = new NoChangesComp(directiveInject(ChangeDetectorRef as any)),
          consts: 1,
          vars: 1,
          template: (rf: RenderFlags, ctx: NoChangesComp) => {
            if (rf & RenderFlags.Create) {
              text(0);
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, bind(ctx.value));
            }
          }
        });
      }

      class AppComp {
        value = 1;

        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: AppComp,
          selectors: [['app-comp']],
          factory: () => new AppComp(directiveInject(ChangeDetectorRef as any)),
          consts: 2,
          vars: 1,
          /**
           * {{ value }} -
           * <no-changes-comp></no-changes-comp>
           */
          template: (rf: RenderFlags, ctx: AppComp) => {
            if (rf & RenderFlags.Create) {
              text(0);
              element(1, 'no-changes-comp');
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, interpolation1('', ctx.value, ' - '));
            }
          },
          directives: () => [NoChangesComp]
        });
      }

      it('should throw if bindings in current view have changed', () => {
        const comp = renderComponent(NoChangesComp, {hostFeatures: [LifecycleHooksFeature]});

        expect(() => comp.cdr.checkNoChanges()).not.toThrow();

        comp.value = 2;
        expect(() => comp.cdr.checkNoChanges())
            .toThrowError(
                /ExpressionChangedAfterItHasBeenCheckedError: .+ Previous value: '1'. Current value: '2'/gi);
      });

      it('should throw if interpolations in current view have changed', () => {
        const app = renderComponent(AppComp);

        expect(() => app.cdr.checkNoChanges()).not.toThrow();

        app.value = 2;
        expect(() => app.cdr.checkNoChanges())
            .toThrowError(
                /ExpressionChangedAfterItHasBeenCheckedError: .+ Previous value: '1'. Current value: '2'/gi);
      });

      it('should throw if bindings in children of current view have changed', () => {
        const app = renderComponent(AppComp);

        expect(() => app.cdr.checkNoChanges()).not.toThrow();

        comp.value = 2;
        expect(() => app.cdr.checkNoChanges())
            .toThrowError(
                /ExpressionChangedAfterItHasBeenCheckedError: .+ Previous value: '1'. Current value: '2'/gi);
      });

      it('should throw if bindings in embedded view have changed', () => {
        class EmbeddedViewApp {
          value = 1;
          showing = true;

          constructor(public cdr: ChangeDetectorRef) {}

          static ngComponentDef = defineComponent({
            type: EmbeddedViewApp,
            selectors: [['embedded-view-app']],
            factory: () => new EmbeddedViewApp(directiveInject(ChangeDetectorRef as any)),
            consts: 1,
            vars: 0,
            /**
             * % if (showing) {
             *  {{ value }}
             * %}
             */
            template: (rf: RenderFlags, ctx: EmbeddedViewApp) => {
              if (rf & RenderFlags.Create) {
                container(0);
              }
              if (rf & RenderFlags.Update) {
                containerRefreshStart(0);
                {
                  if (ctx.showing) {
                    let rf0 = embeddedViewStart(0, 1, 1);
                    if (rf0 & RenderFlags.Create) {
                      text(0);
                    }
                    if (rf0 & RenderFlags.Update) {
                      textBinding(0, bind(ctx.value));
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            }
          });
        }

        const app = renderComponent(EmbeddedViewApp);

        expect(() => app.cdr.checkNoChanges()).not.toThrow();

        app.value = 2;
        expect(() => app.cdr.checkNoChanges())
            .toThrowError(
                /ExpressionChangedAfterItHasBeenCheckedError: .+ Previous value: '1'. Current value: '2'/gi);
      });

      it('should NOT call lifecycle hooks', () => {
        const app = renderComponent(AppComp);
        expect(comp.doCheckCount).toEqual(1);
        expect(comp.contentCheckCount).toEqual(1);
        expect(comp.viewCheckCount).toEqual(1);

        comp.value = 2;
        expect(() => app.cdr.checkNoChanges()).toThrow();
        expect(comp.doCheckCount).toEqual(1);
        expect(comp.contentCheckCount).toEqual(1);
        expect(comp.viewCheckCount).toEqual(1);
      });

      it('should NOT throw if bindings in ancestors of current view have changed', () => {
        const app = renderComponent(AppComp);

        app.value = 2;
        expect(() => comp.cdr.checkNoChanges()).not.toThrow();
      });

    });

  });

  it('should call begin and end when the renderer factory implements them', () => {
    const log: string[] = [];

    const testRendererFactory: RendererFactory3 = {
      createRenderer: (hostElement: RElement | null, rendererType: RendererType2 | null):
                          Renderer3 => { return document; },
      begin: () => log.push('begin'),
      end: () => log.push('end'),
    };

    class MyComponent {
      get value(): string {
        log.push('detect changes');
        return 'works';
      }

      static ngComponentDef = defineComponent({
        type: MyComponent,
        selectors: [['my-comp']],
        factory: () => new MyComponent(),
        consts: 1,
        vars: 1,
        template: (rf: RenderFlags, ctx: MyComponent) => {
          if (rf & RenderFlags.Create) {
            text(0);
          }
          if (rf & RenderFlags.Update) {
            textBinding(0, bind(ctx.value));
          }
        }
      });
    }

    const myComp = renderComponent(MyComponent, {rendererFactory: testRendererFactory});
    expect(getRenderedText(myComp)).toEqual('works');
    expect(log).toEqual(['begin', 'detect changes', 'end']);
  });

});
