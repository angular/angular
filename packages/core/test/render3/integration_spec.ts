/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';
import {RElement} from '@angular/core/src/render3/interfaces/renderer_dom';
import {ngDevModeResetPerfCounters} from '@angular/core/src/util/ng_dev_mode';

import {RendererType2} from '../../src/render/api_flags';
import {getLContext, readPatchedData} from '../../src/render3/context_discovery';
import {AttributeMarker, ɵɵadvance, ɵɵattribute, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵhostProperty, ɵɵproperty} from '../../src/render3/index';
import {ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵprojection, ɵɵprojectionDef, ɵɵtemplate, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {domRendererFactory3, Renderer3, RendererFactory3} from '../../src/render3/interfaces/renderer';
import {CONTEXT, HEADER_OFFSET, ID, LView} from '../../src/render3/interfaces/view';
import {ɵɵsanitizeUrl} from '../../src/sanitization/sanitization';
import {Sanitizer} from '../../src/sanitization/sanitizer';
import {SecurityContext} from '../../src/sanitization/security';

import {ComponentFixture, MockRendererFactory, renderToHtml} from './render_util';

describe('render3 integration test', () => {
  describe('render', () => {
    describe('text bindings', () => {
      it('should support creation-time values in text nodes', () => {
        ngDevModeResetPerfCounters();
        function Template(rf: RenderFlags, value: string) {
          if (rf & RenderFlags.Create) {
            ɵɵtext(0, value);
          }
        }
        expect(renderToHtml(Template, 'once', 1, 1)).toEqual('once');
        expect(renderToHtml(Template, 'twice', 1, 1)).toEqual('once');
        expect(ngDevMode).toEqual(jasmine.objectContaining({
          firstCreatePass: 0,
          tNode: 2,
          tView: 2,  // 1 for root view, 1 for template
          rendererSetText: 1,
        }));
      });
    });
  });
});

describe('component styles', () => {
  it('should pass in the component styles directly into the underlying renderer', () => {
    class StyledComp {
      static ɵfac = () => new StyledComp();
      static ɵcmp = ɵɵdefineComponent({
        type: StyledComp,
        styles: ['div { color: red; }'],
        decls: 1,
        vars: 0,
        encapsulation: 100,
        selectors: [['foo']],
        template:
            (rf: RenderFlags, ctx: StyledComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div');
              }
            }
      });
    }
    const rendererFactory = new ProxyRenderer3Factory();
    new ComponentFixture(StyledComp, {rendererFactory});
    expect(rendererFactory.lastCapturedType!.styles).toEqual(['div { color: red; }']);
    expect(rendererFactory.lastCapturedType!.encapsulation).toEqual(100);
  });
});

describe('component animations', () => {
  it('should pass in the component styles directly into the underlying renderer', () => {
    const animA = {name: 'a'};
    const animB = {name: 'b'};

    class AnimComp {
      static ɵfac = () => new AnimComp();
      static ɵcmp = ɵɵdefineComponent({
        type: AnimComp,
        decls: 0,
        vars: 0,
        data: {
          animation:
              [
                animA,
                animB,
              ],
        },
        selectors: [['foo']],
        template: (rf: RenderFlags, ctx: AnimComp) => {}
      });
    }
    const rendererFactory = new ProxyRenderer3Factory();
    new ComponentFixture(AnimComp, {rendererFactory});

    const capturedAnimations = rendererFactory.lastCapturedType!.data!['animation'];
    expect(Array.isArray(capturedAnimations)).toBeTruthy();
    expect(capturedAnimations.length).toEqual(2);
    expect(capturedAnimations).toContain(animA);
    expect(capturedAnimations).toContain(animB);
  });

  it('should include animations in the renderType data array even if the array is empty', () => {
    class AnimComp {
      static ɵfac = () => new AnimComp();
      static ɵcmp = ɵɵdefineComponent({
        type: AnimComp,
        decls: 0,
        vars: 0,
        data: {
          animation: [],
        },
        selectors: [['foo']],
        template: (rf: RenderFlags, ctx: AnimComp) => {}
      });
    }
    const rendererFactory = new ProxyRenderer3Factory();
    new ComponentFixture(AnimComp, {rendererFactory});
    const data = rendererFactory.lastCapturedType!.data;
    expect(data.animation).toEqual([]);
  });

  it('should allow [@trigger] bindings to be picked up by the underlying renderer', () => {
    class AnimComp {
      static ɵfac = () => new AnimComp();
      static ɵcmp = ɵɵdefineComponent({
        type: AnimComp,
        decls: 1,
        vars: 1,
        selectors: [['foo']],
        consts: [[AttributeMarker.Bindings, '@fooAnimation']],
        template:
            (rf: RenderFlags, ctx: AnimComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', 0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵattribute('@fooAnimation', ctx.animationValue);
              }
            }
      });

      animationValue = '123';
    }

    const rendererFactory = new MockRendererFactory(['setAttribute']);
    const fixture = new ComponentFixture(AnimComp, {rendererFactory});

    const renderer = rendererFactory.lastRenderer!;
    fixture.component.animationValue = '456';
    fixture.update();

    const spy = renderer.spies['setAttribute'];
    const [elm, attr, value] = spy.calls.mostRecent().args;

    expect(attr).toEqual('@fooAnimation');
    expect(value).toEqual('456');
  });

  it('should allow creation-level [@trigger] properties to be picked up by the underlying renderer',
     () => {
       class AnimComp {
         static ɵfac = () => new AnimComp();
         static ɵcmp = ɵɵdefineComponent({
           type: AnimComp,
           decls: 1,
           vars: 1,
           selectors: [['foo']],
           consts: [['@fooAnimation', '']],
           template:
               (rf: RenderFlags, ctx: AnimComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'div', 0);
                 }
               }
         });
       }

       const rendererFactory = new MockRendererFactory(['setProperty']);
       const fixture = new ComponentFixture(AnimComp, {rendererFactory});

       const renderer = rendererFactory.lastRenderer!;
       fixture.update();

       const spy = renderer.spies['setProperty'];
       const [elm, attr, value] = spy.calls.mostRecent().args;
       expect(attr).toEqual('@fooAnimation');
     });

  // TODO(benlesh): this test does not seem to be testing anything we could actually generate with
  // these instructions. ɵɵbind should be present in the ɵɵelementProperty call in the hostBindings,
  // however adding that causes an error because the slot has not been allocated. There is a
  // directive called `comp-with-anim`, that seems to want to be a component, but is defined as a
  // directive that is looking for a property `@fooAnim` to update.

  //   it('should allow host binding animations to be picked up and rendered', () => {
  //     class ChildCompWithAnim {
  //       static ɵfac = () => new ChildCompWithAnim();
  //       static ɵdir = ɵɵdefineDirective({
  //         type: ChildCompWithAnim,
  //         selectors: [['child-comp-with-anim']],
  //         hostBindings: function(rf: RenderFlags, ctx: any, elementIndex: number): void {
  //           if (rf & RenderFlags.Update) {
  //             ɵɵelementProperty(0, '@fooAnim', ctx.exp);
  //           }
  //         },
  //       });

  //       exp = 'go';
  //     }

  //     class ParentComp {
  //       static ɵfac = () => new ParentComp();
  //       static ɵcmp = ɵɵdefineComponent({
  //         type: ParentComp,
  //         decls: 1,
  //         vars: 1,
  //         selectors: [['foo']],
  //         template: (rf: RenderFlags, ctx: ParentComp) => {
  //           if (rf & RenderFlags.Create) {
  //             ɵɵelement(0, 'child-comp-with-anim');
  //           }
  //         },
  //         dependencies: [ChildCompWithAnim]
  //       });
  //     }

  //     const rendererFactory = new MockRendererFactory(['setProperty']);
  //     const fixture = new ComponentFixture(ParentComp, {rendererFactory});

  //     const renderer = rendererFactory.lastRenderer !;
  //     fixture.update();

  //     const spy = renderer.spies['setProperty'];
  //     const [elm, attr, value] = spy.calls.mostRecent().args;
  //     expect(attr).toEqual('@fooAnim');
  //   });
});

describe('element discovery', () => {
  it('should only monkey-patch immediate child nodes in a component', () => {
    class StructuredComp {
      static ɵfac = () => new StructuredComp();
      static ɵcmp = ɵɵdefineComponent({
        type: StructuredComp,
        selectors: [['structured-comp']],
        decls: 2,
        vars: 0,
        template:
            (rf: RenderFlags, ctx: StructuredComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'div');
                ɵɵelementStart(1, 'p');
                ɵɵelementEnd();
                ɵɵelementEnd();
              }
              if (rf & RenderFlags.Update) {
              }
            }
      });
    }

    const fixture = new ComponentFixture(StructuredComp);
    fixture.update();

    const host = fixture.hostElement;
    const parent = host.querySelector('div') as any;
    const child = host.querySelector('p') as any;

    expect(readPatchedData(parent)).toBeTruthy();
    expect(readPatchedData(child)).toBeFalsy();
  });

  it('should only monkey-patch immediate child nodes in a sub component', () => {
    class ChildComp {
      static ɵfac = () => new ChildComp();
      static ɵcmp = ɵɵdefineComponent({
        type: ChildComp,
        selectors: [['child-comp']],
        decls: 3,
        vars: 0,
        template:
            (rf: RenderFlags, ctx: ChildComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div');
                ɵɵelement(1, 'div');
                ɵɵelement(2, 'div');
              }
            }
      });
    }

    class ParentComp {
      static ɵfac = () => new ParentComp();
      static ɵcmp = ɵɵdefineComponent({
        type: ParentComp,
        selectors: [['parent-comp']],
        dependencies: [ChildComp],
        decls: 2,
        vars: 0,
        template:
            (rf: RenderFlags, ctx: ParentComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'section');
                ɵɵelementStart(1, 'child-comp');
                ɵɵelementEnd();
                ɵɵelementEnd();
              }
            }
      });
    }

    const fixture = new ComponentFixture(ParentComp);
    fixture.update();

    const host = fixture.hostElement;
    const child = host.querySelector('child-comp') as any;
    expect(readPatchedData(child)).toBeTruthy();

    const [kid1, kid2, kid3] = Array.from(host.querySelectorAll('child-comp > *'));
    expect(readPatchedData(kid1)).toBeTruthy();
    expect(readPatchedData(kid2)).toBeTruthy();
    expect(readPatchedData(kid3)).toBeTruthy();
  });

  it('should only monkey-patch immediate child nodes in an embedded template container', () => {
    class StructuredComp {
      static ɵfac = () => new StructuredComp();
      static ɵcmp = ɵɵdefineComponent({
        type: StructuredComp,
        selectors: [['structured-comp']],
        dependencies: [NgIf],
        decls: 2,
        vars: 1,
        consts: [['ngIf', '']],
        template:
            (rf: RenderFlags, ctx: StructuredComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelementStart(0, 'section');
                ɵɵtemplate(1, (rf, ctx) => {
                  if (rf & RenderFlags.Create) {
                    ɵɵelementStart(0, 'div');
                    ɵɵelement(1, 'p');
                    ɵɵelementEnd();
                    ɵɵelement(2, 'div');
                  }
                }, 3, 0, 'ng-template', 0);
                ɵɵelementEnd();
              }
              if (rf & RenderFlags.Update) {
                ɵɵadvance(1);
                ɵɵproperty('ngIf', true);
              }
            }
      });
    }

    const fixture = new ComponentFixture(StructuredComp);
    fixture.update();

    const host = fixture.hostElement;
    const [section, div1, p, div2] = Array.from(host.querySelectorAll('section, div, p'));

    expect(section.nodeName.toLowerCase()).toBe('section');
    expect(readPatchedData(section)).toBeTruthy();

    expect(div1.nodeName.toLowerCase()).toBe('div');
    expect(readPatchedData(div1)).toBeTruthy();

    expect(p.nodeName.toLowerCase()).toBe('p');
    expect(readPatchedData(p)).toBeFalsy();

    expect(div2.nodeName.toLowerCase()).toBe('div');
    expect(readPatchedData(div2)).toBeTruthy();
  });

  it('should return a context object from a given dom node', () => {
    class StructuredComp {
      static ɵfac = () => new StructuredComp();
      static ɵcmp = ɵɵdefineComponent({
        type: StructuredComp,
        selectors: [['structured-comp']],
        dependencies: [NgIf],
        decls: 2,
        vars: 0,
        template:
            (rf: RenderFlags, ctx: StructuredComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'section');
                ɵɵelement(1, 'div');
              }
            }
      });
    }

    const fixture = new ComponentFixture(StructuredComp);
    fixture.update();

    const section = fixture.hostElement.querySelector('section')!;
    const sectionContext = getLContext(section)!;
    expect(sectionContext.nodeIndex).toEqual(HEADER_OFFSET);
    expect(sectionContext.lView!.length).toBeGreaterThan(HEADER_OFFSET);
    expect(sectionContext.native).toBe(section);

    const div = fixture.hostElement.querySelector('div')!;
    const divContext = getLContext(div)!;
    expect(divContext.nodeIndex).toEqual(HEADER_OFFSET + 1);
    expect(divContext.lView!.length).toBeGreaterThan(HEADER_OFFSET);
    expect(divContext.native).toBe(div);

    expect(divContext.lView).toBe(sectionContext.lView);
  });

  it('should cache the element context on a element was pre-emptively monkey-patched', () => {
    class StructuredComp {
      static ɵfac = () => new StructuredComp();
      static ɵcmp = ɵɵdefineComponent({
        type: StructuredComp,
        selectors: [['structured-comp']],
        decls: 1,
        vars: 0,
        template:
            (rf: RenderFlags, ctx: StructuredComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'section');
              }
            }
      });
    }

    const fixture = new ComponentFixture(StructuredComp);
    fixture.update();

    const section = fixture.hostElement.querySelector('section')! as any;
    const result1 = readPatchedData(section);
    expect(Array.isArray(result1)).toBeTruthy();

    const context = getLContext(section)!;
    const result2 = readPatchedData(section) as any;
    expect(Array.isArray(result2)).toBeFalsy();

    expect(result2).toBe(context);
    expect(result2.lView).toBe(result1);
  });

  it('should cache the element context on an intermediate element that isn\'t pre-emptively monkey-patched',
     () => {
       class StructuredComp {
         static ɵfac = () => new StructuredComp();
         static ɵcmp = ɵɵdefineComponent({
           type: StructuredComp,
           selectors: [['structured-comp']],
           decls: 2,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: StructuredComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelementStart(0, 'section');
                   ɵɵelement(1, 'p');
                   ɵɵelementEnd();
                 }
               }
         });
       }

       const fixture = new ComponentFixture(StructuredComp);
       fixture.update();

       const section = fixture.hostElement.querySelector('section')! as any;
       expect(readPatchedData(section)).toBeTruthy();

       const p = fixture.hostElement.querySelector('p')! as any;
       expect(readPatchedData(p)).toBeFalsy();

       const pContext = getLContext(p)!;
       expect(pContext.native).toBe(p);
       expect(readPatchedData(p)).toBe(pContext);
     });

  it('should be able to pull in element context data even if the element is decorated using styling',
     () => {
       class StructuredComp {
         static ɵfac = () => new StructuredComp();
         static ɵcmp = ɵɵdefineComponent({
           type: StructuredComp,
           selectors: [['structured-comp']],
           decls: 1,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: StructuredComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'section');
                 }
               }
         });
       }

       const fixture = new ComponentFixture(StructuredComp);
       fixture.update();

       const section = fixture.hostElement.querySelector('section')! as any;
       const result1 = readPatchedData(section) as any;
       expect(Array.isArray(result1)).toBeTruthy();

       const elementResult = result1[HEADER_OFFSET];  // first element
       expect(elementResult).toBe(section);

       const context = getLContext(section)!;
       const result2 = readPatchedData(section);
       expect(Array.isArray(result2)).toBeFalsy();

       expect(context.native).toBe(section);
     });

  it('should monkey-patch immediate child nodes in a content-projected region with a reference to the parent component',
     () => {
       /*
         <!-- DOM view -->
         <section>
           <projection-comp>
             welcome
             <header>
               <h1>
                 <p>this content is projected</p>
                 this content is projected also
               </h1>
             </header>
           </projection-comp>
         </section>
       */
       class ProjectorComp {
         static ɵfac = () => new ProjectorComp();
         static ɵcmp = ɵɵdefineComponent({
           type: ProjectorComp,
           selectors: [['projector-comp']],
           decls: 4,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: ProjectorComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵprojectionDef();
                   ɵɵtext(0, 'welcome');
                   ɵɵelementStart(1, 'header');
                   ɵɵelementStart(2, 'h1');
                   ɵɵprojection(3);
                   ɵɵelementEnd();
                   ɵɵelementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                 }
               }
         });
       }

       class ParentComp {
         static ɵfac = () => new ParentComp();
         static ɵcmp = ɵɵdefineComponent({
           type: ParentComp,
           selectors: [['parent-comp']],
           dependencies: [ProjectorComp],
           decls: 5,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: ParentComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelementStart(0, 'section');
                   ɵɵelementStart(1, 'projector-comp');
                   ɵɵelementStart(2, 'p');
                   ɵɵtext(3, 'this content is projected');
                   ɵɵelementEnd();
                   ɵɵtext(4, 'this content is projected also');
                   ɵɵelementEnd();
                   ɵɵelementEnd();
                 }
               }
         });
       }

       const fixture = new ComponentFixture(ParentComp);
       fixture.update();

       const host = fixture.hostElement;
       const textNode = host.firstChild as any;
       const section = host.querySelector('section')! as any;
       const projectorComp = host.querySelector('projector-comp')! as any;
       const header = host.querySelector('header')! as any;
       const h1 = host.querySelector('h1')! as any;
       const p = host.querySelector('p')! as any;
       const pText = p.firstChild as any;
       const projectedTextNode = p.nextSibling;

       expect(projectorComp.children).toContain(header);
       expect(h1.children).toContain(p);

       expect(readPatchedData(textNode)).toBeTruthy();
       expect(readPatchedData(section)).toBeTruthy();
       expect(readPatchedData(projectorComp)).toBeTruthy();
       expect(readPatchedData(header)).toBeTruthy();
       expect(readPatchedData(h1)).toBeFalsy();
       expect(readPatchedData(p)).toBeTruthy();
       expect(readPatchedData(pText)).toBeFalsy();
       expect(readPatchedData(projectedTextNode)).toBeTruthy();

       const parentContext = getLContext(section)!;
       const shadowContext = getLContext(header)!;
       const projectedContext = getLContext(p)!;

       const parentComponentData = parentContext.lView;
       const shadowComponentData = shadowContext.lView;
       const projectedComponentData = projectedContext.lView;

       expect(projectedComponentData).toBe(parentComponentData);
       expect(shadowComponentData).not.toBe(parentComponentData);
     });

  it('should return `null` when an element context is retrieved that isn\'t situated in Angular',
     () => {
       const elm1 = document.createElement('div');
       const context1 = getLContext(elm1);
       expect(context1).toBeFalsy();

       const elm2 = document.createElement('div');
       document.body.appendChild(elm2);
       const context2 = getLContext(elm2);
       expect(context2).toBeFalsy();
     });

  it('should return `null` when an element context is retrieved that is a DOM node that was not created by Angular',
     () => {
       class StructuredComp {
         static ɵfac = () => new StructuredComp();
         static ɵcmp = ɵɵdefineComponent({
           type: StructuredComp,
           selectors: [['structured-comp']],
           decls: 1,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: StructuredComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'section');
                 }
               }
         });
       }

       const fixture = new ComponentFixture(StructuredComp);
       fixture.update();

       const section = fixture.hostElement.querySelector('section')! as any;
       const manuallyCreatedElement = document.createElement('div');
       section.appendChild(manuallyCreatedElement);

       const context = getLContext(manuallyCreatedElement);
       expect(context).toBeFalsy();
     });

  it('should by default monkey-patch the bootstrap component with context details', () => {
    class StructuredComp {
      static ɵfac = () => new StructuredComp();
      static ɵcmp = ɵɵdefineComponent({
        type: StructuredComp,
        selectors: [['structured-comp']],
        decls: 0,
        vars: 0,
        template: (rf: RenderFlags, ctx: StructuredComp) => {}
      });
    }

    const fixture = new ComponentFixture(StructuredComp);
    fixture.update();

    const hostElm = fixture.hostElement;
    const component = fixture.component;

    const componentLView = readPatchedData(component);
    expect(Array.isArray(componentLView)).toBeTruthy();

    const hostLView = readPatchedData(hostElm) as any;
    expect(hostLView).toBe(componentLView);

    const context1 = getLContext(hostElm)!;
    expect(context1.lView).toBe(hostLView);
    expect(context1.native).toEqual(hostElm);

    const context2 = getLContext(component)!;
    expect(context2).toBe(context1);
    expect(context2.lView).toBe(hostLView);
    expect(context2.native).toEqual(hostElm);
  });

  it('should by default monkey-patch the directives with LView so that they can be examined',
     () => {
       let myDir1Instance: MyDir1|null = null;
       let myDir2Instance: MyDir2|null = null;
       let myDir3Instance: MyDir2|null = null;

       class MyDir1 {
         static ɵfac = () => myDir1Instance = new MyDir1();
         static ɵdir = ɵɵdefineDirective({type: MyDir1, selectors: [['', 'my-dir-1', '']]});
       }

       class MyDir2 {
         static ɵfac = () => myDir2Instance = new MyDir2();
         static ɵdir = ɵɵdefineDirective({type: MyDir2, selectors: [['', 'my-dir-2', '']]});
       }

       class MyDir3 {
         static ɵfac = () => myDir3Instance = new MyDir2();
         static ɵdir = ɵɵdefineDirective({type: MyDir3, selectors: [['', 'my-dir-3', '']]});
       }

       class StructuredComp {
         static ɵfac = () => new StructuredComp();
         static ɵcmp = ɵɵdefineComponent({
           type: StructuredComp,
           selectors: [['structured-comp']],
           dependencies: [MyDir1, MyDir2, MyDir3],
           decls: 2,
           vars: 0,
           consts: [['my-dir-1', '', 'my-dir-2', ''], ['my-dir-3']],
           template:
               (rf: RenderFlags, ctx: StructuredComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'div', 0);
                   ɵɵelement(1, 'div', 1);
                 }
               }
         });
       }

       const fixture = new ComponentFixture(StructuredComp);
       fixture.update();

       const hostElm = fixture.hostElement;
       const div1 = hostElm.querySelector('div:first-child')! as any;
       const div2 = hostElm.querySelector('div:last-child')! as any;
       const context = getLContext(hostElm)!;
       const componentView = context.lView![context.nodeIndex];

       expect(componentView).toContain(myDir1Instance);
       expect(componentView).toContain(myDir2Instance);
       expect(componentView).toContain(myDir3Instance);

       expect(Array.isArray(readPatchedData(myDir1Instance))).toBeTruthy();
       expect(Array.isArray(readPatchedData(myDir2Instance))).toBeTruthy();
       expect(Array.isArray(readPatchedData(myDir3Instance))).toBeTruthy();

       const d1Context = getLContext(myDir1Instance)!;
       const d2Context = getLContext(myDir2Instance)!;
       const d3Context = getLContext(myDir3Instance)!;

       expect(d1Context.lView).toEqual(componentView);
       expect(d2Context.lView).toEqual(componentView);
       expect(d3Context.lView).toEqual(componentView);

       expect(readPatchedData(myDir1Instance)).toBe(d1Context);
       expect(readPatchedData(myDir2Instance)).toBe(d2Context);
       expect(readPatchedData(myDir3Instance)).toBe(d3Context);

       expect(d1Context.nodeIndex).toEqual(HEADER_OFFSET);
       expect(d1Context.native).toBe(div1);
       expect(d1Context.directives as any[]).toEqual([myDir1Instance, myDir2Instance]);

       expect(d2Context.nodeIndex).toEqual(HEADER_OFFSET);
       expect(d2Context.native).toBe(div1);
       expect(d2Context.directives as any[]).toEqual([myDir1Instance, myDir2Instance]);

       expect(d3Context.nodeIndex).toEqual(HEADER_OFFSET + 1);
       expect(d3Context.native).toBe(div2);
       expect(d3Context.directives as any[]).toEqual([myDir3Instance]);
     });

  it('should monkey-patch the exact same context instance of the DOM node, component and any directives on the same element',
     () => {
       let myDir1Instance: MyDir1|null = null;
       let myDir2Instance: MyDir2|null = null;
       let childComponentInstance: ChildComp|null = null;

       class MyDir1 {
         static ɵfac = () => myDir1Instance = new MyDir1();
         static ɵdir = ɵɵdefineDirective({type: MyDir1, selectors: [['', 'my-dir-1', '']]});
       }

       class MyDir2 {
         static ɵfac = () => myDir2Instance = new MyDir2();
         static ɵdir = ɵɵdefineDirective({type: MyDir2, selectors: [['', 'my-dir-2', '']]});
       }

       class ChildComp {
         static ɵfac = () => childComponentInstance = new ChildComp();
         static ɵcmp = ɵɵdefineComponent({
           type: ChildComp,
           selectors: [['child-comp']],
           decls: 1,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: ChildComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'div');
                 }
               }
         });
       }

       class ParentComp {
         static ɵfac = () => new ParentComp();
         static ɵcmp = ɵɵdefineComponent({
           type: ParentComp,
           selectors: [['parent-comp']],
           dependencies: [ChildComp, MyDir1, MyDir2],
           decls: 1,
           vars: 0,
           consts: [['my-dir-1', '', 'my-dir-2', '']],
           template:
               (rf: RenderFlags, ctx: ParentComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'child-comp', 0);
                 }
               }
         });
       }

       const fixture = new ComponentFixture(ParentComp);
       fixture.update();

       const childCompHostElm = fixture.hostElement.querySelector('child-comp')! as any;

       const lView = readPatchedData(childCompHostElm);
       expect(Array.isArray(lView)).toBeTruthy();
       expect(readPatchedData(myDir1Instance)).toBe(lView);
       expect(readPatchedData(myDir2Instance)).toBe(lView);
       expect(readPatchedData(childComponentInstance)).toBe(lView);

       const childNodeContext = getLContext(childCompHostElm)!;
       expect(childNodeContext.component).toBeFalsy();
       expect(childNodeContext.directives).toBeFalsy();
       assertMonkeyPatchValueIsLView(myDir1Instance);
       assertMonkeyPatchValueIsLView(myDir2Instance);
       assertMonkeyPatchValueIsLView(childComponentInstance);

       expect(getLContext(myDir1Instance)).toBe(childNodeContext);
       expect(childNodeContext.component).toBeFalsy();
       expect(childNodeContext.directives!.length).toEqual(2);
       assertMonkeyPatchValueIsLView(myDir1Instance, false);
       assertMonkeyPatchValueIsLView(myDir2Instance, false);
       assertMonkeyPatchValueIsLView(childComponentInstance);

       expect(getLContext(myDir2Instance)).toBe(childNodeContext);
       expect(childNodeContext.component).toBeFalsy();
       expect(childNodeContext.directives!.length).toEqual(2);
       assertMonkeyPatchValueIsLView(myDir1Instance, false);
       assertMonkeyPatchValueIsLView(myDir2Instance, false);
       assertMonkeyPatchValueIsLView(childComponentInstance);

       expect(getLContext(childComponentInstance)).toBe(childNodeContext);
       expect(childNodeContext.component).toBeTruthy();
       expect(childNodeContext.directives!.length).toEqual(2);
       assertMonkeyPatchValueIsLView(myDir1Instance, false);
       assertMonkeyPatchValueIsLView(myDir2Instance, false);
       assertMonkeyPatchValueIsLView(childComponentInstance, false);

       function assertMonkeyPatchValueIsLView(value: any, yesOrNo = true) {
         expect(Array.isArray(readPatchedData(value))).toBe(yesOrNo);
       }
     });

  it('should monkey-patch sub components with the view data and then replace them with the context result once a lookup occurs',
     () => {
       class ChildComp {
         static ɵfac = () => new ChildComp();
         static ɵcmp = ɵɵdefineComponent({
           type: ChildComp,
           selectors: [['child-comp']],
           decls: 3,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: ChildComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelement(0, 'div');
                   ɵɵelement(1, 'div');
                   ɵɵelement(2, 'div');
                 }
               }
         });
       }

       class ParentComp {
         static ɵfac = () => new ParentComp();
         static ɵcmp = ɵɵdefineComponent({
           type: ParentComp,
           selectors: [['parent-comp']],
           dependencies: [ChildComp],
           decls: 2,
           vars: 0,
           template:
               (rf: RenderFlags, ctx: ParentComp) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵelementStart(0, 'section');
                   ɵɵelementStart(1, 'child-comp');
                   ɵɵelementEnd();
                   ɵɵelementEnd();
                 }
               }
         });
       }

       const fixture = new ComponentFixture(ParentComp);
       fixture.update();

       const host = fixture.hostElement;
       const child = host.querySelector('child-comp') as any;
       expect(readPatchedData(child)).toBeTruthy();

       const context = getLContext(child)!;
       expect(readPatchedData(child)).toBeTruthy();

       const componentData = context.lView![context.nodeIndex];
       const component = componentData[CONTEXT];
       expect(component instanceof ChildComp).toBeTruthy();
       expect(readPatchedData(component)).toBe(context.lView);

       const componentContext = getLContext(component)!;
       expect(readPatchedData(component)).toBe(componentContext);
       expect(componentContext.nodeIndex).toEqual(context.nodeIndex);
       expect(componentContext.native).toEqual(context.native);
       expect(componentContext.lView).toEqual(context.lView);
     });
});

describe('sanitization', () => {
  it('should sanitize data using the provided sanitization interface', () => {
    class SanitizationComp {
      static ɵfac = () => new SanitizationComp();
      static ɵcmp = ɵɵdefineComponent({
        type: SanitizationComp,
        selectors: [['sanitize-this']],
        decls: 1,
        vars: 1,
        template:
            (rf: RenderFlags, ctx: SanitizationComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'a');
              }
              if (rf & RenderFlags.Update) {
                ɵɵproperty('href', ctx.href, ɵɵsanitizeUrl);
              }
            }
      });

      private href = '';

      updateLink(href: any) {
        this.href = href;
      }
    }

    const sanitizer = new LocalSanitizer((value) => {
      return 'http://bar';
    });

    const fixture = new ComponentFixture(SanitizationComp, {sanitizer});
    fixture.component.updateLink('http://foo');
    fixture.update();

    const anchor = fixture.hostElement.querySelector('a')!;
    expect(anchor.getAttribute('href')).toEqual('http://bar');

    fixture.component.updateLink(sanitizer.bypassSecurityTrustUrl('http://foo'));
    fixture.update();

    expect(anchor.getAttribute('href')).toEqual('http://foo');
  });

  it('should sanitize HostBindings data using provided sanitization interface', () => {
    let hostBindingDir: UnsafeUrlHostBindingDir;
    class UnsafeUrlHostBindingDir {
      // @HostBinding()
      cite: any = 'http://cite-dir-value';

      static ɵfac = () => hostBindingDir = new UnsafeUrlHostBindingDir();
      static ɵdir = ɵɵdefineDirective({
        type: UnsafeUrlHostBindingDir,
        selectors: [['', 'unsafeUrlHostBindingDir', '']],
        hostVars: 1,
        hostBindings:
            (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Update) {
                ɵɵhostProperty('cite', ctx.cite, ɵɵsanitizeUrl);
              }
            }
      });
    }

    class SimpleComp {
      static ɵfac = () => new SimpleComp();
      static ɵcmp = ɵɵdefineComponent({
        type: SimpleComp,
        selectors: [['sanitize-this']],
        decls: 1,
        vars: 0,
        consts: [['unsafeUrlHostBindingDir', '']],
        template:
            (rf: RenderFlags, ctx: SimpleComp) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'blockquote', 0);
              }
            },
        dependencies: [UnsafeUrlHostBindingDir]
      });
    }

    const sanitizer = new LocalSanitizer((value) => 'http://bar');

    const fixture = new ComponentFixture(SimpleComp, {sanitizer});
    hostBindingDir!.cite = 'http://foo';
    fixture.update();

    const anchor = fixture.hostElement.querySelector('blockquote')!;
    expect(anchor.getAttribute('cite')).toEqual('http://bar');

    hostBindingDir!.cite = sanitizer.bypassSecurityTrustUrl('http://foo');
    fixture.update();

    expect(anchor.getAttribute('cite')).toEqual('http://foo');
  });
});

class LocalSanitizedValue {
  constructor(public value: any) {}
  toString() {
    return this.value;
  }
}

class LocalSanitizer implements Sanitizer {
  constructor(private _interceptor: (value: string|null|any) => string) {}

  sanitize(context: SecurityContext, value: LocalSanitizedValue|string|null): string|null {
    if (value instanceof LocalSanitizedValue) {
      return value.toString();
    }
    return this._interceptor(value);
  }

  bypassSecurityTrustHtml(value: string) {}
  bypassSecurityTrustStyle(value: string) {}
  bypassSecurityTrustScript(value: string) {}
  bypassSecurityTrustResourceUrl(value: string) {}

  bypassSecurityTrustUrl(value: string) {
    return new LocalSanitizedValue(value);
  }
}

class ProxyRenderer3Factory implements RendererFactory3 {
  lastCapturedType: RendererType2|null = null;

  createRenderer(hostElement: RElement|null, rendererType: RendererType2|null): Renderer3 {
    this.lastCapturedType = rendererType;
    return domRendererFactory3.createRenderer(hostElement, rendererType);
  }
}
