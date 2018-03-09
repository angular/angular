/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {withBody} from '@angular/core/testing';

import {ChangeDetectionStrategy, ChangeDetectorRef, DoCheck, EmbeddedViewRef, TemplateRef, ViewContainerRef} from '../../src/core';
import {getRenderedText, whenRendered} from '../../src/render3/component';
import {NgOnChangesFeature, PublicFeature, defineComponent, defineDirective, injectChangeDetectorRef, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, detectChanges, directiveRefresh, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, interpolation2, listener, markDirty, text, textBinding, tick} from '../../src/render3/instructions';

import {containerEl, renderComponent, requestAnimationFrame, toHtml} from './render_util';

describe('change detection', () => {

  describe('markDirty, detectChanges, whenRendered, getRenderedText', () => {
    class MyComponent implements DoCheck {
      value: string = 'works';
      doCheckCount = 0;
      ngDoCheck(): void { this.doCheckCount++; }

      static ngComponentDef = defineComponent({
        type: MyComponent,
        tag: 'my-comp',
        factory: () => new MyComponent(),
        template: (ctx: MyComponent, cm: boolean) => {
          if (cm) {
            elementStart(0, 'span');
            text(1);
            elementEnd();
          }
          textBinding(1, bind(ctx.value));
        }
      });
    }

    it('should mark a component dirty and schedule change detection', withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent);
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         markDirty(myComp);
         expect(getRenderedText(myComp)).toEqual('works');
         requestAnimationFrame.flush();
         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges on a component', withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent);
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         detectChanges(myComp);
         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges only once if markDirty is called multiple times',
       withBody('my-comp', () => {
         const myComp = renderComponent(MyComponent);
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
         const myComp = renderComponent(MyComponent);
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

    it('should check OnPush components in update mode when component events occur', () => {
      const myApp = renderComponent(MyApp);
      expect(getRenderedText(myApp)).toEqual('1 - Nancy');

      const button = containerEl.querySelector('button') !;
      button.click();
      requestAnimationFrame.flush();
      expect(getRenderedText(myApp)).toEqual('2 - Nancy');

      tick(myApp);
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

      tick(myButtonApp);
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
          tag: 'my-comp',
          factory: () => myComp = new MyComp(injectChangeDetectorRef()),
          /** {{ name }} */
          template: (ctx: MyComp, cm: boolean) => {
            if (cm) {
              text(0);
            }
            textBinding(0, bind(ctx.name));
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
          tag: 'parent-comp',
          factory: () => new ParentComp(injectChangeDetectorRef()),
          /**
           * {{ doCheckCount}} -
           * <my-comp></my-comp>
           */
          template: (ctx: ParentComp, cm: boolean) => {
            if (cm) {
              text(0);
              elementStart(1, MyComp);
              elementEnd();
            }
            textBinding(0, interpolation1('', ctx.doCheckCount, ' - '));
            MyComp.ngComponentDef.h(2, 1);
            directiveRefresh(2, 1);
          }
        });
      }

      class Dir {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngDirectiveDef =
            defineDirective({type: Dir, factory: () => dir = new Dir(injectChangeDetectorRef())});
      }


      it('should check the component view when called by component (even when OnPush && clean)',
         () => {
           const comp = renderComponent(MyComp);
           expect(getRenderedText(comp)).toEqual('Nancy');

           comp.name = 'Bess';  // as this is not an Input, the component stays clean
           comp.cdr.detectChanges();
           expect(getRenderedText(comp)).toEqual('Bess');
         });

      it('should NOT call component doCheck when called by a component', () => {
        const comp = renderComponent(MyComp);
        expect(comp.doCheckCount).toEqual(1);

        // NOTE: in current Angular, detectChanges does not itself trigger doCheck, but you
        // may see doCheck called in some cases bc of the extra CD run triggered by zone.js.
        // It's important not to call doCheck to allow calls to detectChanges in that hook.
        comp.cdr.detectChanges();
        expect(comp.doCheckCount).toEqual(1);
      });

      it('should NOT check the component parent when called by a child component', () => {
        const parentComp = renderComponent(ParentComp);
        expect(getRenderedText(parentComp)).toEqual('1 - Nancy');

        parentComp.doCheckCount = 100;
        myComp.cdr.detectChanges();
        expect(parentComp.doCheckCount).toEqual(100);
        expect(getRenderedText(parentComp)).toEqual('1 - Nancy');
      });

      it('should check component children when called by component if dirty or check-always',
         () => {
           const parentComp = renderComponent(ParentComp);
           expect(parentComp.doCheckCount).toEqual(1);

           myComp.name = 'Bess';
           parentComp.cdr.detectChanges();
           expect(parentComp.doCheckCount).toEqual(1);
           expect(myComp.doCheckCount).toEqual(2);
           // OnPush child is not dirty, so its change isn't rendered.
           expect(getRenderedText(parentComp)).toEqual('1 - Nancy');
         });

      it('should not group detectChanges calls (call every time)', () => {
        const parentComp = renderComponent(ParentComp);
        expect(myComp.doCheckCount).toEqual(1);

        parentComp.cdr.detectChanges();
        parentComp.cdr.detectChanges();
        expect(myComp.doCheckCount).toEqual(3);
      });

      it('should check component view when called by directive on component node', () => {
        class MyApp {
          static ngComponentDef = defineComponent({
            type: MyApp,
            tag: 'my-app',
            factory: () => new MyApp(),
            /** <my-comp dir></my-comp> */
            template: (ctx: MyApp, cm: boolean) => {
              if (cm) {
                elementStart(0, MyComp, ['dir', ''], [Dir]);
                elementEnd();
              }
              MyComp.ngComponentDef.h(1, 0);
              Dir.ngDirectiveDef.h(2, 0);
              directiveRefresh(1, 0);
              directiveRefresh(2, 0);
            }
          });
        }

        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('Nancy');

        myComp.name = 'George';
        dir !.cdr.detectChanges();
        expect(getRenderedText(app)).toEqual('George');
      });

      it('should check host component when called by directive on element node', () => {
        class MyApp {
          name = 'Frank';

          static ngComponentDef = defineComponent({
            type: MyApp,
            tag: 'my-app',
            factory: () => new MyApp(),
            /**
             * {{ name }}
             * <div dir></div>
             */
            template: (ctx: MyApp, cm: boolean) => {
              if (cm) {
                text(0);
                elementStart(1, 'div', ['dir', ''], [Dir]);
                elementEnd();
              }
              textBinding(1, bind(ctx.name));
              Dir.ngDirectiveDef.h(2, 1);
              directiveRefresh(2, 1);
            }
          });
        }

        const app = renderComponent(MyApp);
        expect(getRenderedText(app)).toEqual('Frank');

        app.name = 'Joe';
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
            tag: 'my-app',
            factory: () => new MyApp(injectChangeDetectorRef()),
            /**
             * {{ name}}
             * % if (showing) {
           *   <div dir></div>
           * % }
             */
            template: function(ctx: MyApp, cm: boolean) {
              if (cm) {
                text(0);
                container(1);
              }
              textBinding(0, bind(ctx.name));
              containerRefreshStart(1);
              {
                if (ctx.showing) {
                  if (embeddedViewStart(0)) {
                    elementStart(0, 'div', ['dir', ''], [Dir]);
                    elementEnd();
                  }
                  Dir.ngDirectiveDef.h(1, 0);
                  directiveRefresh(1, 0);
                }
                embeddedViewEnd();
              }
              containerRefreshEnd();
            }
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
            tag: 'detect-changes-comp',
            factory: () => new DetectChangesComp(injectChangeDetectorRef()),
            /** {{ value }} */
            template: (ctx: DetectChangesComp, cm: boolean) => {
              if (cm) {
                text(0);
              }
              textBinding(0, bind(ctx.value));
            }
          });
        }

        const comp = renderComponent(DetectChangesComp);
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
            tag: 'detect-changes-comp',
            factory: () => new DetectChangesComp(injectChangeDetectorRef()),
            /** {{ doCheckCount }} */
            template: (ctx: DetectChangesComp, cm: boolean) => {
              if (cm) {
                text(0);
              }
              textBinding(0, bind(ctx.doCheckCount));
            }
          });
        }

        const comp = renderComponent(DetectChangesComp);
        expect(getRenderedText(comp)).toEqual('1');
      });

    });

    describe('attach/detach', () => {
      let comp: DetachedComp;

      class MyApp {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: MyApp,
          tag: 'my-app',
          factory: () => new MyApp(injectChangeDetectorRef()),
          /** <detached-comp></detached-comp> */
          template: (ctx: MyApp, cm: boolean) => {
            if (cm) {
              elementStart(0, DetachedComp);
              elementEnd();
            }
            DetachedComp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
          }
        });
      }

      class DetachedComp {
        value = 'one';
        doCheckCount = 0;

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() { this.doCheckCount++; }

        static ngComponentDef = defineComponent({
          type: DetachedComp,
          tag: 'detached-comp',
          factory: () => comp = new DetachedComp(injectChangeDetectorRef()),
          /** {{ value }} */
          template: (ctx: DetachedComp, cm: boolean) => {
            if (cm) {
              text(0);
            }
            textBinding(0, bind(ctx.value));
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
          value: string;

          constructor(public cdr: ChangeDetectorRef) {}

          static ngComponentDef = defineComponent({
            type: OnPushComp,
            tag: 'on-push-comp',
            factory: () => onPushComp = new OnPushComp(injectChangeDetectorRef()),
            /** {{ value }} */
            template: (ctx: OnPushComp, cm: boolean) => {
              if (cm) {
                text(0);
              }
              textBinding(0, bind(ctx.value));
            },
            changeDetection: ChangeDetectionStrategy.OnPush,
            inputs: {value: 'value'}
          });
        }

        class OnPushApp {
          value = 'one';

          static ngComponentDef = defineComponent({
            type: OnPushApp,
            tag: 'on-push-app',
            factory: () => new OnPushApp(),
            /** <on-push-comp [value]="value"></on-push-comp> */
            template: (ctx: OnPushApp, cm: boolean) => {
              if (cm) {
                elementStart(0, OnPushComp);
                elementEnd();
              }
              elementProperty(0, 'value', bind(ctx.value));
              OnPushComp.ngComponentDef.h(1, 0);
              directiveRefresh(1, 0);
            }
          });
        }

        const app = renderComponent(OnPushApp);
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

  });

});
