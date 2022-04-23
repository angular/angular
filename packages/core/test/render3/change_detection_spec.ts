/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';
import {withBody} from '@angular/private/testing';

import {ChangeDetectionStrategy, DoCheck, OnInit} from '../../src/core';
import {whenRendered} from '../../src/render3/component';
import {AttributeMarker, getRenderedText, LifecycleHooksFeature, ɵɵadvance, ɵɵdefineComponent, ɵɵgetCurrentView, ɵɵproperty, ɵɵtextInterpolate1, ɵɵtextInterpolate2} from '../../src/render3/index';
import {detectChanges, markDirty, tick, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵlistener, ɵɵtemplate, ɵɵtext, ɵɵtextInterpolate} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {Renderer3, RendererFactory3} from '../../src/render3/interfaces/renderer';
import {FLAGS, LViewFlags} from '../../src/render3/interfaces/view';

import {containerEl, createComponent, renderComponent, requestAnimationFrame} from './render_util';

describe('change detection', () => {
  describe('markDirty, detectChanges, whenRendered, getRenderedText', () => {
    let mycompOninit: MyComponentWithOnInit;
    class MyComponent implements DoCheck {
      value: string = 'works';
      doCheckCount = 0;
      ngDoCheck(): void {
        this.doCheckCount++;
      }

      static ɵfac = () => new MyComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: MyComponent,
        selectors: [['my-comp']],
        decls: 2,
        vars: 1,
        template:
            (rf: RenderFlags, ctx: MyComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'span');
                ɵɵtext(1);
                ɵɵelementEnd();
              }
              if (rf & RenderFlags.Update) {
                ɵɵadvance(1);
                ɵɵtextInterpolate(ctx.value);
              }
            }
      });
    }

    class MyComponentWithOnInit implements OnInit, DoCheck {
      value: string = 'works';
      doCheckCount = 0;

      ngOnInit() {
        markDirty(this);
      }

      ngDoCheck(): void {
        this.doCheckCount++;
      }

      click() {
        this.value = 'click works';
        markDirty(this);
      }

      static ɵfac = () => mycompOninit = new MyComponentWithOnInit();
      static ɵcmp = ɵɵdefineComponent({
        type: MyComponentWithOnInit,
        selectors: [['my-comp-oninit']],
        decls: 2,
        vars: 1,
        template:
            (rf: RenderFlags, ctx: MyComponentWithOnInit) => {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'span');
                ɵɵtext(1);
                ɵɵelementEnd();
              }
              if (rf & RenderFlags.Update) {
                ɵɵadvance(1);
                ɵɵtextInterpolate(ctx.value);
              }
            }
      });
    }

    class MyParentComponent implements OnInit {
      show = false;
      value = 'parent';
      mycomp: any = undefined;

      ngOnInit() {}

      click() {
        this.show = true;
        markDirty(this);
      }

      static ɵfac = () => new MyParentComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: MyParentComponent,
        selectors: [['my-parent-comp']],
        decls: 2,
        vars: 1,
        dependencies: [NgIf, MyComponentWithOnInit],
        consts: [[AttributeMarker.Template, 'ngIf']],
        template:
            (rf: RenderFlags, ctx: MyParentComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0, ' -->\n');
                ɵɵtemplate(1, (rf, ctx) => {
                  if (rf & RenderFlags.Create) {
                    ɵɵelementStart(0, 'div');
                    ɵɵelement(1, 'my-comp-oninit');
                    ɵɵelementEnd();
                  }
                }, 2, 0, 'div', 0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵadvance(1);
                ɵɵproperty('ngIf', ctx.show);
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

    it('should detectChanges after markDirty is called multiple times within ngOnInit',
       withBody('my-comp-oninit', () => {
         const myParentComp =
             renderComponent(MyParentComponent, {hostFeatures: [LifecycleHooksFeature]});
         expect(myParentComp.show).toBe(false);
         myParentComp.click();
         requestAnimationFrame.flush();
         expect(myParentComp.show).toBe(true);
         const myComp = mycompOninit;
         expect(getRenderedText(myComp)).toEqual('works');
         expect(myComp.doCheckCount).toBe(1);
         myComp.click();
         expect(getRenderedText(myComp)).toEqual('works');
         requestAnimationFrame.flush();
         expect(getRenderedText(myComp)).toEqual('click works');
         expect(myComp.doCheckCount).toBe(2);
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

    it('should notify whenRendered', withBody('my-comp', async () => {
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

      ngDoCheck(): void {
        this.doCheckCount++;
      }

      onClick() {}

      static ɵfac = () => comp = new MyComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: MyComponent,
        selectors: [['my-comp']],
        decls: 2,
        vars: 2,
        /**
         * {{ doCheckCount }} - {{ name }}
         * <button (click)="onClick()"></button>
         */
        template:
            (rf: RenderFlags, ctx: MyComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0);
                ɵɵelementStart(1, 'button');
                {
                  ɵɵlistener('click', () => {
                    ctx.onClick();
                  });
                }
                ɵɵelementEnd();
              }
              if (rf & RenderFlags.Update) {
                ɵɵtextInterpolate2('', ctx.doCheckCount, ' - ', ctx.name, '');
              }
            },
        changeDetection: ChangeDetectionStrategy.OnPush,
        inputs: {name: 'name'}
      });
    }

    describe('Manual mode', () => {
      class ManualComponent implements DoCheck {
        /* @Input() */
        name = 'Nancy';
        doCheckCount = 0;

        ngDoCheck(): void {
          this.doCheckCount++;
        }

        onClick() {}

        static ɵfac = () => comp = new ManualComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: ManualComponent,
          selectors: [['manual-comp']],
          decls: 2,
          vars: 2,
          /**
           * {{ doCheckCount }} - {{ name }}
           * <button (click)="onClick()"></button>
           */
          template:
              (rf: RenderFlags, ctx: ManualComponent) => {
                if (rf & RenderFlags.Create) {
                  // This is temporarily the only way to turn on manual change detection
                  // because public API has not yet been added.
                  const view = ɵɵgetCurrentView() as any;
                  view[FLAGS] |= LViewFlags.ManualOnPush;

                  ɵɵtext(0);
                  ɵɵelementStart(1, 'button');
                  {
                    ɵɵlistener('click', () => {
                      ctx.onClick();
                    });
                  }
                  ɵɵelementEnd();
                }
                if (rf & RenderFlags.Update) {
                  ɵɵtextInterpolate2('', ctx.doCheckCount, ' - ', ctx.name, '');
                }
              },
          changeDetection: ChangeDetectionStrategy.OnPush,
          inputs: {name: 'name'}
        });
      }

      class ManualApp {
        name: string = 'Nancy';

        static ɵfac = () => new ManualApp();
        static ɵcmp = ɵɵdefineComponent({
          type: ManualApp,
          selectors: [['manual-app']],
          decls: 1,
          vars: 1,
          /** <manual-comp [name]="name"></manual-comp> */
          template:
              (rf: RenderFlags, ctx: ManualApp) => {
                if (rf & RenderFlags.Create) {
                  ɵɵelement(0, 'manual-comp');
                }
                if (rf & RenderFlags.Update) {
                  ɵɵproperty('name', ctx.name);
                }
              },
          dependencies: () => [ManualComponent]
        });
      }


      it('should not check OnPush components in update mode when component events occur, unless marked dirty',
         () => {
           const myApp = renderComponent(ManualApp);
           expect(comp.doCheckCount).toEqual(1);
           expect(getRenderedText(myApp)).toEqual('1 - Nancy');

           const button = containerEl.querySelector('button')!;
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

      it('should not check parent OnPush components in update mode when child events occur, unless marked dirty',
         () => {
           let parent: ButtonParent;

           class ButtonParent implements DoCheck {
             doCheckCount = 0;
             ngDoCheck(): void {
               this.doCheckCount++;
             }

             static ɵfac = () => parent = new ButtonParent();
             static ɵcmp = ɵɵdefineComponent({
               type: ButtonParent,
               selectors: [['button-parent']],
               decls: 2,
               vars: 1,
               /** {{ doCheckCount }} - <manual-comp></manual-comp> */
               template:
                   (rf: RenderFlags, ctx: ButtonParent) => {
                     if (rf & RenderFlags.Create) {
                       ɵɵtext(0);
                       ɵɵelement(1, 'manual-comp');
                     }
                     if (rf & RenderFlags.Update) {
                       ɵɵtextInterpolate1('', ctx.doCheckCount, ' - ');
                     }
                   },
               dependencies: () => [ManualComponent],
               changeDetection: ChangeDetectionStrategy.OnPush
             });
           }

           const MyButtonApp = createComponent('my-button-app', function(rf: RenderFlags) {
             if (rf & RenderFlags.Create) {
               ɵɵelement(0, 'button-parent');
             }
           }, 1, 0, [ButtonParent]);

           const myButtonApp = renderComponent(MyButtonApp);
           expect(parent!.doCheckCount).toEqual(1);
           expect(comp!.doCheckCount).toEqual(1);
           expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

           tick(myButtonApp);
           expect(parent!.doCheckCount).toEqual(2);
           // parent isn't checked, so child doCheck won't run
           expect(comp!.doCheckCount).toEqual(1);
           expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

           const button = containerEl.querySelector('button');
           button!.click();
           requestAnimationFrame.flush();
           // No ticks should have been scheduled.
           expect(parent!.doCheckCount).toEqual(2);
           expect(comp!.doCheckCount).toEqual(1);

           tick(myButtonApp);
           expect(parent!.doCheckCount).toEqual(3);
           // parent isn't checked, so child doCheck won't run
           expect(comp!.doCheckCount).toEqual(1);
           expect(getRenderedText(myButtonApp)).toEqual('1 - 1 - Nancy');

           markDirty(comp);
           requestAnimationFrame.flush();
           // Now that markDirty has been manually called, both views should be dirty and a tick
           // should be scheduled to check the view.
           expect(parent!.doCheckCount).toEqual(4);
           expect(comp!.doCheckCount).toEqual(2);
           expect(getRenderedText(myButtonApp)).toEqual('4 - 2 - Nancy');
         });
    });
  });

  it('should call begin and end when the renderer factory implements them', () => {
    const log: string[] = [];

    const testRendererFactory: RendererFactory3 = {
      createRenderer: (): Renderer3 => {
        return document;
      },
      begin: () => log.push('begin'),
      end: () => log.push('end'),
    };

    class MyComponent {
      get value(): string {
        log.push('detect changes');
        return 'works';
      }

      static ɵfac = () => new MyComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: MyComponent,
        selectors: [['my-comp']],
        decls: 1,
        vars: 1,
        template:
            (rf: RenderFlags, ctx: MyComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵtextInterpolate(ctx.value);
              }
            }
      });
    }

    const myComp = renderComponent(MyComponent, {rendererFactory: testRendererFactory});
    expect(getRenderedText(myComp)).toEqual('works');
    expect(log).toEqual(['begin', 'detect changes', 'end']);
  });
});
