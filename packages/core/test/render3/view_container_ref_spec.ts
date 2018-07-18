/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, Directive, EmbeddedViewRef, NgModuleRef, Pipe, PipeTransform, RendererFactory2, TemplateRef, ViewContainerRef, createInjector, defineInjector, ɵAPP_ROOT as APP_ROOT, ɵNgModuleDef as NgModuleDef} from '../../src/core';
import {getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from '../../src/render3/di';
import {AttributeMarker,NgOnChangesFeature, defineComponent, defineDirective, definePipe, injectComponentFactoryResolver, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, interpolation3, load, loadDirective, projection, projectionDef, reserveSlots, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {NgModuleFactory} from '../../src/render3/ng_module_ref';
import {pipe, pipeBind1} from '../../src/render3/pipe';
import {NgForOf} from '../../test/render3/common_with_def';

import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, TemplateFixture, createComponent} from './render_util';

describe('ViewContainerRef', () => {
  let directiveInstance: DirectiveWithVCRef|null;

  beforeEach(() => { directiveInstance = null; });

  class DirectiveWithVCRef {
    static ngDirectiveDef = defineDirective({
      type: DirectiveWithVCRef,
      selectors: [['', 'vcref', '']],
      factory: () => directiveInstance = new DirectiveWithVCRef(
                   injectViewContainerRef(), injectComponentFactoryResolver()),
      inputs: {tplRef: 'tplRef'}
    });

    // TODO(issue/24571): remove '!'.
    tplRef !: TemplateRef<{}>;

    // injecting a ViewContainerRef to create a dynamic container in which embedded views will be
    // created
    constructor(public vcref: ViewContainerRef, public cfr: ComponentFactoryResolver) {}
  }

  describe('API', () => {
    function embeddedTemplate(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        text(0);
      }
      if (rf & RenderFlags.Update) {
        textBinding(0, bind(ctx.name));
      }
    }

    function createView(s: string, index?: number): EmbeddedViewRef<any> {
      return directiveInstance !.vcref.createEmbeddedView(
          directiveInstance !.tplRef, {name: s}, index);
    }

    /**
     * <ng-template #foo>
     *   {{name}}
     * </ng-template>
     * <p vcref="" [tplRef]="foo">
     * </p>
     */
    function createTemplate() {
      container(0, embeddedTemplate);
      element(1, 'p', ['vcref', '']);
    }

    function updateTemplate() {
      const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
      elementProperty(1, 'tplRef', bind(tplRef));
    }

    describe('createEmbeddedView (incl. insert)', () => {
      it('should work on elements', () => {
        function createTemplate() {
          container(0, embeddedTemplate);
          element(1, 'header', ['vcref', '']);
          element(2, 'footer');
        }

        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
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

        function createTemplate() {
          container(0, embeddedTemplate);
          element(1, 'header-cmp', ['vcref', '']);
          element(2, 'footer');
        }

        const fixture = new TemplateFixture(
            createTemplate, updateTemplate, [HeaderComponent, DirectiveWithVCRef]);
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

        function createTemplate() {
          container(0, embeddedTemplate);
          element(1, 'div', ['vcref', '']);
          element(2, 'div', ['vcref', '']);

          // for testing only:
          firstDir = loadDirective(0);
          secondDir = loadDirective(1);
        }

        function update() {
          // Hack until we can create local refs to templates
          const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
          elementProperty(1, 'tplRef', bind(tplRef));
          elementProperty(2, 'tplRef', bind(tplRef));
        }

        const fixture = new TemplateFixture(createTemplate, update, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<div vcref=""></div><div vcref=""></div>');

        firstDir !.vcref.createEmbeddedView(firstDir !.tplRef, {name: 'A'});
        secondDir !.vcref.createEmbeddedView(secondDir !.tplRef, {name: 'B'});
        fixture.update();
        expect(fixture.html).toEqual('<div vcref=""></div>A<div vcref=""></div>B');
      });

      it('should work on containers', () => {
        function createTemplate() {
          container(0, embeddedTemplate, undefined, ['vcref', '']);
          element(1, 'footer');
        }

        function updateTemplate() {
          const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
          elementProperty(0, 'tplRef', bind(tplRef));
          containerRefreshStart(0);
          containerRefreshEnd();
        }

        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
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

           function EmbeddedTemplateA(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               text(0, 'A');
             }
           }

           function EmbeddedTemplateB(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
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
             // TODO(issue/24571): remove '!'.
             testDir !: TestDirective;
             static ngComponentDef = defineComponent({
               type: TestComponent,
               selectors: [['test-cmp']],
               factory: () => new TestComponent(),
               template: (rf: RenderFlags, cmp: TestComponent) => {
                 if (rf & RenderFlags.Create) {
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

             insertTpl2(ctx: {}) {
               const viewRef = this._tplRef.createEmbeddedView(ctx);
               this._vcRef.insert(viewRef);
             }

             remove(index?: number) { this._vcRef.remove(index); }
           }

           function EmbeddedTemplateA(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               text(0, 'A');
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
             static ngComponentDef = defineComponent({
               type: TestComponent,
               selectors: [['test-cmp']],
               factory: () => new TestComponent(),
               template: (rf: RenderFlags, cmp: TestComponent) => {
                 if (rf & RenderFlags.Create) {
                   text(0, 'before|');
                   container(1, EmbeddedTemplateA, undefined, ['testdir', '']);
                   container(2);
                   text(3, '|after');
                 }
                 if (rf & RenderFlags.Update) {
                   containerRefreshStart(2);
                   {
                     if (cmp.condition) {
                       let rf1 = embeddedViewStart(0);
                       {
                         if (rf1 & RenderFlags.Create) {
                           text(0, 'B');
                         }
                       }
                       embeddedViewEnd();
                     }
                   }
                   containerRefreshEnd();
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

          static ngComponentDef = defineComponent({
            type: Child,
            selectors: [['child']],
            factory: () => new Child(),
            template: (rf: RenderFlags, cmp: Child) => {
              if (rf & RenderFlags.Create) {
                text(0);
              }
              if (rf & RenderFlags.Update) {
                textBinding(0, interpolation1('', cmp.name, ''));
              }
            },
            inputs: {name: 'name'}
          });
        }

        @Pipe({name: 'starPipe'})
        class StarPipe implements PipeTransform {
          transform(value: any) { return `**${value}**`; }

          static ngPipeDef = definePipe({
            name: 'starPipe',
            type: StarPipe,
            factory: function StarPipe_Factory() { return new StarPipe(); },
          });
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
          static ngComponentDef = defineComponent({
            type: SomeComponent,
            selectors: [['some-comp']],
            factory: () => new SomeComponent(),
            template: (rf: RenderFlags, cmp: SomeComponent) => {
              if (rf & RenderFlags.Create) {
                container(0, (rf: RenderFlags, ctx: any) => {
                  if (rf & RenderFlags.Create) {
                    element(0, 'child');
                    pipe(1, 'starPipe');
                    reserveSlots(2);
                  }
                  if (rf & RenderFlags.Update) {
                    elementProperty(0, 'name', bind(pipeBind1(1, 2, 'C')));
                  }
                });
                pipe(1, 'starPipe');
                element(2, 'child', ['vcref', '']);
                pipe(3, 'starPipe');
                element(4, 'child');
                reserveSlots(4);
              }
              if (rf & RenderFlags.Update) {
                const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
                elementProperty(2, 'tplRef', bind(tplRef));
                elementProperty(2, 'name', bind(pipeBind1(1, 2, 'A')));
                elementProperty(4, 'name', bind(pipeBind1(1, 4, 'B')));
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

        static ngDirectiveDef = defineDirective({
          type: InsertionDir,
          selectors: [['', 'tplDir', '']],
          factory: () => new InsertionDir(injectViewContainerRef()),
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

             static ngComponentDef = defineComponent({
               type: Child,
               selectors: [['child']],
               factory: () => child = new Child(),
               template: function(rf: RenderFlags, ctx: any) {
                 if (rf & RenderFlags.Create) {
                   elementStart(0, 'div', [AttributeMarker.SelectOnly, 'tplDir']);
                   { text(1); }
                   elementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                   elementProperty(0, 'tplDir', bind(ctx.tpl));
                   textBinding(1, bind(ctx.name));
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
               container(0, fooTemplate);
               elementStart(1, 'child');
               elementEnd();
             }

             if (rf & RenderFlags.Update) {
               // Hack until we have local refs for templates
               const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
               elementProperty(1, 'tpl', bind(tplRef));
             }

           }, [Child]);

           function fooTemplate(rf1: RenderFlags, ctx: any, parent: any) {
             if (rf1 & RenderFlags.Create) {
               elementStart(0, 'div');
               { text(1); }
               elementEnd();
             }

             if (rf1 & RenderFlags.Update) {
               textBinding(1, bind(parent.name));
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

          static ngComponentDef = defineComponent({
            type: LoopComp,
            selectors: [['loop-comp']],
            factory: () => new LoopComp(),
            template: function(rf: RenderFlags, loop: any) {
              if (rf & RenderFlags.Create) {
                container(0, () => {}, null, [AttributeMarker.SelectOnly, 'ngForOf']);
              }

              if (rf & RenderFlags.Update) {
                elementProperty(0, 'ngForOf', bind(loop.rows));
                elementProperty(0, 'ngForTemplate', bind(loop.tpl));
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
            container(0, rowTemplate);
            elementStart(1, 'loop-comp');
            elementEnd();
          }

          if (rf & RenderFlags.Update) {
            // Hack until we have local refs for templates
            const rowTemplateRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
            elementProperty(1, 'tpl', bind(rowTemplateRef));
            elementProperty(1, 'rows', bind(parent.rows));
          }

        }, [LoopComp]);

        function rowTemplate(rf1: RenderFlags, row: any, parent: any) {
          if (rf1 & RenderFlags.Create) {
            container(0, cellTemplate);
            elementStart(1, 'loop-comp');
            elementEnd();
          }

          if (rf1 & RenderFlags.Update) {
            // Hack until we have local refs for templates
            const cellTemplateRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
            elementProperty(1, 'tpl', bind(cellTemplateRef));
            elementProperty(1, 'rows', bind(row.$implicit.data));
          }
        }

        function cellTemplate(rf1: RenderFlags, cell: any, row: any, parent: any) {
          if (rf1 & RenderFlags.Create) {
            elementStart(0, 'div');
            { text(1); }
            elementEnd();
          }

          if (rf1 & RenderFlags.Update) {
            textBinding(
                1, interpolation3(
                       '', cell.$implicit, ' - ', row.$implicit.value, ' - ', parent.name, ''));
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
            createTemplate, updateTemplate, [DirectiveWithVCRef], null, null, rendererFactory);
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
            createTemplate, updateTemplate, [DirectiveWithVCRef], null, null, rendererFactory);
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
            createTemplate, updateTemplate, [DirectiveWithVCRef], null, null, rendererFactory);
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
            createTemplate, updateTemplate, [DirectiveWithVCRef], null, null, rendererFactory);
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
            createTemplate, updateTemplate, [DirectiveWithVCRef], null, null, rendererFactory);
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
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
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
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
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
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
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
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
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

      class EmbeddedComponent {
        static ngComponentDef = defineComponent({
          type: EmbeddedComponent,
          selectors: [['embedded-cmp']],
          factory: () => new EmbeddedComponent(),
          template: (rf: RenderFlags, cmp: EmbeddedComponent) => {
            templateExecutionCounter++;
            if (rf & RenderFlags.Create) {
              text(0, 'foo');
            }
          }
        });
      }

      it('should work without Injector and NgModuleRef', () => {
        templateExecutionCounter = 0;
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
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
        class MyAppModule {
          static ngInjectorDef = defineInjector({
            factory: () => new MyAppModule(),
            imports: [],
            providers: [
              {provide: APP_ROOT, useValue: true},
              {provide: RendererFactory2, useValue: getRendererFactory2(document)}
            ]
          });
          static ngModuleDef: NgModuleDef<any, any, any, any> = { bootstrap: [] } as any;
        }
        const myAppModuleFactory = new NgModuleFactory(MyAppModule);
        const ngModuleRef = myAppModuleFactory.create(null);

        class SomeModule {
          static ngInjectorDef = defineInjector({
            factory: () => new SomeModule(),
            providers: [{provide: NgModuleRef, useValue: ngModuleRef}]
          });
        }
        const injector = createInjector(SomeModule);

        templateExecutionCounter = 0;
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<p vcref=""></p>');
        expect(templateExecutionCounter).toEqual(0);

        directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(EmbeddedComponent), 0, injector);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
        expect(templateExecutionCounter).toEqual(2);

        directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(EmbeddedComponent), 0, undefined,
            undefined, ngModuleRef);
        fixture.update();
        expect(fixture.html)
            .toEqual(
                '<p vcref=""></p><embedded-cmp>foo</embedded-cmp><embedded-cmp>foo</embedded-cmp>');
        expect(templateExecutionCounter).toEqual(5);
      });

      class EmbeddedComponentWithNgContent {
        static ngComponentDef = defineComponent({
          type: EmbeddedComponentWithNgContent,
          selectors: [['embedded-cmp-with-ngcontent']],
          factory: () => new EmbeddedComponentWithNgContent(),
          template: (rf: RenderFlags, cmp: EmbeddedComponentWithNgContent) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              projection(0, 0);
              element(1, 'hr');
              projection(2, 1);
            }
          }
        });
      }

      it('should support projectable nodes', () => {
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<p vcref=""></p>');

        const myNode = document.createElement('div');
        const myText = document.createTextNode('bar');
        const myText2 = document.createTextNode('baz');
        myNode.appendChild(myText);
        myNode.appendChild(myText2);

        directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(EmbeddedComponentWithNgContent), 0,
            undefined, [[myNode]]);
        fixture.update();
        expect(fixture.html)
            .toEqual(
                '<p vcref=""></p><embedded-cmp-with-ngcontent><div>barbaz</div><hr></embedded-cmp-with-ngcontent>');
      });

      it('should support reprojection of projectable nodes', () => {
        class Reprojector {
          static ngComponentDef = defineComponent({
            type: Reprojector,
            selectors: [['reprojector']],
            factory: () => new Reprojector(),
            template: (rf: RenderFlags, cmp: Reprojector) => {
              if (rf & RenderFlags.Create) {
                projectionDef();
                elementStart(0, 'embedded-cmp-with-ngcontent');
                { projection(1, 0); }
                elementEnd();
              }
            },
            directives: [EmbeddedComponentWithNgContent]
          });
        }

        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<p vcref=""></p>');

        const myNode = document.createElement('div');
        const myText = document.createTextNode('bar');
        const myText2 = document.createTextNode('baz');
        myNode.appendChild(myText);
        myNode.appendChild(myText2);

        directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(Reprojector), 0, undefined, [[myNode]]);
        fixture.update();
        expect(fixture.html)
            .toEqual(
                '<p vcref=""></p><reprojector><embedded-cmp-with-ngcontent><div>barbaz</div><hr></embedded-cmp-with-ngcontent></reprojector>');
      });

      it('should support many projectable nodes with many slots', () => {
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<p vcref=""></p>');

        directiveInstance !.vcref.createComponent(
            directiveInstance !.cfr.resolveComponentFactory(EmbeddedComponentWithNgContent), 0,
            undefined, [
              [document.createTextNode('1'), document.createTextNode('2')],
              [document.createTextNode('3'), document.createTextNode('4')]
            ]);
        fixture.update();
        expect(fixture.html)
            .toEqual(
                '<p vcref=""></p><embedded-cmp-with-ngcontent>12<hr>34</embedded-cmp-with-ngcontent>');
      });
    });
  });

  describe('projection', () => {
    function embeddedTemplate(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'span');
        text(1);
        elementEnd();
      }
      textBinding(1, ctx.name);
    }

    it('should project the ViewContainerRef content along its host, in an element', () => {
      @Component({selector: 'child', template: '<div><ng-content></ng-content></div>'})
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          factory: () => new Child(),
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'div');
              { projection(1); }
              elementEnd();
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
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              container(0, embeddedTemplate);
              elementStart(1, 'child');
              elementStart(2, 'header', ['vcref', '']);
              text(3, 'blah');
              elementEnd();
              elementEnd();
            }
            let tplRef: any;
            if (rf & RenderFlags.Update) {
              tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
              elementProperty(2, 'tplRef', bind(tplRef));
              elementProperty(2, 'name', bind(cmp.name));
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
        static ngComponentDef = defineComponent({
          type: ChildWithView,
          selectors: [['child-with-view']],
          factory: () => new ChildWithView(),
          template: (rf: RenderFlags, cmp: ChildWithView) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              text(0, 'Before (inside)-');
              container(1);
              text(2, 'After (inside)');
            }
            if (rf & RenderFlags.Update) {
              containerRefreshStart(1);
              if (cmp.show) {
                let rf0 = embeddedViewStart(0);
                if (rf0 & RenderFlags.Create) {
                  projection(0);
                }
                embeddedViewEnd();
              }
              containerRefreshEnd();
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
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              container(0, embeddedTemplate);
              elementStart(1, 'child-with-view');
              text(2, 'Before projected');
              elementStart(3, 'header', ['vcref', '']);
              text(4, 'blah');
              elementEnd();
              text(5, 'After projected-');
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
              elementProperty(3, 'tplRef', bind(tplRef));
              elementProperty(3, 'name', bind(cmp.name));
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
        static ngComponentDef = defineComponent({
          type: ChildWithSelector,
          selectors: [['child-with-selector']],
          factory: () => new ChildWithSelector(),
          template: (rf: RenderFlags, cmp: ChildWithSelector) => {
            if (rf & RenderFlags.Create) {
              projectionDef([[['header']]], ['header']);
              elementStart(0, 'first');
              { projection(1, 1); }
              elementEnd();
              elementStart(2, 'second');
              { projection(3); }
              elementEnd();
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
             static ngComponentDef = defineComponent({
               type: Parent,
               selectors: [['parent']],
               factory: () => new Parent(),
               template: (rf: RenderFlags, cmp: Parent) => {
                 let tplRef: any;
                 if (rf & RenderFlags.Create) {
                   container(0, embeddedTemplate);
                   elementStart(1, 'child-with-selector');
                   elementStart(2, 'header', ['vcref', '']);
                   text(3, 'blah');
                   elementEnd();
                   elementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                   tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
                   elementProperty(2, 'tplRef', bind(tplRef));
                   elementProperty(2, 'name', bind(cmp.name));
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
             static ngComponentDef = defineComponent({
               type: Parent,
               selectors: [['parent']],
               factory: () => new Parent(),
               template: (rf: RenderFlags, cmp: Parent) => {
                 let tplRef: any;
                 if (rf & RenderFlags.Create) {
                   container(0, embeddedTemplate);
                   elementStart(1, 'child-with-selector');
                   elementStart(2, 'footer', ['vcref', '']);
                   text(3, 'blah');
                   elementEnd();
                   elementEnd();
                 }
                 if (rf & RenderFlags.Update) {
                   tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
                   elementProperty(2, 'tplRef', bind(tplRef));
                   elementProperty(2, 'name', bind(cmp.name));
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

      static ngComponentDef = defineComponent({
        type: ComponentWithHooks,
        selectors: [['hooks']],
        factory: () => new ComponentWithHooks(),
        template: (rf: RenderFlags, cmp: ComponentWithHooks) => {
          if (rf & RenderFlags.Create) {
            text(0);
          }
          if (rf & RenderFlags.Update) {
            textBinding(0, interpolation1('', cmp.name, ''));
          }
        },
        features: [NgOnChangesFeature],
        inputs: {name: 'name'}
      });
    }

    it('should call all hooks in correct order when creating with createEmbeddedView', () => {
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
        static ngComponentDef = defineComponent({
          type: SomeComponent,
          selectors: [['some-comp']],
          factory: () => new SomeComponent(),
          template: (rf: RenderFlags, cmp: SomeComponent) => {
            if (rf & RenderFlags.Create) {
              container(0, (rf: RenderFlags, ctx: any) => {
                if (rf & RenderFlags.Create) {
                  element(0, 'hooks');
                }
                if (rf & RenderFlags.Update) {
                  elementProperty(0, 'name', bind('C'));
                }
              });
              element(1, 'hooks', ['vcref', '']);
              element(2, 'hooks');
            }
            if (rf & RenderFlags.Update) {
              const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
              elementProperty(1, 'tplRef', bind(tplRef));
              elementProperty(1, 'name', bind('A'));
              elementProperty(2, 'name', bind('B'));
            }
          },
          directives: [ComponentWithHooks, DirectiveWithVCRef]
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
        static ngComponentDef = defineComponent({
          type: SomeComponent,
          selectors: [['some-comp']],
          factory: () => new SomeComponent(),
          template: (rf: RenderFlags, cmp: SomeComponent) => {
            if (rf & RenderFlags.Create) {
              element(0, 'hooks', ['vcref', '']);
              element(1, 'hooks');
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'name', bind('A'));
              elementProperty(1, 'name', bind('B'));
            }
          },
          directives: [ComponentWithHooks, DirectiveWithVCRef]
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
        'doCheck-A', 'doCheck-B', 'onChanges-D', 'onInit-D', 'doCheck-D', 'afterContentInit-D',
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
});
