/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Pipe, PipeTransform, TemplateRef, ViewContainerRef} from '../../src/core';
import {getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from '../../src/render3/di';
import {NgOnChangesFeature, defineComponent, defineDirective, definePipe, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, load, loadDirective, projection, projectionDef, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {pipe, pipeBind1} from '../../src/render3/pipe';

import {ComponentFixture, TemplateFixture} from './render_util';

describe('ViewContainerRef', () => {
  let directiveInstance: DirectiveWithVCRef|null;

  beforeEach(() => { directiveInstance = null; });

  class DirectiveWithVCRef {
    static ngDirectiveDef = defineDirective({
      type: DirectiveWithVCRef,
      selectors: [['', 'vcref', '']],
      factory: () => directiveInstance = new DirectiveWithVCRef(injectViewContainerRef()),
      inputs: {tplRef: 'tplRef'}
    });

    tplRef: TemplateRef<{}>;

    // injecting a ViewContainerRef to create a dynamic container in which embedded views will be
    // created
    constructor(public vcref: ViewContainerRef) {}
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
            template: (rf: RenderFlags, cmp: HeaderComponent) => {}
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
             testDir: TestDirective;
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

             remove(index?: number) { this._vcRef.remove(index); }
           }

           function EmbeddedTemplateA(rf: RenderFlags, ctx: any) {
             if (rf & RenderFlags.Create) {
               text(0, 'A');
             }
           }

           /**
            * before|
            * <ng-template directive>A<ng-template>
            * % if (condition) {
            *  B
            * % }
            * |after
            */
           class TestComponent {
             condition = false;
             testDir: TestDirective;
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

           directiveInstance !.insertTpl({});
           expect(fixture.html).toEqual('before|AA|after');

           fixture.component.condition = true;
           fixture.update();
           expect(fixture.html).toEqual('before|AAB|after');
         });

      it('should apply directives and pipes of the host view to the TemplateRef', () => {
        @Component({selector: 'child', template: `{{name}}`})
        class Child {
          name: string;

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
                    elementStart(0, 'child');
                    elementEnd();
                    pipe(1, 'starPipe');
                  }
                  if (rf & RenderFlags.Create) {
                    elementProperty(0, 'name', bind(pipeBind1(1, 'C')));
                  }
                });
                pipe(1, 'starPipe');
                elementStart(2, 'child', ['vcref', '']);
                elementEnd();
                elementStart(3, 'child');
                elementEnd();
              }
              if (rf & RenderFlags.Update) {
                const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
                elementProperty(2, 'tplRef', bind(tplRef));
                elementProperty(2, 'name', bind(pipeBind1(1, 'A')));
                elementProperty(3, 'name', bind(pipeBind1(1, 'B')));
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
              projectionDef(0);
              elementStart(1, 'div');
              { projection(2, 0); }
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
      % if (show) {
        <ng-content></ng-content>
      % }`
      })
      class ChildWithView {
        show: boolean = true;
        static ngComponentDef = defineComponent({
          type: ChildWithView,
          selectors: [['child-with-view']],
          factory: () => new ChildWithView(),
          template: (rf: RenderFlags, cmp: ChildWithView) => {
            if (rf & RenderFlags.Create) {
              projectionDef(0);
              container(1);
            }
            if (rf & RenderFlags.Update) {
              containerRefreshStart(1);
              if (cmp.show) {
                let rf0 = embeddedViewStart(0);
                if (rf0 & RenderFlags.Create) {
                  projection(0, 0);
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
            <header vcref [tplRef]="foo" [name]="name">blah</header>
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
              elementStart(2, 'header', ['vcref', '']);
              text(3, 'blah');
              elementEnd();
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
              elementProperty(2, 'tplRef', bind(tplRef));
              elementProperty(2, 'name', bind(cmp.name));
            }
          },
          directives: [ChildWithView, DirectiveWithVCRef]
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html)
          .toEqual('<child-with-view><header vcref="">blah</header></child-with-view>');

      directiveInstance !.vcref.createEmbeddedView(directiveInstance !.tplRef, fixture.component);
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<child-with-view><header vcref="">blah</header><span>bar</span></child-with-view>');
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
              projectionDef(0, [[['header']]], ['header']);
              elementStart(1, 'first');
              { projection(2, 0, 1); }
              elementEnd();
              elementStart(3, 'second');
              { projection(4, 0); }
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
    it('should call all hooks in correct order', () => {
      @Component({selector: 'hooks', template: `{{name}}`})
      class ComponentWithHooks {
        name: string;

        private log(msg: string) { log.push(msg); }

        ngOnChanges() { this.log('onChanges-' + this.name); }
        ngOnInit() { this.log('onInit-' + this.name); }
        ngDoCheck() { this.log('doCheck-' + this.name); }

        ngAfterContentInit() { this.log('afterContentInit-' + this.name); }
        ngAfterContentChecked() { this.log('afterContentChecked-' + this.name); }

        ngAfterViewInit() { this.log('afterViewInit-' + this.name); }
        ngAfterViewChecked() { this.log('afterViewChecked-' + this.name); }

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
          features: [NgOnChangesFeature()],
          inputs: {name: 'name'}
        });
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
        static ngComponentDef = defineComponent({
          type: SomeComponent,
          selectors: [['some-comp']],
          factory: () => new SomeComponent(),
          template: (rf: RenderFlags, cmp: SomeComponent) => {
            if (rf & RenderFlags.Create) {
              container(0, (rf: RenderFlags, ctx: any) => {
                if (rf & RenderFlags.Create) {
                  elementStart(0, 'hooks');
                  elementEnd();
                }
                if (rf & RenderFlags.Update) {
                  elementProperty(0, 'name', bind('C'));
                }
              });
              elementStart(1, 'hooks', ['vcref', '']);
              elementEnd();
              elementStart(2, 'hooks');
              elementEnd();
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
    });
  });
});
