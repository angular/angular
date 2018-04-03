/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateRef, ViewContainerRef} from '../../src/core';
import {getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from '../../src/render3/di';
import {defineComponent, defineDirective, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, load, loadDirective, text, textBinding} from '../../src/render3/instructions';

import {ComponentFixture} from './render_util';

describe('ViewContainerRef', () => {
  class TestDirective {
    constructor(public viewContainer: ViewContainerRef, public template: TemplateRef<any>, ) {}

    static ngDirectiveDef = defineDirective({
      type: TestDirective,
      selectors: [['', 'testdir', '']],
      factory: () => new TestDirective(injectViewContainerRef(), injectTemplateRef(), ),
    });
  }

  class TestComponent {
    testDir: TestDirective;

    static ngComponentDef = defineComponent({
      type: TestComponent,
      selectors: [['test-cmp']],
      factory: () => new TestComponent(),
      template: (cmp: TestComponent, cm: boolean) => {
        if (cm) {
          const subTemplate = (ctx: any, cm: boolean) => {
            if (cm) {
              text(0);
            }
            textBinding(0, bind(ctx.$implicit));
          };
          container(0, subTemplate, undefined, ['testdir', '']);
        }
        cmp.testDir = loadDirective<TestDirective>(0);
      },
      directives: [TestDirective]
    });
  }


  it('should add embedded view into container', () => {
    const fixture = new ComponentFixture(TestComponent);
    expect(fixture.html).toEqual('');

    const dir = fixture.component.testDir;
    const childCtx = {$implicit: 'works'};
    dir.viewContainer.createEmbeddedView(dir.template, childCtx);
    expect(fixture.html).toEqual('works');
  });

  it('should add embedded view into a view container on elements', () => {
    let directiveInstance: TestDirective|undefined;

    class TestDirective {
      static ngDirectiveDef = defineDirective({
        type: TestDirective,
        selectors: [['', 'testdir', '']],
        factory: () => directiveInstance = new TestDirective(injectViewContainerRef()),
        inputs: {tpl: 'tpl'}
      });

      tpl: TemplateRef<{}>;

      constructor(private _vcRef: ViewContainerRef) {}

      insertTpl(ctx?: {}) { this._vcRef.createEmbeddedView(this.tpl, ctx); }

      clear() { this._vcRef.clear(); }
    }

    function EmbeddedTemplate(ctx: any, cm: boolean) {
      if (cm) {
        text(0, 'From a template.');
      }
    }

    /**
     * <ng-template #tpl>From a template<ng-template>
     * before
     * <div directive [tpl]="tpl"></div>
     * after
     */
    class TestComponent {
      testDir: TestDirective;
      static ngComponentDef = defineComponent({
        type: TestComponent,
        selectors: [['test-cmp']],
        factory: () => new TestComponent(),
        template: (cmp: TestComponent, cm: boolean) => {
          if (cm) {
            container(0, EmbeddedTemplate);
            text(1, 'before');
            elementStart(2, 'div', ['testdir', '']);
            elementEnd();
            text(3, 'after');
          }
          const tpl = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(
              load(0)));  // TODO(pk): we need proper design / spec for this
          elementProperty(2, 'tpl', bind(tpl));
        },
        directives: [TestDirective]
      });
    }


    const fixture = new ComponentFixture(TestComponent);
    expect(fixture.html).toEqual('before<div testdir=""></div>after');

    directiveInstance !.insertTpl();
    expect(fixture.html).toEqual('before<div testdir=""></div>From a template.after');

    // run change-detection cycle with no template insertion / removal
    fixture.update();
    expect(fixture.html).toEqual('before<div testdir=""></div>From a template.after');

    directiveInstance !.insertTpl();
    expect(fixture.html)
        .toEqual('before<div testdir=""></div>From a template.From a template.after');

    directiveInstance !.clear();
    expect(fixture.html).toEqual('before<div testdir=""></div>after');
  });

  it('should add embedded view into a view container on ng-template', () => {
    let directiveInstance: TestDirective;

    class TestDirective {
      static ngDirectiveDef = defineDirective({
        type: TestDirective,
        selectors: [['', 'testdir', '']],
        factory: () => directiveInstance =
                     new TestDirective(injectViewContainerRef(), injectTemplateRef())
      });

      constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

      insertTpl(ctx: {}) { this._vcRef.createEmbeddedView(this._tplRef, ctx); }

      remove(index?: number) { this._vcRef.remove(index); }
    }

    function EmbeddedTemplate(ctx: any, cm: boolean) {
      if (cm) {
        text(0);
      }
      textBinding(0, interpolation1('Hello, ', ctx.name, ''));
    }

    /**
     * before|<ng-template directive>Hello, {{name}}<ng-template>|after
     */
    class TestComponent {
      testDir: TestDirective;
      static ngComponentDef = defineComponent({
        type: TestComponent,
        selectors: [['test-cmp']],
        factory: () => new TestComponent(),
        template: (cmp: TestComponent, cm: boolean) => {
          if (cm) {
            text(0, 'before|');
            container(1, EmbeddedTemplate, undefined, ['testdir', '']);
            text(2, '|after');
          }
        },
        directives: [TestDirective]
      });
    }

    const fixture = new ComponentFixture(TestComponent);
    expect(fixture.html).toEqual('before||after');

    directiveInstance !.insertTpl({name: 'World'});
    expect(fixture.html).toEqual('before|Hello, World|after');

    // run change-detection cycle with no template insertion / removal
    fixture.update();
    expect(fixture.html).toEqual('before|Hello, World|after');

    directiveInstance !.remove(0);
    expect(fixture.html).toEqual('before||after');
  });

  it('should add embedded views at the right position in the DOM tree (ng-template next to other ng-template)',
     () => {
       let directiveInstances: TestDirective[] = [];

       class TestDirective {
         static ngDirectiveDef = defineDirective({
           type: TestDirective,
           selectors: [['', 'testdir', '']],
           factory: () => {
             const instance = new TestDirective(injectViewContainerRef(), injectTemplateRef());

             directiveInstances.push(instance);

             return instance;
           }
         });

         constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

         insertTpl(ctx: {}) { this._vcRef.createEmbeddedView(this._tplRef, ctx); }

         remove(index?: number) { this._vcRef.remove(index); }
       }

       function EmbeddedTemplateA(ctx: any, cm: boolean) {
         if (cm) {
           text(0, 'A');
         }
       }

       function EmbeddedTemplateB(ctx: any, cm: boolean) {
         if (cm) {
           text(0, 'B');
         }
       }

       /**
        * before|
        * <ng-template directive>A<ng-template>
        * <ng-template directive>B<ng-template>
        * |after
        */
       class TestComponent {
         testDir: TestDirective;
         static ngComponentDef = defineComponent({
           type: TestComponent,
           selectors: [['test-cmp']],
           factory: () => new TestComponent(),
           template: (cmp: TestComponent, cm: boolean) => {
             if (cm) {
               text(0, 'before|');
               container(1, EmbeddedTemplateA, undefined, ['testdir', '']);
               container(2, EmbeddedTemplateB, undefined, ['testdir', '']);
               text(3, '|after');
             }
           },
           directives: [TestDirective]
         });
       }

       const fixture = new ComponentFixture(TestComponent);
       expect(fixture.html).toEqual('before||after');

       directiveInstances ![1].insertTpl({});
       expect(fixture.html).toEqual('before|B|after');

       directiveInstances ![0].insertTpl({});
       expect(fixture.html).toEqual('before|AB|after');
     });


  it('should add embedded views at the right position in the DOM tree (ng-template next to a JS block)',
     () => {
       let directiveInstance: TestDirective;

       class TestDirective {
         static ngDirectiveDef = defineDirective({
           type: TestDirective,
           selectors: [['', 'testdir', '']],
           factory: () => directiveInstance =
                        new TestDirective(injectViewContainerRef(), injectTemplateRef())
         });

         constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

         insertTpl(ctx: {}) { this._vcRef.createEmbeddedView(this._tplRef, ctx); }

         remove(index?: number) { this._vcRef.remove(index); }
       }

       function EmbeddedTemplateA(ctx: any, cm: boolean) {
         if (cm) {
           text(0, 'A');
         }
       }

       /**
        * before|
        * <ng-template directive>A<ng-template>
        * % if (condition) {
        *  B
        * }
        * |after
        */
       class TestComponent {
         condition = false;
         testDir: TestDirective;
         static ngComponentDef = defineComponent({
           type: TestComponent,
           selectors: [['test-cmp']],
           factory: () => new TestComponent(),
           template: (cmp: TestComponent, cm: boolean) => {
             if (cm) {
               text(0, 'before|');
               container(1, EmbeddedTemplateA, undefined, ['testdir', '']);
               container(2);
               text(3, '|after');
             }
             containerRefreshStart(2);
             {
               if (cmp.condition) {
                 let cm1 = embeddedViewStart(0);
                 {
                   if (cm1) {
                     text(0, 'B');
                   }
                 }
                 embeddedViewEnd();
               }
             }
             containerRefreshEnd();
           },
           directives: [TestDirective]
         });
       }

       const fixture = new ComponentFixture(TestComponent);
       expect(fixture.html).toEqual('before||after');

       fixture.component.condition = true;
       fixture.update();
       expect(fixture.html).toEqual('before|B|after');

       directiveInstance !.insertTpl({});
       expect(fixture.html).toEqual('before|AB|after');

       fixture.component.condition = false;
       fixture.update();
       expect(fixture.html).toEqual('before|A|after');

       directiveInstance !.insertTpl({});
       expect(fixture.html).toEqual('before|AA|after');

       fixture.component.condition = true;
       fixture.update();
       expect(fixture.html).toEqual('before|AAB|after');
     });
});
