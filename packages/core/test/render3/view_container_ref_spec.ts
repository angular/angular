/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Component as _Component, ComponentFactoryResolver, ComponentRef, ɵɵdefineInjector, ElementRef, EmbeddedViewRef, NgModuleRef, Pipe, PipeTransform, QueryList, RendererFactory2, TemplateRef, ViewContainerRef, ViewRef, ɵAPP_ROOT as APP_ROOT, ɵNgModuleDef as NgModuleDef,} from '../../src/core';
import {createInjector} from '../../src/di/r3_injector';
import {ViewEncapsulation} from '../../src/metadata';
import {AttributeMarker, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdefinePipe, injectComponentFactoryResolver, ɵɵlistener, ɵɵloadViewQuery, ɵɵNgOnChangesFeature, ɵɵqueryRefresh, ɵɵviewQuery,} from '../../src/render3/index';

import {ɵɵallocHostVars, ɵɵbind, ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵdirectiveInject, ɵɵelement, ɵɵelementEnd, ɵɵelementHostAttrs, ɵɵelementProperty, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵinterpolation1, ɵɵinterpolation3, ɵɵnextContext, ɵɵprojection, ɵɵprojectionDef, ɵɵreference, ɵɵtemplate, ɵɵtext, ɵɵtextBinding,} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {RElement} from '../../src/render3/interfaces/renderer';
import {NgModuleFactory} from '../../src/render3/ng_module_ref';
import {ɵɵpipe, ɵɵpipeBind1} from '../../src/render3/pipe';
import {getLView} from '../../src/render3/state';
import {getNativeByIndex} from '../../src/render3/util/view_utils';
import {ɵɵtemplateRefExtractor} from '../../src/render3/view_engine_compatibility_prebound';
import {NgForOf} from '../../test/render3/common_with_def';

import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, createComponent, getDirectiveOnNode, TemplateFixture,} from './render_util';

const Component: typeof _Component = function(...args: any[]): any {
  // In test we use @Component for documentation only so it's safe to mock out the implementation.
  return () => undefined;
} as any;


describe('ViewContainerRef', () => {
  let directiveInstance: DirectiveWithVCRef|null;

  beforeEach(() => directiveInstance = null);

  class DirectiveWithVCRef {
    static ngDirectiveDef = ɵɵdefineDirective({
      type: DirectiveWithVCRef,
      selectors: [['', 'vcref', '']],
      factory: () => directiveInstance = new DirectiveWithVCRef(

                   ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
      inputs: {tplRef: 'tplRef', name: 'name'}
    });

    // TODO(issue/24571): remove '!'.
    tplRef !: TemplateRef<{}>;

    name: string = '';

    // injecting a ViewContainerRef to create a dynamic container in which embedded views will be
    // created
    constructor(public vcref: ViewContainerRef, public cfr: ComponentFactoryResolver) {}
  }

  describe('API', () => {
    /**
     * {{name}}
     */
    function embeddedTemplate(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵtextBinding(0, ɵɵbind(ctx.name));
      }
    }

    function createView(s: string, index?: number): EmbeddedViewRef<any> {
      return directiveInstance !.vcref.createEmbeddedView(
          directiveInstance !.tplRef, {name: s}, index);
    }

    /**
     * <ng-template #tplRef>{{name}}</ng-template>
     * <p vcref [tplRef]="tplRef"></p>
     */
    function createTemplate() {
      ɵɵtemplate(
          0, embeddedTemplate, 1, 1, 'ng-template', null, ['tplRef', ''], ɵɵtemplateRefExtractor);
      ɵɵelement(2, 'p', ['vcref', '']);
    }

    function updateTemplate() {
      const tplRef = ɵɵreference(1);
      ɵɵelementProperty(2, 'tplRef', ɵɵbind(tplRef));
    }

    describe('createEmbeddedView (incl. insert)', () => {
      it('should work on elements', () => {
        /**
         * <ng-template #tplRef>{{name}}</ng-template>
         * <header vcref [tplRef]="tplRef"></header>
         * <footer></footer>
         */
        function createTemplate() {
          ɵɵtemplate(
              0, embeddedTemplate, 1, 1, 'ng-template', null, ['tplRef', ''],
              ɵɵtemplateRefExtractor);
          ɵɵelement(2, 'header', ['vcref', '']);
          ɵɵelement(3, 'footer');
        }

        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 4, 1, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<header vcref=""></header><footer></footer>');

        createView('A');
        fixture.update();
        expect(fixture.html).toEqual('<header vcref=""></header>A<footer></footer>');

        createView('B');
        createView('C');
        fixture.update();
        expect(fixture.html).toEqual('<header vcref=""></header>ABC<footer></footer>');

        createView('Y', 0);
        fixture.update();
        expect(fixture.html).toEqual('<header vcref=""></header>YABC<footer></footer>');

        expect(() => { createView('Z', -1); }).toThrow();
        expect(() => { createView('Z', 5); }).toThrow();
      });

      it('should work on components', () => {
        const HeaderComponent =
            createComponent('header-cmp', function(rf: RenderFlags, ctx: any) {});

        /**
         * <ng-template #tplRef>{{name}}</ng-template>
         * <header-cmp vcref [tplRef]="tplRef"></header-cmp>
         * <footer></footer>
         */
        function createTemplate() {
          ɵɵtemplate(
              0, embeddedTemplate, 1, 1, 'ng-template', [], ['tplRef', ''], ɵɵtemplateRefExtractor);
          ɵɵelement(2, 'header-cmp', ['vcref', '']);
          ɵɵelement(3, 'footer');
        }

        const fixture = new TemplateFixture(
            createTemplate, updateTemplate, 4, 1, [HeaderComponent, DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<header-cmp vcref=""></header-cmp><footer></footer>');

        createView('A');
        fixture.update();
        expect(fixture.html).toEqual('<header-cmp vcref=""></header-cmp>A<footer></footer>');

        createView('B');
        createView('C');
        fixture.update();
        expect(fixture.html).toEqual('<header-cmp vcref=""></header-cmp>ABC<footer></footer>');

        createView('Y', 0);
        fixture.update();
        expect(fixture.html).toEqual('<header-cmp vcref=""></header-cmp>YABC<footer></footer>');

        expect(() => { createView('Z', -1); }).toThrow();
        expect(() => { createView('Z', 5); }).toThrow();
      });

      it('should work with multiple instances with vcrefs', () => {
        let firstDir: DirectiveWithVCRef;
        let secondDir: DirectiveWithVCRef;

        /**
         * <ng-template #tplRef>{{name}}</ng-template>
         * <div vcref [tplRef]="tplRef"></div>
         * <div vcref [tplRef]="tplRef"></div>
         */
        function createTemplate() {
          ɵɵtemplate(
              0, embeddedTemplate, 1, 1, 'ng-template', null, ['tplRef', ''],
              ɵɵtemplateRefExtractor);
          ɵɵelement(2, 'div', ['vcref', '']);
          ɵɵelement(3, 'div', ['vcref', '']);

          // for testing only:
          firstDir = getDirectiveOnNode(2);
          secondDir = getDirectiveOnNode(3);
        }

        function update() {
          const tplRef = ɵɵreference(1);
          ɵɵelementProperty(2, 'tplRef', ɵɵbind(tplRef));
          ɵɵelementProperty(3, 'tplRef', ɵɵbind(tplRef));
        }

        const fixture = new TemplateFixture(createTemplate, update, 4, 2, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<div vcref=""></div><div vcref=""></div>');

        firstDir !.vcref.createEmbeddedView(firstDir !.tplRef, {name: 'A'});
        secondDir !.vcref.createEmbeddedView(secondDir !.tplRef, {name: 'B'});
        fixture.update();
        expect(fixture.html).toEqual('<div vcref=""></div>A<div vcref=""></div>B');
      });

      it('should work on templates', () => {
        /**
         * <ng-template vcref #tplRef>{{name}}</ng-template>
         * <footer></footer>
         */
        function createTemplate() {
          ɵɵtemplate(
              0, embeddedTemplate, 1, 1, 'ng-template', ['vcref', ''], ['tplRef', ''],
              ɵɵtemplateRefExtractor);
          ɵɵelement(2, 'footer');
        }

        function updateTemplate() {
          const tplRef = ɵɵreference(1);
          ɵɵelementProperty(0, 'tplRef', ɵɵbind(tplRef));
        }

        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<footer></footer>');

        createView('A');
        fixture.update();
        expect(fixture.html).toEqual('A<footer></footer>');

        createView('B');
        createView('C');
        fixture.update();
        expect(fixture.html).toEqual('ABC<footer></footer>');

        createView('Y', 0);
        fixture.update();
        expect(fixture.html).toEqual('YABC<footer></footer>');

        expect(() => { createView('Z', -1); }).toThrow();
        expect(() => { createView('Z', 5); }).toThrow();
      });

      it('should add embedded views at the right position in the DOM tree (ng-template next to other ng-template)',
         () => {
           let directiveInstances: TestDirective[] = [];

           class TestDirective {
             static ngDirectiveDef = ɵɵdefineDirective({
               type: TestDirective,
               selectors: [['', 'testdir', '']],
               factory: () => {
                 const instance = new TestDirective(
                     ɵɵdirectiveInject(ViewContainerRef as any),
                     ɵɵdirectiveInject(TemplateRef as any));

                 directiveInstances.push(instance);

                 return instance;
               }
             });

             constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

             insertTpl(ctx: {}) { this._vcRef.createEmbeddedView(this._tplRef, ctx); }

             remove(index?: number) { this._vcRef.remove(index); }
           }

           function EmbeddedTemplateA(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               ɵɵtext(0, 'A');
             }
           }

           function EmbeddedTemplateB(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               ɵɵtext(0, 'B');
             }
           }

           /**
            * before|
            * <ng-template directive>A<ng-template>
            * <ng-template directive>B<ng-template>
            * |after
            */
           class TestComponent {
             // TODO(issue/24571): remove '!'.
             testDir !: TestDirective;
             static ngComponentDef = ɵɵdefineComponent({
               type: TestComponent,
               encapsulation: ViewEncapsulation.None,
               selectors: [['test-cmp']],
               factory: () => new TestComponent(),
               consts: 4,
               vars: 0,
               template: (rf: RenderFlags, cmp: TestComponent) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵtext(0, 'before|');
                   ɵɵtemplate(1, EmbeddedTemplateA, 1, 0, 'ng-template', ['testdir', '']);
                   ɵɵtemplate(2, EmbeddedTemplateB, 1, 0, 'ng-template', ['testdir', '']);
                   ɵɵtext(3, '|after');
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
             static ngDirectiveDef = ɵɵdefineDirective({
               type: TestDirective,
               selectors: [['', 'testdir', '']],
               factory: () => directiveInstance = new TestDirective(
                            ɵɵdirectiveInject(ViewContainerRef as any),
                            ɵɵdirectiveInject(TemplateRef as any))
             });

             constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<{}>) {}

             insertTpl(ctx: {}) { this._vcRef.createEmbeddedView(this._tplRef, ctx); }

             insertTpl2(ctx: {}) {
               const viewRef = this._tplRef.createEmbeddedView(ctx);
               this._vcRef.insert(viewRef);
             }

             remove(index?: number) { this._vcRef.remove(index); }
           }

           function EmbeddedTemplateA(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               ɵɵtext(0, 'A');
             }
           }

           /**
            * before|
            * <ng-template testDir>A<ng-template>
            * % if (condition) {
            *  B
            * % }
            * |after
            */
           class TestComponent {
             condition = false;
             // TODO(issue/24571): remove '!'.
             testDir !: TestDirective;
             static ngComponentDef = ɵɵdefineComponent({
               type: TestComponent,
               encapsulation: ViewEncapsulation.None,
               selectors: [['test-cmp']],
               consts: 4,
               vars: 0,
               factory: () => new TestComponent(),
               template: (rf: RenderFlags, cmp: TestComponent) => {
                 if (rf & RenderFlags.Create) {
                   ɵɵtext(0, 'before|');
                   ɵɵtemplate(1, EmbeddedTemplateA, 1, 0, 'ng-template', ['testdir', '']);
                   ɵɵcontainer(2);
                   ɵɵtext(3, '|after');
                 }
                 if (rf & RenderFlags.Update) {
                   ɵɵcontainerRefreshStart(2);
                   {
                     if (cmp.condition) {
                       let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                       {
                         if (rf1 & RenderFlags.Create) {
                           ɵɵtext(0, 'B');
                         }
                       }
                       ɵɵembeddedViewEnd();
                     }
                   }
                   ɵɵcontainerRefreshEnd();
                 }
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

           directiveInstance !.insertTpl2({});
           expect(fixture.html).toEqual('before|AA|after');

           fixture.component.condition = true;
           fixture.update();
           expect(fixture.html).toEqual('before|AAB|after');
         });

      it('should apply directives and pipes of the host view to the TemplateRef', () => {
        @Component({selector: 'child', template: `{{name}}`})
        class Child {
          // TODO(issue/24571): remove '!'.
          name !: string;

          static ngComponentDef = ɵɵdefineComponent({
            type: Child,
            encapsulation: ViewEncapsulation.None,
            selectors: [['child']],
            factory: () => new Child(),
            consts: 1,
            vars: 1,
            template: (rf: RenderFlags, cmp: Child) => {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵtextBinding(0, ɵɵinterpolation1('', cmp.name, ''));
              }
            },
            inputs: {name: 'name'}
          });
        }

        @Pipe({name: 'starPipe'})
        class StarPipe implements PipeTransform {
          transform(value: any) { return `**${value}**`; }

          static ngPipeDef = ɵɵdefinePipe({
            name: 'starPipe',
            type: StarPipe,
            factory: function StarPipe_Factory() { return new StarPipe(); },
          });
        }

        function SomeComponent_Template_0(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'child');
            ɵɵpipe(1, 'starPipe');
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(0, 'name', ɵɵbind(ɵɵpipeBind1(1, 1, 'C')));
          }
        }

        @Component({
          template: `
            <ng-template #foo>
              <child [name]="'C' | starPipe"></child>
            </ng-template>
            <child vcref [tplRef]="foo" [name]="'A' | starPipe"></child>
            <child [name]="'B' | starPipe"></child>
          `
        })
        class SomeComponent {
          static ngComponentDef = ɵɵdefineComponent({
            type: SomeComponent,
            encapsulation: ViewEncapsulation.None,
            selectors: [['some-comp']],
            factory: () => new SomeComponent(),
            consts: 6,
            vars: 7,
            template: (rf: RenderFlags, cmp: SomeComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵtemplate(
                    0, SomeComponent_Template_0, 2, 3, 'ng-template', [], ['foo', ''],
                    ɵɵtemplateRefExtractor);
                ɵɵpipe(2, 'starPipe');
                ɵɵelement(3, 'child', ['vcref', '']);
                ɵɵpipe(4, 'starPipe');
                ɵɵelement(5, 'child');
              }
              if (rf & RenderFlags.Update) {
                const tplRef = ɵɵreference(1);
                ɵɵelementProperty(3, 'tplRef', ɵɵbind(tplRef));
                ɵɵelementProperty(3, 'name', ɵɵbind(ɵɵpipeBind1(2, 3, 'A')));
                ɵɵelementProperty(5, 'name', ɵɵbind(ɵɵpipeBind1(4, 5, 'B')));
              }
            },
            directives: [Child, DirectiveWithVCRef],
            pipes: [StarPipe]
          });
        }

        const fixture = new ComponentFixture(SomeComponent);
        directiveInstance !.vcref.createEmbeddedView(directiveInstance !.tplRef, fixture.component);
        directiveInstance !.vcref.createEmbeddedView(directiveInstance !.tplRef, fixture.component);
        fixture.update();
        expect(fixture.html)
            .toEqual(
                '<child vcref="">**A**</child><child>**C**</child><child>**C**</child><child>**B**</child>');
      });
    });

    describe('insertion points and declaration points', () => {
      class InsertionDir {
        // @Input()
        set tplDir(tpl: TemplateRef<any>|null) {
          tpl ? this.vcr.createEmbeddedView(tpl) : this.vcr.clear();
        }

        constructor(public vcr: ViewContainerRef) {}

        static ngDirectiveDef = ɵɵdefineDirective({
          type: InsertionDir,
          selectors: [['', 'tplDir', '']],
          factory: () => new InsertionDir(ɵɵdirectiveInject(ViewContainerRef as any)),
          inputs: {tplDir: 'tplDir'}
        });
      }

      // see running stackblitz example: https://stackblitz.com/edit/angular-w3myy6
      it('should work with a template declared in a different component view from insertion',
         () => {
           let child: Child|null = null;

           /**
            * <div [tplDir]="tpl">{{ name }}</div>
            * // template insertion point
            */
           class Child {
             name = 'Child';
             tpl: TemplateRef<any>|null = null;

             static ngComponentDef = ɵɵdefineComponent({
               type: Child,
               encapsulation: ViewEncapsulation.None,
               selectors: [['child']],
               factory: () => child = new Child(),
               consts: 2,
               vars: 2,
               template: function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   ɵɵelementStart(0, 'div', [AttributeMarker.Bindings, 'tplDir']);
                   { ɵɵtext(1); }
                   ɵɵelementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                   ɵɵelementProperty(0, 'tplDir', ɵɵbind(ctx.tpl));
                   ɵɵtextBinding(1, ɵɵbind(ctx.name));
                 }
               },
               inputs: {tpl: 'tpl'},
               directives: () => [InsertionDir]
             });
           }

           /**
            * // template declaration point
            * <ng-template #foo>
            *     <div> {{ name }} </div>
            * </ng-template>
            *
            * <child [tpl]="foo"></child>                           <-- template insertion inside
            */
           const Parent = createComponent('parent', function(rf: RenderFlags, parent: any) {
             if (rf & RenderFlags.Create) {
               ɵɵtemplate(
                   0, fooTemplate, 2, 1, 'ng-template', null, ['foo', ''], ɵɵtemplateRefExtractor);
               ɵɵelement(2, 'child');
             }

             if (rf & RenderFlags.Update) {
               const tplRef = ɵɵreference(1);
               ɵɵelementProperty(2, 'tpl', ɵɵbind(tplRef));
             }

           }, 3, 1, [Child]);

           function fooTemplate(rf1: RenderFlags, ctx: any) {
             if (rf1 & RenderFlags.Create) {
               ɵɵelementStart(0, 'div');
               { ɵɵtext(1); }
               ɵɵelementEnd();
             }
             if (rf1 & RenderFlags.Update) {
               const parent = ɵɵnextContext();
               ɵɵtextBinding(1, ɵɵbind(parent.name));
             }
           }

           const fixture = new ComponentFixture(Parent);
           fixture.component.name = 'Parent';
           fixture.update();

           // Context should be inherited from the declaration point, not the insertion point,
           // so the template should read 'Parent'.
           expect(fixture.html).toEqual(`<child><div>Child</div><div>Parent</div></child>`);

           child !.tpl = null;
           fixture.update();
           expect(fixture.html).toEqual(`<child><div>Child</div></child>`);
         });

      // see running stackblitz example: https://stackblitz.com/edit/angular-3vplec
      it('should work with nested for loops with different declaration / insertion points', () => {
        /**
         * <ng-template ngFor [ngForOf]="rows" [ngForTemplate]="tpl">
         *     // insertion point for templates (both row and cell)
         * </ng-template>
         */
        class LoopComp {
          name = 'Loop';

          // @Input()
          tpl !: TemplateRef<any>;

          // @Input()
          rows !: any[];

          static ngComponentDef = ɵɵdefineComponent({
            type: LoopComp,
            encapsulation: ViewEncapsulation.None,
            selectors: [['loop-comp']],
            factory: () => new LoopComp(),
            consts: 1,
            vars: 2,
            template: function(rf: RenderFlags, loop: any) {
              if (rf & RenderFlags.Create) {
                ɵɵtemplate(0, null, 0, 0, 'ng-template', [AttributeMarker.Bindings, 'ngForOf']);
              }

              if (rf & RenderFlags.Update) {
                ɵɵelementProperty(0, 'ngForOf', ɵɵbind(loop.rows));
                ɵɵelementProperty(0, 'ngForTemplate', ɵɵbind(loop.tpl));
              }
            },
            inputs: {tpl: 'tpl', rows: 'rows'},
            directives: () => [NgForOf]
          });
        }

        /**
         * // row declaration point
         * <ng-template #rowTemplate let-row>
         *
         *   // cell declaration point
         *   <ng-template #cellTemplate let-cell>
         *     <div> {{ cell }} - {{ row.value }} - {{ name }} </div>
         *   </ng-template>
         *
         *   <loop-comp [tpl]="cellTemplate" [rows]="row.data"></loop-comp>  <-- cell insertion
         * </ng-template>
         *
         * <loop-comp [tpl]="rowTemplate" [rows]="rows">                      <-- row insertion
         * </loop-comp>
         */
        const Parent = createComponent('parent', function(rf: RenderFlags, parent: any) {
          if (rf & RenderFlags.Create) {
            ɵɵtemplate(
                0, rowTemplate, 3, 2, 'ng-template', null, ['rowTemplate', ''],
                ɵɵtemplateRefExtractor);
            ɵɵelement(2, 'loop-comp');
          }

          if (rf & RenderFlags.Update) {
            const rowTemplateRef = ɵɵreference(1);
            ɵɵelementProperty(2, 'tpl', ɵɵbind(rowTemplateRef));
            ɵɵelementProperty(2, 'rows', ɵɵbind(parent.rows));
          }

        }, 3, 2, [LoopComp]);

        function rowTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵtemplate(
                0, cellTemplate, 2, 3, 'ng-template', null, ['cellTemplate', ''],
                ɵɵtemplateRefExtractor);
            ɵɵelement(2, 'loop-comp');
          }

          if (rf & RenderFlags.Update) {
            const row = ctx.$implicit as any;
            const cellTemplateRef = ɵɵreference(1);
            ɵɵelementProperty(2, 'tpl', ɵɵbind(cellTemplateRef));
            ɵɵelementProperty(2, 'rows', ɵɵbind(row.data));
          }
        }

        function cellTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'div');
            { ɵɵtext(1); }
            ɵɵelementEnd();
          }

          if (rf & RenderFlags.Update) {
            const cell = ctx.$implicit as any;
            const row = ɵɵnextContext().$implicit as any;
            const parent = ɵɵnextContext();
            ɵɵtextBinding(1, ɵɵinterpolation3('', cell, ' - ', row.value, ' - ', parent.name, ''));
          }
        }

        const fixture = new ComponentFixture(Parent);
        fixture.component.name = 'Parent';
        fixture.component.rows =
            [{data: ['1', '2'], value: 'one'}, {data: ['3', '4'], value: 'two'}];
        fixture.update();

        expect(fixture.html)
            .toEqual(
                '<loop-comp>' +
                '<loop-comp><div>1 - one - Parent</div><div>2 - one - Parent</div></loop-comp>' +
                '<loop-comp><div>3 - two - Parent</div><div>4 - two - Parent</div></loop-comp>' +
                '</loop-comp>');

        fixture.component.rows = [{data: ['5', '6'], value: 'three'}, {data: ['7'], value: 'four'}];
        fixture.component.name = 'New name!';
        fixture.update();

        expect(fixture.html)
            .toEqual(
                '<loop-comp>' +
                '<loop-comp><div>5 - three - New name!</div><div>6 - three - New name!</div></loop-comp>' +
                '<loop-comp><div>7 - four - New name!</div></loop-comp>' +
                '</loop-comp>');
      });
    });

    const rendererFactory = getRendererFactory2(document);

    describe('detach', () => {
      it('should detach the right embedded view when an index is specified', () => {
        const fixture = new TemplateFixture(
            createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef], null, null,
            rendererFactory);
        const viewA = createView('A');
        createView('B');
        createView('C');
        const viewD = createView('D');
        createView('E');
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCDE');

        directiveInstance !.vcref.detach(3);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCE');
        expect(viewD.destroyed).toBeFalsy();

        directiveInstance !.vcref.detach(0);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>BCE');
        expect(viewA.destroyed).toBeFalsy();

        expect(() => { directiveInstance !.vcref.detach(-1); }).toThrow();
        expect(() => { directiveInstance !.vcref.detach(42); }).toThrow();
        expect(ngDevMode).toHaveProperties({rendererDestroyNode: 0});
      });


      it('should detach the last embedded view when no index is specified', () => {
        const fixture = new TemplateFixture(
            createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef], null, null,
            rendererFactory);
        createView('A');
        createView('B');
        createView('C');
        createView('D');
        const viewE = createView('E');
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCDE');

        directiveInstance !.vcref.detach();
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCD');
        expect(viewE.destroyed).toBeFalsy();
        expect(ngDevMode).toHaveProperties({rendererDestroyNode: 0});
      });
    });

    describe('remove', () => {
      it('should remove the right embedded view when an index is specified', () => {
        const fixture = new TemplateFixture(
            createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef], null, null,
            rendererFactory);
        const viewA = createView('A');
        createView('B');
        createView('C');
        const viewD = createView('D');
        createView('E');
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCDE');

        directiveInstance !.vcref.remove(3);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCE');
        expect(viewD.destroyed).toBeTruthy();

        directiveInstance !.vcref.remove(0);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>BCE');
        expect(viewA.destroyed).toBeTruthy();

        expect(() => { directiveInstance !.vcref.remove(-1); }).toThrow();
        expect(() => { directiveInstance !.vcref.remove(42); }).toThrow();
        expect(ngDevMode).toHaveProperties({rendererDestroyNode: 2});
      });

      it('should remove the last embedded view when no index is specified', () => {
        const fixture = new TemplateFixture(
            createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef], null, null,
            rendererFactory);
        createView('A');
        createView('B');
        createView('C');
        createView('D');
        const viewE = createView('E');
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCDE');

        directiveInstance !.vcref.remove();
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCD');
        expect(viewE.destroyed).toBeTruthy();
        expect(ngDevMode).toHaveProperties({rendererDestroyNode: 1});
      });

      it('should throw when trying to insert a removed or destroyed view', () => {
        const fixture = new TemplateFixture(
            createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef], null, null,
            rendererFactory);
        const viewA = createView('A');
        const viewB = createView('B');
        fixture.update();

        directiveInstance !.vcref.remove();
        fixture.update();
        expect(() => directiveInstance !.vcref.insert(viewB)).toThrow();

        viewA.destroy();
        fixture.update();
        expect(() => directiveInstance !.vcref.insert(viewA)).toThrow();
      });
    });

    describe('length', () => {
      it('should return the number of embedded views', () => {
        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef]);
        expect(directiveInstance !.vcref.length).toEqual(0);

        createView('A');
        createView('B');
        createView('C');
        fixture.update();
        expect(directiveInstance !.vcref.length).toEqual(3);

        directiveInstance !.vcref.detach(1);
        fixture.update();
        expect(directiveInstance !.vcref.length).toEqual(2);

        directiveInstance !.vcref.clear();
        fixture.update();
        expect(directiveInstance !.vcref.length).toEqual(0);
      });
    });

    describe('get and indexOf', () => {
      it('should retrieve a ViewRef from its index, and vice versa', () => {
        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef]);
        createView('A');
        createView('B');
        createView('C');
        fixture.update();

        let viewRef = directiveInstance !.vcref.get(0);
        expect(directiveInstance !.vcref.indexOf(viewRef !)).toEqual(0);

        viewRef = directiveInstance !.vcref.get(1);
        expect(directiveInstance !.vcref.indexOf(viewRef !)).toEqual(1);

        viewRef = directiveInstance !.vcref.get(2);
        expect(directiveInstance !.vcref.indexOf(viewRef !)).toEqual(2);
      });

      it('should handle out of bounds cases', () => {
        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef]);
        createView('A');
        fixture.update();

        expect(directiveInstance !.vcref.get(-1)).toBeNull();
        expect(directiveInstance !.vcref.get(42)).toBeNull();

        const viewRef = directiveInstance !.vcref.get(0);
        directiveInstance !.vcref.remove(0);
        expect(directiveInstance !.vcref.indexOf(viewRef !)).toEqual(-1);
      });
    });

    describe('move', () => {
      it('should move embedded views and associated DOM nodes without recreating them', () => {
        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef]);
        createView('A');
        createView('B');
        createView('C');
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABC');

        // The DOM is manually modified here to ensure that the text node is actually moved
        fixture.hostElement.childNodes[2].nodeValue = '**A**';
        expect(fixture.html).toEqual('<p vcref=""></p>**A**BC');

        let viewRef = directiveInstance !.vcref.get(0);
        directiveInstance !.vcref.move(viewRef !, 2);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>BC**A**');

        directiveInstance !.vcref.move(viewRef !, 0);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>**A**BC');

        directiveInstance !.vcref.move(viewRef !, 1);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>B**A**C');

        expect(() => { directiveInstance !.vcref.move(viewRef !, -1); }).toThrow();
        expect(() => { directiveInstance !.vcref.move(viewRef !, 42); }).toThrow();
      });
    });

    describe('createComponent', () => {
      let templateExecutionCounter = 0;

      it('should work without Injector and NgModuleRef', () => {
        class EmbeddedComponent {
          constructor() {}

          static ngComponentDef = ɵɵdefineComponent({
            type: EmbeddedComponent,
            encapsulation: ViewEncapsulation.None,
            selectors: [['embedded-cmp']],
            factory: () => new EmbeddedComponent(),
            consts: 1,
            vars: 0,
            template: (rf: RenderFlags, cmp: EmbeddedComponent) => {
              templateExecutionCounter++;
              if (rf & RenderFlags.Create) {
                ɵɵtext(0, 'foo');
              }
            }
          });
        }

        templateExecutionCounter = 0;
        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<p vcref=""></p>');
        expect(templateExecutionCounter).toEqual(0);

        const componentRef = directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(EmbeddedComponent));
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
        expect(templateExecutionCounter).toEqual(2);

        directiveInstance !.vcref.detach(0);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>');
        expect(templateExecutionCounter).toEqual(2);

        directiveInstance !.vcref.insert(componentRef.hostView);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
        expect(templateExecutionCounter).toEqual(3);
      });

      it('should work with NgModuleRef and Injector', () => {
        class EmbeddedComponent {
          constructor(public s: String) {}

          static ngComponentDef = ɵɵdefineComponent({
            type: EmbeddedComponent,
            encapsulation: ViewEncapsulation.None,
            selectors: [['embedded-cmp']],
            factory: () => new EmbeddedComponent(ɵɵdirectiveInject(String)),
            consts: 1,
            vars: 0,
            template: (rf: RenderFlags, cmp: EmbeddedComponent) => {
              templateExecutionCounter++;
              if (rf & RenderFlags.Create) {
                ɵɵtext(0, 'foo');
              }
            }
          });
        }

        class MyAppModule {
          static ngInjectorDef = ɵɵdefineInjector({
            factory: () => new MyAppModule(),
            imports: [],
            providers: [
              {provide: APP_ROOT, useValue: true},
              {provide: RendererFactory2, useValue: getRendererFactory2(document)},
              {provide: String, useValue: 'module'}
            ]
          });
          static ngModuleDef: NgModuleDef<any> = { bootstrap: [] } as any;
        }
        const myAppModuleFactory = new NgModuleFactory(MyAppModule);
        const ngModuleRef = myAppModuleFactory.create(null);

        class SomeModule {
          static ngInjectorDef = ɵɵdefineInjector({
            factory: () => new SomeModule(),
            providers: [
              {provide: NgModuleRef, useValue: ngModuleRef},
              {provide: String, useValue: 'injector'}
            ]
          });
        }
        const injector = createInjector(SomeModule);

        templateExecutionCounter = 0;
        const fixture =
            new TemplateFixture(createTemplate, updateTemplate, 3, 1, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<p vcref=""></p>');
        expect(templateExecutionCounter).toEqual(0);

        const componentRef = directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(EmbeddedComponent), 0, injector);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
        expect(templateExecutionCounter).toEqual(2);
        expect(componentRef.instance.s).toEqual('injector');

        directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(EmbeddedComponent), 0, undefined,
            undefined, ngModuleRef);
        fixture.update();
        expect(fixture.html)
            .toEqual(
                '<p vcref=""></p><embedded-cmp>foo</embedded-cmp><embedded-cmp>foo</embedded-cmp>');
        expect(templateExecutionCounter).toEqual(5);
      });

      describe('ComponentRef', () => {
        let dynamicComp !: DynamicComp;

        class AppComp {
          constructor(public vcr: ViewContainerRef, public cfr: ComponentFactoryResolver) {}

          static ngComponentDef = ɵɵdefineComponent({
            type: AppComp,
            selectors: [['app-comp']],
            factory:
                () => new AppComp(
                    ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
            consts: 0,
            vars: 0,
            template: (rf: RenderFlags, cmp: AppComp) => {}
          });
        }

        class DynamicComp {
          doCheckCount = 0;

          ngDoCheck() { this.doCheckCount++; }

          static ngComponentDef = ɵɵdefineComponent({
            type: DynamicComp,
            selectors: [['dynamic-comp']],
            factory: () => dynamicComp = new DynamicComp(),
            consts: 0,
            vars: 0,
            template: (rf: RenderFlags, cmp: DynamicComp) => {}
          });
        }

        it('should return ComponentRef with ChangeDetectorRef attached to root view', () => {
          const fixture = new ComponentFixture(AppComp);

          const dynamicCompFactory = fixture.component.cfr.resolveComponentFactory(DynamicComp);
          const ref = fixture.component.vcr.createComponent(dynamicCompFactory);
          fixture.update();
          expect(dynamicComp.doCheckCount).toEqual(1);

          // The change detector ref should be attached to the root view that contains
          // DynamicComp, so the doCheck hook for DynamicComp should run upon ref.detectChanges().
          ref.changeDetectorRef.detectChanges();
          expect(dynamicComp.doCheckCount).toEqual(2);
          expect((ref.changeDetectorRef as any).context).toBeNull();
        });

        it('should return ComponentRef that can retrieve component ChangeDetectorRef through its injector',
           () => {
             const fixture = new ComponentFixture(AppComp);

             const dynamicCompFactory = fixture.component.cfr.resolveComponentFactory(DynamicComp);
             const ref = fixture.component.vcr.createComponent(dynamicCompFactory);
             fixture.update();
             expect(dynamicComp.doCheckCount).toEqual(1);

             // The injector should retrieve the change detector ref for DynamicComp. As such,
             // the doCheck hook for DynamicComp should NOT run upon ref.detectChanges().
             const changeDetector = ref.injector.get(ChangeDetectorRef);
             changeDetector.detectChanges();
             expect(dynamicComp.doCheckCount).toEqual(1);
             expect(changeDetector.context).toEqual(dynamicComp);
           });

        it('should not throw when destroying a reattached component', () => {
          const fixture = new ComponentFixture(AppComp);

          const dynamicCompFactory = fixture.component.cfr.resolveComponentFactory(DynamicComp);
          const ref = fixture.component.vcr.createComponent(dynamicCompFactory);
          fixture.update();

          fixture.component.vcr.detach(fixture.component.vcr.indexOf(ref.hostView));

          expect(() => { ref.destroy(); }).not.toThrow();

        });
      });
    });

    describe('getters', () => {
      it('should work on elements', () => {
        function createTemplate() {
          ɵɵelement(0, 'header', ['vcref', '']);
          ɵɵelement(1, 'footer');
        }

        new TemplateFixture(createTemplate, undefined, 2, 0, [DirectiveWithVCRef]);

        expect(directiveInstance !.vcref.element.nativeElement.tagName.toLowerCase())
            .toEqual('header');
        expect(
            directiveInstance !.vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase())
            .toEqual('header');
        expect(() => directiveInstance !.vcref.parentInjector.get(ElementRef)).toThrow();
      });

      it('should work on components', () => {
        const HeaderComponent =
            createComponent('header-cmp', function(rf: RenderFlags, ctx: any) {});

        function createTemplate() {
          ɵɵelement(0, 'header-cmp', ['vcref', '']);
          ɵɵelement(1, 'footer');
        }

        new TemplateFixture(createTemplate, undefined, 2, 0, [HeaderComponent, DirectiveWithVCRef]);

        expect(directiveInstance !.vcref.element.nativeElement.tagName.toLowerCase())
            .toEqual('header-cmp');
        expect(
            directiveInstance !.vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase())
            .toEqual('header-cmp');
        expect(() => directiveInstance !.vcref.parentInjector.get(ElementRef)).toThrow();
      });

      it('should work on templates', () => {
        function createTemplate() {
          ɵɵtemplate(0, embeddedTemplate, 1, 1, 'ng-template', ['vcref', '']);
          ɵɵelement(1, 'footer');
        }

        new TemplateFixture(createTemplate, () => {}, 2, 0, [DirectiveWithVCRef]);
        expect(directiveInstance !.vcref.element.nativeElement.textContent).toEqual('container');
        expect(directiveInstance !.vcref.injector.get(ElementRef).nativeElement.textContent)
            .toEqual('container');
        expect(() => directiveInstance !.vcref.parentInjector.get(ElementRef)).toThrow();
      });
    });
  });

  describe('projection', () => {
    function embeddedTemplate(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'span');
        ɵɵtext(1);
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵtextBinding(1, ctx.name);
      }
    }

    it('should project the ViewContainerRef content along its host, in an element', () => {
      @Component({selector: 'child', template: '<div><ng-content></ng-content></div>'})
      class Child {
        static ngComponentDef = ɵɵdefineComponent({
          type: Child,
          encapsulation: ViewEncapsulation.None,
          selectors: [['child']],
          factory: () => new Child(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              ɵɵprojectionDef();
              ɵɵelementStart(0, 'div');
              { ɵɵprojection(1); }
              ɵɵelementEnd();
            }
          }
        });
      }

      @Component({
        selector: 'parent',
        template: `
          <ng-template #foo>
              <span>{{name}}</span>
          </ng-template>
          <child><header vcref [tplRef]="foo" [name]="name">blah</header></child>`
      })
      class Parent {
        name: string = 'bar';
        static ngComponentDef = ɵɵdefineComponent({
          type: Parent,
          encapsulation: ViewEncapsulation.None,
          selectors: [['parent']],
          factory: () => new Parent(),
          consts: 5,
          vars: 2,
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              ɵɵtemplate(
                  0, embeddedTemplate, 2, 1, 'ng-template', null, ['foo', ''],
                  ɵɵtemplateRefExtractor);
              ɵɵelementStart(2, 'child');
              {
                ɵɵelementStart(3, 'header', ['vcref', '']);
                { ɵɵtext(4, 'blah'); }
                ɵɵelementEnd();
              }
              ɵɵelementEnd();
            }
            let tplRef: any;
            if (rf & RenderFlags.Update) {
              tplRef = ɵɵreference(1);
              ɵɵelementProperty(3, 'tplRef', ɵɵbind(tplRef));
              ɵɵelementProperty(3, 'name', ɵɵbind(cmp.name));
            }
          },
          directives: [Child, DirectiveWithVCRef]
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html).toEqual('<child><div><header vcref="">blah</header></div></child>');

      directiveInstance !.vcref.createEmbeddedView(directiveInstance !.tplRef, fixture.component);
      fixture.update();
      expect(fixture.html)
          .toEqual('<child><div><header vcref="">blah</header><span>bar</span></div></child>');
    });

    it('should project the ViewContainerRef content along its host, in a view', () => {
      @Component({
        selector: 'child-with-view',
        template: `
          Before (inside)-
          % if (show) {
            <ng-content></ng-content>
          % }
          After (inside)
        `
      })
      class ChildWithView {
        show: boolean = true;
        static ngComponentDef = ɵɵdefineComponent({
          type: ChildWithView,
          encapsulation: ViewEncapsulation.None,
          selectors: [['child-with-view']],
          factory: () => new ChildWithView(),
          consts: 3,
          vars: 0,
          template: (rf: RenderFlags, cmp: ChildWithView) => {
            if (rf & RenderFlags.Create) {
              ɵɵprojectionDef();
              ɵɵtext(0, 'Before (inside)-');
              ɵɵcontainer(1);
              ɵɵtext(2, 'After (inside)');
            }
            if (rf & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(1);
              if (cmp.show) {
                let rf0 = ɵɵembeddedViewStart(0, 1, 0);
                if (rf0 & RenderFlags.Create) {
                  ɵɵprojection(0);
                }
                ɵɵembeddedViewEnd();
              }
              ɵɵcontainerRefreshEnd();
            }
          }
        });
      }

      @Component({
        selector: 'parent',
        template: `
          <ng-template #foo>
              <span>{{name}}</span>
          </ng-template>
          <child-with-view>
            Before projected
            <header vcref [tplRef]="foo" [name]="name">blah</header>
            After projected
          </child-with-view>`
      })
      class Parent {
        name: string = 'bar';
        static ngComponentDef = ɵɵdefineComponent({
          type: Parent,
          encapsulation: ViewEncapsulation.None,
          selectors: [['parent']],
          factory: () => new Parent(),
          consts: 7,
          vars: 2,
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              ɵɵtemplate(
                  0, embeddedTemplate, 2, 1, 'ng-template', undefined, ['foo', ''],
                  ɵɵtemplateRefExtractor);
              ɵɵelementStart(2, 'child-with-view');
              ɵɵtext(3, 'Before projected');
              ɵɵelementStart(4, 'header', ['vcref', '']);
              ɵɵtext(5, 'blah');
              ɵɵelementEnd();
              ɵɵtext(6, 'After projected-');
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const tplRef = ɵɵreference(1);
              ɵɵelementProperty(4, 'tplRef', ɵɵbind(tplRef));
              ɵɵelementProperty(4, 'name', ɵɵbind(cmp.name));
            }
          },
          directives: [ChildWithView, DirectiveWithVCRef]
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html)
          .toEqual(
              '<child-with-view>Before (inside)-Before projected<header vcref="">blah</header>After projected-After (inside)</child-with-view>');

      directiveInstance !.vcref.createEmbeddedView(directiveInstance !.tplRef, fixture.component);
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<child-with-view>Before (inside)-Before projected<header vcref="">blah</header><span>bar</span>After projected-After (inside)</child-with-view>');
    });

    describe('with select', () => {
      @Component({
        selector: 'child-with-selector',
        template: `
          <first><ng-content select="header"></ng-content></first>
          <second><ng-content></ng-content></second>`
      })
      class ChildWithSelector {
        static ngComponentDef = ɵɵdefineComponent({
          type: ChildWithSelector,
          encapsulation: ViewEncapsulation.None,
          selectors: [['child-with-selector']],
          factory: () => new ChildWithSelector(),
          consts: 4,
          vars: 0,
          template: (rf: RenderFlags, cmp: ChildWithSelector) => {
            if (rf & RenderFlags.Create) {
              ɵɵprojectionDef([[['header']], '*']);
              ɵɵelementStart(0, 'first');
              { ɵɵprojection(1, 0); }
              ɵɵelementEnd();
              ɵɵelementStart(2, 'second');
              { ɵɵprojection(3, 1); }
              ɵɵelementEnd();
            }
          },
          directives: [ChildWithSelector, DirectiveWithVCRef]
        });
      }

      it('should project the ViewContainerRef content along its host, when the host matches a selector',
         () => {
           @Component({
             selector: 'parent',
             template: `
            <ng-template #foo>
                <span>{{name}}</span>
              </ng-template>
            <child-with-selector><header vcref [tplRef]="foo" [name]="name">blah</header></child-with-selector>`
           })
           class Parent {
             name: string = 'bar';
             static ngComponentDef = ɵɵdefineComponent({
               type: Parent,
               encapsulation: ViewEncapsulation.None,
               selectors: [['parent']],
               factory: () => new Parent(),
               consts: 5,
               vars: 2,
               template: (rf: RenderFlags, cmp: Parent) => {
                 let tplRef: any;
                 if (rf & RenderFlags.Create) {
                   ɵɵtemplate(
                       0, embeddedTemplate, 2, 1, 'ng-template', null, ['foo', ''],
                       ɵɵtemplateRefExtractor);
                   ɵɵelementStart(2, 'child-with-selector');
                   ɵɵelementStart(3, 'header', ['vcref', '']);
                   ɵɵtext(4, 'blah');
                   ɵɵelementEnd();
                   ɵɵelementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                   tplRef = ɵɵreference(1);
                   ɵɵelementProperty(3, 'tplRef', ɵɵbind(tplRef));
                   ɵɵelementProperty(3, 'name', ɵɵbind(cmp.name));
                 }
               },
               directives: [ChildWithSelector, DirectiveWithVCRef]
             });
           }

           const fixture = new ComponentFixture(Parent);
           expect(fixture.html)
               .toEqual(
                   '<child-with-selector><first><header vcref="">blah</header></first><second></second></child-with-selector>');

           directiveInstance !.vcref.createEmbeddedView(
               directiveInstance !.tplRef, fixture.component);
           fixture.update();
           expect(fixture.html)
               .toEqual(
                   '<child-with-selector><first><header vcref="">blah</header><span>bar</span></first><second></second></child-with-selector>');
         });

      it('should not project the ViewContainerRef content, when the host does not match a selector',
         () => {
           @Component({
             selector: 'parent',
             template: `
            <ng-template #foo>
                <span>{{name}}</span>
              </ng-template>
            <child-with-selector><footer vcref [tplRef]="foo" [name]="name">blah</footer></child-with-selector>`
           })
           class Parent {
             name: string = 'bar';
             static ngComponentDef = ɵɵdefineComponent({
               type: Parent,
               encapsulation: ViewEncapsulation.None,
               selectors: [['parent']],
               factory: () => new Parent(),
               consts: 5,
               vars: 2,
               template: (rf: RenderFlags, cmp: Parent) => {
                 let tplRef: any;
                 if (rf & RenderFlags.Create) {
                   ɵɵtemplate(
                       0, embeddedTemplate, 2, 1, 'ng-template', null, ['foo', ''],
                       ɵɵtemplateRefExtractor);
                   ɵɵelementStart(2, 'child-with-selector');
                   ɵɵelementStart(3, 'footer', ['vcref', '']);
                   ɵɵtext(4, 'blah');
                   ɵɵelementEnd();
                   ɵɵelementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                   tplRef = ɵɵreference(1);
                   ɵɵelementProperty(3, 'tplRef', ɵɵbind(tplRef));
                   ɵɵelementProperty(3, 'name', ɵɵbind(cmp.name));
                 }
               },
               directives: [ChildWithSelector, DirectiveWithVCRef]
             });
           }

           const fixture = new ComponentFixture(Parent);
           expect(fixture.html)
               .toEqual(
                   '<child-with-selector><first></first><second><footer vcref="">blah</footer></second></child-with-selector>');

           directiveInstance !.vcref.createEmbeddedView(
               directiveInstance !.tplRef, fixture.component);
           fixture.update();
           expect(fixture.html)
               .toEqual(
                   '<child-with-selector><first></first><second><footer vcref="">blah</footer><span>bar</span></second></child-with-selector>');
         });
    });
  });

  describe('life cycle hooks', () => {

    // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
    const log: string[] = [];

    @Component({selector: 'hooks', template: `{{name}}`})
    class ComponentWithHooks {
      // TODO(issue/24571): remove '!'.
      name !: string;

      private log(msg: string) { log.push(msg); }

      ngOnChanges() { this.log('onChanges-' + this.name); }
      ngOnInit() { this.log('onInit-' + this.name); }
      ngDoCheck() { this.log('doCheck-' + this.name); }

      ngAfterContentInit() { this.log('afterContentInit-' + this.name); }
      ngAfterContentChecked() { this.log('afterContentChecked-' + this.name); }

      ngAfterViewInit() { this.log('afterViewInit-' + this.name); }
      ngAfterViewChecked() { this.log('afterViewChecked-' + this.name); }

      ngOnDestroy() { this.log('onDestroy-' + this.name); }

      static ngComponentDef = ɵɵdefineComponent({
        type: ComponentWithHooks,
        encapsulation: ViewEncapsulation.None,
        selectors: [['hooks']],
        factory: () => new ComponentWithHooks(),
        consts: 1,
        vars: 1,
        template: (rf: RenderFlags, cmp: ComponentWithHooks) => {
          if (rf & RenderFlags.Create) {
            ɵɵtext(0);
          }
          if (rf & RenderFlags.Update) {
            ɵɵtextBinding(0, ɵɵinterpolation1('', cmp.name, ''));
          }
        },
        features: [ɵɵNgOnChangesFeature()],
        inputs: {name: 'name'}
      });
    }

    it('should call all hooks in correct order when creating with createEmbeddedView', () => {
      function SomeComponent_Template_0(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'hooks');
        }
        if (rf & RenderFlags.Update) {
          ɵɵelementProperty(0, 'name', ɵɵbind('C'));
        }
      }

      @Component({
        template: `
          <ng-template #foo>
            <hooks [name]="'C'"></hooks>
          </ng-template>
          <hooks vcref [tplRef]="foo" [name]="'A'"></hooks>
          <hooks [name]="'B'"></hooks>
        `
      })
      class SomeComponent {
        static ngComponentDef = ɵɵdefineComponent({
          type: SomeComponent,
          selectors: [['some-comp']],
          factory: () => new SomeComponent(),
          consts: 4,
          vars: 3,
          template: (rf: RenderFlags, cmp: SomeComponent) => {
            if (rf & RenderFlags.Create) {
              ɵɵtemplate(
                  0, SomeComponent_Template_0, 1, 1, 'ng-template', [], ['foo', ''],
                  ɵɵtemplateRefExtractor);
              ɵɵelement(2, 'hooks', ['vcref', '']);
              ɵɵelement(3, 'hooks');
            }
            if (rf & RenderFlags.Update) {
              const tplRef = ɵɵreference(1);
              ɵɵelementProperty(2, 'tplRef', ɵɵbind(tplRef));
              ɵɵelementProperty(2, 'name', ɵɵbind('A'));
              ɵɵelementProperty(3, 'name', ɵɵbind('B'));
            }
          },
          directives: [ComponentWithHooks, DirectiveWithVCRef],
          features: [ɵɵNgOnChangesFeature()],
        });
      }

      log.length = 0;

      const fixture = new ComponentFixture(SomeComponent);
      expect(log).toEqual([
        'onChanges-A', 'onInit-A', 'doCheck-A', 'onChanges-B', 'onInit-B', 'doCheck-B',
        'afterContentInit-A', 'afterContentChecked-A', 'afterContentInit-B',
        'afterContentChecked-B', 'afterViewInit-A', 'afterViewChecked-A', 'afterViewInit-B',
        'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      directiveInstance !.vcref.createEmbeddedView(directiveInstance !.tplRef, fixture.component);
      expect(fixture.html).toEqual('<hooks vcref="">A</hooks><hooks></hooks><hooks>B</hooks>');
      expect(log).toEqual([]);

      log.length = 0;
      fixture.update();
      expect(fixture.html).toEqual('<hooks vcref="">A</hooks><hooks>C</hooks><hooks>B</hooks>');
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'onChanges-C', 'onInit-C', 'doCheck-C', 'afterContentInit-C',
        'afterContentChecked-C', 'afterViewInit-C', 'afterViewChecked-C', 'afterContentChecked-A',
        'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-C', 'afterContentChecked-C', 'afterViewChecked-C',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      const viewRef = directiveInstance !.vcref.detach(0);
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      directiveInstance !.vcref.insert(viewRef !);
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-C', 'afterContentChecked-C', 'afterViewChecked-C',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      directiveInstance !.vcref.remove(0);
      fixture.update();
      expect(log).toEqual([
        'onDestroy-C', 'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);
    });

    it('should call all hooks in correct order when creating with createComponent', () => {
      @Component({
        template: `
          <hooks vcref [name]="'A'"></hooks>
          <hooks [name]="'B'"></hooks>
        `
      })
      class SomeComponent {
        static ngComponentDef = ɵɵdefineComponent({
          type: SomeComponent,
          encapsulation: ViewEncapsulation.None,
          selectors: [['some-comp']],
          factory: () => new SomeComponent(),
          consts: 2,
          vars: 2,
          template: (rf: RenderFlags, cmp: SomeComponent) => {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'hooks', ['vcref', '']);
              ɵɵelement(1, 'hooks');
            }
            if (rf & RenderFlags.Update) {
              ɵɵelementProperty(0, 'name', ɵɵbind('A'));
              ɵɵelementProperty(1, 'name', ɵɵbind('B'));
            }
          },
          directives: [ComponentWithHooks, DirectiveWithVCRef],
          features: [ɵɵNgOnChangesFeature()],
        });
      }

      log.length = 0;

      const fixture = new ComponentFixture(SomeComponent);
      expect(log).toEqual([
        'onChanges-A', 'onInit-A', 'doCheck-A', 'onChanges-B', 'onInit-B', 'doCheck-B',
        'afterContentInit-A', 'afterContentChecked-A', 'afterContentInit-B',
        'afterContentChecked-B', 'afterViewInit-A', 'afterViewChecked-A', 'afterViewInit-B',
        'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      const componentRef = directiveInstance !.vcref.createComponent(
          directiveInstance !.cfr.resolveComponentFactory(ComponentWithHooks));
      expect(fixture.html).toEqual('<hooks vcref="">A</hooks><hooks></hooks><hooks>B</hooks>');
      expect(log).toEqual([]);

      componentRef.instance.name = 'D';
      log.length = 0;
      fixture.update();
      expect(fixture.html).toEqual('<hooks vcref="">A</hooks><hooks>D</hooks><hooks>B</hooks>');
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'onInit-D', 'doCheck-D', 'afterContentInit-D',
        'afterContentChecked-D', 'afterViewInit-D', 'afterViewChecked-D', 'afterContentChecked-A',
        'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-D', 'afterContentChecked-D', 'afterViewChecked-D',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      const viewRef = directiveInstance !.vcref.detach(0);
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      directiveInstance !.vcref.insert(viewRef !);
      fixture.update();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-D', 'afterContentChecked-D', 'afterViewChecked-D',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      directiveInstance !.vcref.remove(0);
      fixture.update();
      expect(log).toEqual([
        'onDestroy-D', 'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);
    });
  });

  describe('host bindings', () => {

    it('should support host bindings on dynamically created components', () => {

      @Component(
          {selector: 'host-bindings', host: {'id': 'attribute', '[title]': 'title'}, template: ``})
      class HostBindingCmpt {
        title = 'initial';

        static ngComponentDef = ɵɵdefineComponent({
          type: HostBindingCmpt,
          selectors: [['host-bindings']],
          factory: () => new HostBindingCmpt(),
          consts: 0,
          vars: 0,
          template: (rf: RenderFlags, cmp: HostBindingCmpt) => {},
          hostBindings: function(rf: RenderFlags, ctx: HostBindingCmpt, elIndex: number) {
            if (rf & RenderFlags.Create) {
              ɵɵelementHostAttrs(['id', 'attribute']);
              ɵɵallocHostVars(1);
            }
            if (rf & RenderFlags.Update) {
              ɵɵelementProperty(elIndex, 'title', ɵɵbind(ctx.title));
            }
          },
        });
      }

      @Component({
        template: `
          <ng-template vcref></ng-template>
        `
      })
      class AppCmpt {
        static ngComponentDef = ɵɵdefineComponent({
          type: AppCmpt,
          selectors: [['app']],
          factory: () => new AppCmpt(),
          consts: 1,
          vars: 0,
          template: (rf: RenderFlags, cmp: AppCmpt) => {
            if (rf & RenderFlags.Create) {
              ɵɵtemplate(0, null, 0, 0, 'ng-template', ['vcref', '']);
            }
          },
          directives: [HostBindingCmpt, DirectiveWithVCRef]
        });
      }

      const fixture = new ComponentFixture(AppCmpt);
      expect(fixture.html).toBe('');

      const componentRef = directiveInstance !.vcref.createComponent(
          directiveInstance !.cfr.resolveComponentFactory(HostBindingCmpt));
      fixture.update();
      expect(fixture.html).toBe('<host-bindings id="attribute" title="initial"></host-bindings>');


      componentRef.instance.title = 'changed';
      fixture.update();
      expect(fixture.html).toBe('<host-bindings id="attribute" title="changed"></host-bindings>');
    });

  });

  describe('view engine compatibility', () => {

    @Component({selector: 'app', template: ''})
    class AppCmpt {
      static ngComponentDef = ɵɵdefineComponent({
        type: AppCmpt,
        selectors: [['app']],
        factory: () => new AppCmpt(
                     ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
        consts: 0,
        vars: 0,
        template: (rf: RenderFlags, cmp: AppCmpt) => {}
      });

      constructor(private _vcRef: ViewContainerRef, private _cfResolver: ComponentFactoryResolver) {
      }

      insert(comp: any) {
        this._vcRef.createComponent(this._cfResolver.resolveComponentFactory(comp));
      }

      clear() { this._vcRef.clear(); }

      getVCRefParentInjector() { return this._vcRef.parentInjector; }
    }

    // https://stackblitz.com/edit/angular-xxpffd?file=src%2Findex.html
    it('should allow injecting VCRef into the root (bootstrapped) component', () => {

      const DynamicComponent =
          createComponent('dynamic-cmpt', function(rf: RenderFlags, parent: any) {
            if (rf & RenderFlags.Create) {
              ɵɵtext(0, 'inserted dynamically');
            }
          }, 1, 0);


      const fixture = new ComponentFixture(AppCmpt);
      expect(fixture.outerHtml).toBe('<div host="mark"></div>');

      fixture.component.insert(DynamicComponent);
      fixture.update();
      expect(fixture.outerHtml)
          .toBe('<div host="mark"></div><dynamic-cmpt>inserted dynamically</dynamic-cmpt>');

      fixture.component.clear();
      fixture.update();
      expect(fixture.outerHtml).toBe('<div host="mark"></div>');
    });

    it('should allow getting the parentInjector of the VCRef which was injected into the root (bootstrapped) component',
       () => {
         const fixture = new ComponentFixture(AppCmpt, {
           injector: {
             get: (token: any) => {
               if (token === 'foo') return 'bar';
             }
           }
         });
         expect(fixture.outerHtml).toBe('<div host="mark"></div>');

         const parentInjector = fixture.component.getVCRefParentInjector();
         expect(parentInjector.get('foo')).toEqual('bar');
       });

    it('should check bindings for components dynamically created by root component', () => {
      class DynamicCompWithBindings {
        checkCount = 0;

        ngDoCheck() { this.checkCount++; }

        /** check count: {{ checkCount }} */
        static ngComponentDef = ɵɵdefineComponent({
          type: DynamicCompWithBindings,
          selectors: [['dynamic-cmpt-with-bindings']],
          factory: () => new DynamicCompWithBindings(),
          consts: 1,
          vars: 1,
          template: (rf: RenderFlags, ctx: DynamicCompWithBindings) => {
            if (rf & RenderFlags.Create) {
              ɵɵtext(0);
            }
            if (rf & RenderFlags.Update) {
              ɵɵtextBinding(0, ɵɵinterpolation1('check count: ', ctx.checkCount, ''));
            }
          }
        });
      }

      const fixture = new ComponentFixture(AppCmpt);
      expect(fixture.outerHtml).toBe('<div host="mark"></div>');

      fixture.component.insert(DynamicCompWithBindings);
      fixture.update();
      expect(fixture.outerHtml)
          .toBe(
              '<div host="mark"></div><dynamic-cmpt-with-bindings>check count: 1</dynamic-cmpt-with-bindings>');

      fixture.update();
      expect(fixture.outerHtml)
          .toBe(
              '<div host="mark"></div><dynamic-cmpt-with-bindings>check count: 2</dynamic-cmpt-with-bindings>');
    });

    it('should create deep DOM tree immediately for dynamically created components', () => {
      let name = 'text';
      const Child = createComponent('child', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'div');
          { ɵɵtext(1); }
          ɵɵelementEnd();
        }
        if (rf & RenderFlags.Update) {
          ɵɵtextBinding(1, ɵɵbind(name));
        }
      }, 2, 1);

      const DynamicCompWithChildren =
          createComponent('dynamic-cmpt-with-children', (rf: RenderFlags, ctx: any) => {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'child');
            }
          }, 1, 0, [Child]);

      const fixture = new ComponentFixture(AppCmpt);
      expect(fixture.outerHtml).toBe('<div host="mark"></div>');

      fixture.component.insert(DynamicCompWithChildren);
      expect(fixture.outerHtml)
          .toBe(
              '<div host="mark"></div><dynamic-cmpt-with-children><child><div></div></child></dynamic-cmpt-with-children>');

      fixture.update();
      expect(fixture.outerHtml)
          .toBe(
              '<div host="mark"></div><dynamic-cmpt-with-children><child><div>text</div></child></dynamic-cmpt-with-children>');
    });

    it('should support view queries for dynamically created components', () => {
      let dynamicComp !: DynamicCompWithViewQueries;
      let fooEl !: RElement;

      class DynamicCompWithViewQueries {
        // @ViewChildren('foo')
        foo !: QueryList<any>;

        static ngComponentDef = ɵɵdefineComponent({
          type: DynamicCompWithViewQueries,
          selectors: [['dynamic-cmpt-with-view-queries']],
          factory: () => dynamicComp = new DynamicCompWithViewQueries(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, ctx: DynamicCompWithViewQueries) => {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['bar', ''], ['foo', '']);
            }
            // testing only
            fooEl = getNativeByIndex(0, getLView()) as RElement;
          },
          viewQuery: function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['foo'], true, null);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadViewQuery<QueryList<any>>()) &&
                  (ctx.foo = tmp as QueryList<any>);
            }
          }
        });
      }

      const fixture = new ComponentFixture(AppCmpt);

      fixture.component.insert(DynamicCompWithViewQueries);
      fixture.update();

      expect(dynamicComp.foo.first.nativeElement).toEqual(fooEl as any);
    });

  });

  describe('view destruction', () => {
    class CompWithListenerThatDestroysItself {
      constructor(private viewRef: ViewRef) {}

      onClick() {}

      ngOnDestroy() { this.viewRef.destroy(); }

      static ngComponentDef = ɵɵdefineComponent({
        type: CompWithListenerThatDestroysItself,
        selectors: [['comp-with-listener-and-on-destroy']],
        consts: 2,
        vars: 0,
        /** <button (click)="onClick()"> Click me </button> */
        template: function CompTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'button');
            {
              ɵɵlistener('click', function() { return ctx.onClick(); });
              ɵɵtext(1, 'Click me');
            }
            ɵɵelementEnd();
          }
        },
        // We want the ViewRef, so we rely on the knowledge that `ViewRef` is actually given
        // when injecting `ChangeDetectorRef`.
        factory: () => new CompWithListenerThatDestroysItself(
                     ɵɵdirectiveInject(ChangeDetectorRef as any)),
      });
    }


    it('should not error when destroying a view with listeners twice', () => {
      const CompWithChildListener = createComponent('test-app', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'comp-with-listener-and-on-destroy');
        }
      }, 1, 0, [CompWithListenerThatDestroysItself]);

      const fixture = new ComponentFixture(CompWithChildListener);
      fixture.update();

      // Destroying the parent view will also destroy all of its children views and call their
      // onDestroy hooks. Here, our child view attempts to destroy itself *again* in its onDestroy.
      // This test exists to verify that no errors are thrown when doing this. We want the test
      // component to destroy its own view in onDestroy because the destroy hooks happen as a
      // *part of* view destruction. We also ensure that the test component has at least one
      // listener so that it runs the event listener cleanup code path.
      fixture.destroy();
    });
  });
});
