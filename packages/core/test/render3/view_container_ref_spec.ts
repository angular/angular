/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef, ViewContainerRef} from '../../src/core';
import {getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from '../../src/render3/di';
import {defineComponent, defineDirective, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, load, loadDirective, text, textBinding} from '../../src/render3/instructions';

import {ComponentFixture, TemplateFixture} from './render_util';

describe('ViewContainerRef', () => {
  describe('API', () => {
    let directiveInstance: DirectiveWithVCRef|null;

    beforeEach(() => { directiveInstance = null; });

    function embeddedTemplate(ctx: any, cm: boolean) {
      if (cm) {
        text(0);
      }
      textBinding(0, ctx.name);
    }

    class DirectiveWithVCRef {
      static ngDirectiveDef = defineDirective({
        type: DirectiveWithVCRef,
        selectors: [['', 'vcref', '']],
        factory: () => directiveInstance = new DirectiveWithVCRef(injectViewContainerRef()),
        inputs: {tplRef: 'tplRef'}
      });

      tplRef: TemplateRef<{}>;

      constructor(public vcref: ViewContainerRef) {}
    }

    function createView(s: string, index?: number) {
      directiveInstance !.vcref.createEmbeddedView(directiveInstance !.tplRef, {name: s}, index);
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
      elementStart(1, 'p', ['vcref', '']);
      elementEnd();
    }

    function updateTemplate() {
      const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
      elementProperty(1, 'tplRef', bind(tplRef));
    }

    describe('createEmbeddedView (incl. insert)', () => {
      it('should work on elements', () => {
        function createTemplate() {
          container(0, embeddedTemplate);
          elementStart(1, 'header', ['vcref', '']);
          elementEnd();
          elementStart(2, 'footer');
          elementEnd();
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
        class HeaderComponent {
          static ngComponentDef = defineComponent({
            type: HeaderComponent,
            selectors: [['header-cmp']],
            factory: () => new HeaderComponent(),
            template: (cmp: HeaderComponent, cm: boolean) => {}
          });
        }

        function createTemplate() {
          container(0, embeddedTemplate);
          elementStart(1, 'header-cmp', ['vcref', '']);
          elementEnd();
          elementStart(2, 'footer');
          elementEnd();
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

      it('should work on containers', () => {
        function createTemplate() {
          container(0, embeddedTemplate, undefined, ['vcref', '']);
          elementStart(1, 'footer');
          elementEnd();
        }

        function updateTemplate() {
          const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
          elementProperty(0, 'tplRef', bind(tplRef));
          containerRefreshStart(0);
          if (embeddedViewStart(1)) {
            elementStart(0, 'header');
            elementEnd();
          }
          embeddedViewEnd();
          containerRefreshEnd();
        }

        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
        expect(fixture.html).toEqual('<header></header><footer></footer>');

        createView('A');
        fixture.update();
        expect(fixture.html).toEqual('<header></header>A<footer></footer>');

        createView('B');
        createView('C');
        fixture.update();
        expect(fixture.html).toEqual('<header></header>ABC<footer></footer>');

        createView('Y', 0);
        fixture.update();
        expect(fixture.html).toEqual('<header></header>YABC<footer></footer>');

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

    describe('detach', () => {
      it('should detach the right embedded view when an index is specified', () => {
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
        createView('A');
        createView('B');
        createView('C');
        createView('D');
        createView('E');
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCDE');

        directiveInstance !.vcref.detach(3);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCE');

        directiveInstance !.vcref.detach(0);
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>BCE');

        expect(() => { directiveInstance !.vcref.detach(-1); }).toThrow();
        expect(() => { directiveInstance !.vcref.detach(42); }).toThrow();
      });


      it('should detach the last embedded view when no index is specified', () => {
        const fixture = new TemplateFixture(createTemplate, updateTemplate, [DirectiveWithVCRef]);
        createView('A');
        createView('B');
        createView('C');
        createView('D');
        createView('E');
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCDE');

        directiveInstance !.vcref.detach();
        fixture.update();
        expect(fixture.html).toEqual('<p vcref=""></p>ABCD');
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
        fixture.hostElement.childNodes[1].nodeValue = '**A**';
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
  });
});
