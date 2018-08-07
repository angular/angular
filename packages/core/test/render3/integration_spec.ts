/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, TemplateRef, ViewContainerRef} from '@angular/core';
import {RenderFlags} from '@angular/core/src/render3';

import {getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from '../../src/render3/di';
import {AttributeMarker, defineComponent, defineDirective, injectElementRef, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {NO_CHANGE, bind, container, containerRefreshEnd, containerRefreshStart, element, elementAttribute, elementClassProp, elementContainerEnd, elementContainerStart, elementEnd, elementProperty, elementStart, elementStyleProp, elementStyling, elementStylingApply, embeddedViewEnd, embeddedViewStart, interpolation1, interpolation2, interpolation3, interpolation4, interpolation5, interpolation6, interpolation7, interpolation8, interpolationV, listener, load, loadDirective, projection, projectionDef, text, textBinding} from '../../src/render3/instructions';
import {InitialStylingFlags} from '../../src/render3/interfaces/definition';
import {HEADER_OFFSET} from '../../src/render3/interfaces/view';
import {sanitizeUrl} from '../../src/sanitization/sanitization';
import {Sanitizer, SecurityContext} from '../../src/sanitization/security';

import {NgIf} from './common_with_def';
import {ComponentFixture, TemplateFixture, containerEl, createComponent, renderToHtml} from './render_util';

describe('render3 integration test', () => {

  describe('render', () => {

    it('should render basic template', () => {
      expect(renderToHtml(Template, {})).toEqual('<span title="Hello">Greetings</span>');

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span', ['title', 'Hello']);
          { text(1, 'Greetings'); }
          elementEnd();
        }
      }
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 3,  // 1 for div, 1 for text, 1 for host element
        tView: 1,
        rendererCreateElement: 1,
      });
    });

    it('should render and update basic "Hello, World" template', () => {
      expect(renderToHtml(Template, 'World')).toEqual('<h1>Hello, World!</h1>');
      expect(renderToHtml(Template, 'New World')).toEqual('<h1>Hello, New World!</h1>');

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'h1');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          textBinding(1, interpolation1('Hello, ', ctx, '!'));
        }
      }
    });
  });

  describe('text bindings', () => {
    it('should render "undefined" as "" when used with `bind()`', () => {
      function Template(rf: RenderFlags, name: string) {
        if (rf & RenderFlags.Create) {
          text(0);
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, bind(name));
        }
      }

      expect(renderToHtml(Template, 'benoit')).toEqual('benoit');
      expect(renderToHtml(Template, undefined)).toEqual('');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 0,
        tNode: 2,
        tView: 1,
        rendererSetText: 2,
      });
    });

    it('should render "null" as "" when used with `bind()`', () => {
      function Template(rf: RenderFlags, name: string) {
        if (rf & RenderFlags.Create) {
          text(0);
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, bind(name));
        }
      }

      expect(renderToHtml(Template, 'benoit')).toEqual('benoit');
      expect(renderToHtml(Template, null)).toEqual('');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 0,
        tNode: 2,
        tView: 1,
        rendererSetText: 2,
      });
    });

    it('should support creation-time values in text nodes', () => {
      function Template(rf: RenderFlags, value: string) {
        if (rf & RenderFlags.Create) {
          text(0);
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, rf & RenderFlags.Create ? value : NO_CHANGE);
        }
      }
      expect(renderToHtml(Template, 'once')).toEqual('once');
      expect(renderToHtml(Template, 'twice')).toEqual('once');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 0,
        tNode: 2,
        tView: 1,
        rendererSetText: 1,
      });
    });

  });

  describe('Siblings update', () => {
    it('should handle a flat list of static/bound text nodes', () => {
      function Template(rf: RenderFlags, name: string) {
        if (rf & RenderFlags.Create) {
          text(0, 'Hello ');
          text(1);
          text(2, '!');
        }
        if (rf & RenderFlags.Update) {
          textBinding(1, bind(name));
        }
      }
      expect(renderToHtml(Template, 'world')).toEqual('Hello world!');
      expect(renderToHtml(Template, 'monde')).toEqual('Hello monde!');
    });

    it('should handle a list of static/bound text nodes as element children', () => {
      function Template(rf: RenderFlags, name: string) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'b');
          {
            text(1, 'Hello ');
            text(2);
            text(3, '!');
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          textBinding(2, bind(name));
        }
      }
      expect(renderToHtml(Template, 'world')).toEqual('<b>Hello world!</b>');
      expect(renderToHtml(Template, 'mundo')).toEqual('<b>Hello mundo!</b>');
    });

    it('should render/update text node as a child of a deep list of elements', () => {
      function Template(rf: RenderFlags, name: string) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'b');
          {
            elementStart(1, 'b');
            {
              elementStart(2, 'b');
              {
                elementStart(3, 'b');
                { text(4); }
                elementEnd();
              }
              elementEnd();
            }
            elementEnd();
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          textBinding(4, interpolation1('Hello ', name, '!'));
        }
      }
      expect(renderToHtml(Template, 'world')).toEqual('<b><b><b><b>Hello world!</b></b></b></b>');
      expect(renderToHtml(Template, 'mundo')).toEqual('<b><b><b><b>Hello mundo!</b></b></b></b>');
    });

    it('should update 2 sibling elements', () => {
      function Template(rf: RenderFlags, id: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'b');
          {
            element(1, 'span');
            elementStart(2, 'span', ['class', 'foo']);
            {}
            elementEnd();
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementAttribute(2, 'id', bind(id));
        }
      }
      expect(renderToHtml(Template, 'foo'))
          .toEqual('<b><span></span><span class="foo" id="foo"></span></b>');
      expect(renderToHtml(Template, 'bar'))
          .toEqual('<b><span></span><span class="foo" id="bar"></span></b>');
    });

    it('should handle sibling text node after element with child text node', () => {
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'p');
          { text(1, 'hello'); }
          elementEnd();
          text(2, 'world');
        }
      }

      expect(renderToHtml(Template, null)).toEqual('<p>hello</p>world');
    });
  });

  describe('basic components', () => {

    class TodoComponent {
      value = ' one';

      static ngComponentDef = defineComponent({
        type: TodoComponent,
        selectors: [['todo']],
        template: function TodoTemplate(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'p');
            {
              text(1, 'Todo');
              text(2);
            }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            textBinding(2, bind(ctx.value));
          }
        },
        factory: () => new TodoComponent
      });
    }

    const defs = [TodoComponent];

    it('should support a basic component template', () => {
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'todo');
        }
      }

      expect(renderToHtml(Template, null, defs)).toEqual('<todo><p>Todo one</p></todo>');
    });

    it('should support a component template with sibling', () => {
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'todo');
          text(1, 'two');
        }
      }
      expect(renderToHtml(Template, null, defs)).toEqual('<todo><p>Todo one</p></todo>two');
    });

    it('should support a component template with component sibling', () => {
      /**
       * <todo></todo>
       * <todo></todo>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'todo');
          element(1, 'todo');
        }
      }
      expect(renderToHtml(Template, null, defs))
          .toEqual('<todo><p>Todo one</p></todo><todo><p>Todo one</p></todo>');
    });

    it('should support a component with binding on host element', () => {
      let cmptInstance: TodoComponentHostBinding|null;

      class TodoComponentHostBinding {
        title = 'one';
        static ngComponentDef = defineComponent({
          type: TodoComponentHostBinding,
          selectors: [['todo']],
          template: function TodoComponentHostBindingTemplate(
              rf: RenderFlags, ctx: TodoComponentHostBinding) {
            if (rf & RenderFlags.Create) {
              text(0);
            }
            if (rf & RenderFlags.Update) {
              textBinding(0, bind(ctx.title));
            }
          },
          factory: () => cmptInstance = new TodoComponentHostBinding,
          hostBindings: function(directiveIndex: number, elementIndex: number): void {
            // host bindings
            elementProperty(
                elementIndex, 'title',
                bind(loadDirective<TodoComponentHostBinding>(directiveIndex).title));
          }
        });
      }

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'todo');
        }
      }

      const defs = [TodoComponentHostBinding];
      expect(renderToHtml(Template, {}, defs)).toEqual('<todo title="one">one</todo>');
      cmptInstance !.title = 'two';
      expect(renderToHtml(Template, {}, defs)).toEqual('<todo title="two">two</todo>');
    });

    it('should support root component with host attribute', () => {
      class HostAttributeComp {
        static ngComponentDef = defineComponent({
          type: HostAttributeComp,
          selectors: [['host-attr-comp']],
          factory: () => new HostAttributeComp(),
          template: (rf: RenderFlags, ctx: HostAttributeComp) => {},
          attributes: ['role', 'button']
        });
      }

      const fixture = new ComponentFixture(HostAttributeComp);
      expect(fixture.hostElement.getAttribute('role')).toEqual('button');
    });

    it('should support component with bindings in template', () => {
      /** <p> {{ name }} </p>*/
      class MyComp {
        name = 'Bess';
        static ngComponentDef = defineComponent({
          type: MyComp,
          selectors: [['comp']],
          template: function MyCompTemplate(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'p');
              { text(1); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              textBinding(1, bind(ctx.name));
            }
          },
          factory: () => new MyComp
        });
      }

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
      }

      expect(renderToHtml(Template, null, [MyComp])).toEqual('<comp><p>Bess</p></comp>');
    });

    it('should support a component with sub-views', () => {
      /**
       * % if (condition) {
       *   <div>text</div>
       * % }
       */
      class MyComp {
        // TODO(issue/24571): remove '!'.
        condition !: boolean;
        static ngComponentDef = defineComponent({
          type: MyComp,
          selectors: [['comp']],
          template: function MyCompTemplate(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              container(0);
            }
            if (rf & RenderFlags.Update) {
              containerRefreshStart(0);
              {
                if (ctx.condition) {
                  let rf1 = embeddedViewStart(0);
                  if (rf1 & RenderFlags.Create) {
                    elementStart(0, 'div');
                    { text(1, 'text'); }
                    elementEnd();
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
            }
          },
          factory: () => new MyComp,
          inputs: {condition: 'condition'}
        });
      }

      /** <comp [condition]="condition"></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'condition', bind(ctx.condition));
        }
      }

      const defs = [MyComp];
      expect(renderToHtml(Template, {condition: true}, defs))
          .toEqual('<comp><div>text</div></comp>');
      expect(renderToHtml(Template, {condition: false}, defs)).toEqual('<comp></comp>');

    });

  });

  describe('ng-container', () => {

    it('should insert as a child of a regular element', () => {

      /**
       * <div>before|<ng-container>Greetings<span></span></ng-container>|after</div>
       */
      function Template() {
        elementStart(0, 'div');
        {
          text(1, 'before|');
          elementContainerStart(2);
          {
            text(3, 'Greetings');
            element(4, 'span');
          }
          elementContainerEnd();
          text(5, '|after');
        }
        elementEnd();
      }

      const fixture = new TemplateFixture(Template);
      expect(fixture.html).toEqual('<div>before|Greetings<span></span>|after</div>');
    });

    it('should add and remove DOM nodes when ng-container is a child of a regular element', () => {
      /**
       * {% if (value) { %}
       * <div>
       *  <ng-container>content</ng-container>
       * </div>
       * {% } %}
       */
      const TestCmpt = createComponent('test-cmpt', function(rf: RenderFlags, ctx: {value: any}) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          if (ctx.value) {
            let rf1 = embeddedViewStart(0);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'div');
                {
                  elementContainerStart(1);
                  { text(2, 'content'); }
                  elementContainerEnd();
                }
                elementEnd();
              }
            }
            embeddedViewEnd();
          }
          containerRefreshEnd();
        }
      });

      const fixture = new ComponentFixture(TestCmpt);
      expect(fixture.html).toEqual('');

      fixture.component.value = true;
      fixture.update();
      expect(fixture.html).toEqual('<div>content</div>');

      fixture.component.value = false;
      fixture.update();
      expect(fixture.html).toEqual('');
    });

    it('should add and remove DOM nodes when ng-container is a child of an embedded view (JS block)',
       () => {
         /**
          * {% if (value) { %}
          *  <ng-container>content</ng-container>
          * {% } %}
          */
         const TestCmpt =
             createComponent('test-cmpt', function(rf: RenderFlags, ctx: {value: any}) {
               if (rf & RenderFlags.Create) {
                 container(0);
               }
               if (rf & RenderFlags.Update) {
                 containerRefreshStart(0);
                 if (ctx.value) {
                   let rf1 = embeddedViewStart(0);
                   {
                     if (rf1 & RenderFlags.Create) {
                       elementContainerStart(0);
                       { text(1, 'content'); }
                       elementContainerEnd();
                     }
                   }
                   embeddedViewEnd();
                 }
                 containerRefreshEnd();
               }
             });

         const fixture = new ComponentFixture(TestCmpt);
         expect(fixture.html).toEqual('');

         fixture.component.value = true;
         fixture.update();
         expect(fixture.html).toEqual('content');

         fixture.component.value = false;
         fixture.update();
         expect(fixture.html).toEqual('');
       });

    it('should add and remove DOM nodes when ng-container is a child of an embedded view (ViewContainerRef)',
       () => {

         function ngIfTemplate(rf: RenderFlags, ctx: any) {
           if (rf & RenderFlags.Create) {
             elementContainerStart(0);
             { text(1, 'content'); }
             elementContainerEnd();
           }
         }

         /**
          * <ng-container *ngIf="value">content</ng-container>
          */
         // equivalent to:
         /**
          * <ng-template [ngIf]="value">
          *  <ng-container>
          *    content
          *  </ng-container>
          * </ng-template>
          */
         const TestCmpt =
             createComponent('test-cmpt', function(rf: RenderFlags, ctx: {value: any}) {
               if (rf & RenderFlags.Create) {
                 container(0, ngIfTemplate, null, [AttributeMarker.SelectOnly, 'ngIf']);
               }
               if (rf & RenderFlags.Update) {
                 elementProperty(0, 'ngIf', bind(ctx.value));
               }
             }, [NgIf]);

         const fixture = new ComponentFixture(TestCmpt);
         expect(fixture.html).toEqual('');

         fixture.component.value = true;
         fixture.update();
         expect(fixture.html).toEqual('content');

         fixture.component.value = false;
         fixture.update();
         expect(fixture.html).toEqual('');
       });

    // https://stackblitz.com/edit/angular-tfhcz1?file=src%2Fapp%2Fapp.component.ts
    it('should add and remove DOM nodes when ng-container is a child of a delayed embedded view',
       () => {

         class TestDirective {
           constructor(private _tplRef: TemplateRef<any>, private _vcRef: ViewContainerRef) {}

           createAndInsert() { this._vcRef.insert(this._tplRef.createEmbeddedView({})); }

           clear() { this._vcRef.clear(); }

           static ngDirectiveDef = defineDirective({
             type: TestDirective,
             selectors: [['', 'testDirective', '']],
             factory: () => new TestDirective(injectTemplateRef(), injectViewContainerRef()),
           });
         }


         function embeddedTemplate(rf: RenderFlags, ctx: any) {
           if (rf & RenderFlags.Create) {
             elementContainerStart(0);
             { text(1, 'content'); }
             elementContainerEnd();
           }
         }

         let testDirective: TestDirective;


         `<ng-template testDirective>
            <ng-container>
              content
            </ng-container>
          </ng-template>`;
         const TestCmpt = createComponent('test-cmpt', function(rf: RenderFlags) {
           if (rf & RenderFlags.Create) {
             container(0, embeddedTemplate, null, [AttributeMarker.SelectOnly, 'testDirective']);
           }
           if (rf & RenderFlags.Update) {
             testDirective = loadDirective<TestDirective>(0);
           }
         }, [TestDirective]);

         const fixture = new ComponentFixture(TestCmpt);
         expect(fixture.html).toEqual('');

         testDirective !.createAndInsert();
         fixture.update();
         expect(fixture.html).toEqual('content');

         testDirective !.clear();
         fixture.update();
         expect(fixture.html).toEqual('');
       });

    it('should render at the component view root', () => {
      /**
       * <ng-container>component template</ng-container>
       */
      const TestCmpt = createComponent('test-cmpt', function(rf: RenderFlags) {
        if (rf & RenderFlags.Create) {
          elementContainerStart(0);
          { text(1, 'component template'); }
          elementContainerEnd();
        }
      });

      function App() { element(0, 'test-cmpt'); }

      const fixture = new TemplateFixture(App, () => {}, [TestCmpt]);
      expect(fixture.html).toEqual('<test-cmpt>component template</test-cmpt>');
    });

    it('should render inside another ng-container', () => {
      /**
       * <ng-container>
       *   <ng-container>
       *     <ng-container>
       *       content
       *     </ng-container>
       *   </ng-container>
       * </ng-container>
       */
      const TestCmpt = createComponent('test-cmpt', function(rf: RenderFlags) {
        if (rf & RenderFlags.Create) {
          elementContainerStart(0);
          {
            elementContainerStart(1);
            {
              elementContainerStart(2);
              { text(3, 'content'); }
              elementContainerEnd();
            }
            elementContainerEnd();
          }
          elementContainerEnd();
        }
      });

      function App() { element(0, 'test-cmpt'); }

      const fixture = new TemplateFixture(App, () => {}, [TestCmpt]);
      expect(fixture.html).toEqual('<test-cmpt>content</test-cmpt>');
    });

    it('should render inside another ng-container at the root of a delayed view', () => {

      class TestDirective {
        constructor(private _tplRef: TemplateRef<any>, private _vcRef: ViewContainerRef) {}

        createAndInsert() { this._vcRef.insert(this._tplRef.createEmbeddedView({})); }

        clear() { this._vcRef.clear(); }

        static ngDirectiveDef = defineDirective({
          type: TestDirective,
          selectors: [['', 'testDirective', '']],
          factory: () => new TestDirective(injectTemplateRef(), injectViewContainerRef()),
        });
      }

      let testDirective: TestDirective;

      function embeddedTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementContainerStart(0);
          {
            elementContainerStart(1);
            {
              elementContainerStart(2);
              { text(3, 'content'); }
              elementContainerEnd();
            }
            elementContainerEnd();
          }
          elementContainerEnd();
        }
      }

      `<ng-template testDirective>
        <ng-container>
          <ng-container>
            <ng-container>
              content
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-template>`;
      const TestCmpt = createComponent('test-cmpt', function(rf: RenderFlags) {
        if (rf & RenderFlags.Create) {
          container(0, embeddedTemplate, null, [AttributeMarker.SelectOnly, 'testDirective']);
        }
        if (rf & RenderFlags.Update) {
          testDirective = loadDirective<TestDirective>(0);
        }
      }, [TestDirective]);

      function App() { element(0, 'test-cmpt'); }

      const fixture = new ComponentFixture(TestCmpt);
      expect(fixture.html).toEqual('');

      testDirective !.createAndInsert();
      fixture.update();
      expect(fixture.html).toEqual('content');

      testDirective !.createAndInsert();
      fixture.update();
      expect(fixture.html).toEqual('contentcontent');

      testDirective !.clear();
      fixture.update();
      expect(fixture.html).toEqual('');
    });

    it('should support directives and inject ElementRef', () => {

      class Directive {
        constructor(public elRef: ElementRef) {}

        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => new Directive(injectElementRef()),
        });
      }

      let directive: Directive;

      /**
       * <div><ng-container dir></ng-container></div>
       */
      function Template() {
        elementStart(0, 'div');
        {
          elementContainerStart(1, [AttributeMarker.SelectOnly, 'dir']);
          elementContainerEnd();
          directive = loadDirective<Directive>(0);
        }
        elementEnd();
      }

      const fixture = new TemplateFixture(Template, () => {}, [Directive]);
      expect(fixture.html).toEqual('<div></div>');
      expect(directive !.elRef.nativeElement.nodeType).toBe(Node.COMMENT_NODE);
    });

    it('should not set any attributes', () => {

      /**
       * <div><ng-container id="foo"></ng-container></div>
       */
      function Template() {
        elementStart(0, 'div');
        {
          elementContainerStart(1, ['id', 'foo']);
          elementContainerEnd();
        }
        elementEnd();
      }

      const fixture = new TemplateFixture(Template);
      expect(fixture.html).toEqual('<div></div>');
    });

    it('should throw when trying to add event listener', () => {

      /**
       * <div><ng-container (click)="..."></ng-container></div>
       */
      function Template() {
        elementStart(0, 'div');
        {
          elementContainerStart(1);
          {
            listener('click', function() {});
          }
          elementContainerEnd();
        }
        elementEnd();
      }

      expect(() => { new TemplateFixture(Template); }).toThrow();
    });

  });

  describe('tree', () => {
    interface Tree {
      beforeLabel?: string;
      subTrees?: Tree[];
      afterLabel?: string;
    }

    interface ParentCtx {
      beforeTree: Tree;
      projectedTree: Tree;
      afterTree: Tree;
    }

    function showLabel(rf: RenderFlags, ctx: {label: string | undefined}) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.label != null) {
            let rf1 = embeddedViewStart(0);
            if (rf1 & RenderFlags.Create) {
              text(0);
            }
            if (rf1 & RenderFlags.Update) {
              textBinding(0, bind(ctx.label));
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    function showTree(rf: RenderFlags, ctx: {tree: Tree}) {
      if (rf & RenderFlags.Create) {
        container(0);
        container(1);
        container(2);
      }
      containerRefreshStart(0);
      {
        const rf0 = embeddedViewStart(0);
        { showLabel(rf0, {label: ctx.tree.beforeLabel}); }
        embeddedViewEnd();
      }
      containerRefreshEnd();
      containerRefreshStart(1);
      {
        for (let subTree of ctx.tree.subTrees || []) {
          const rf0 = embeddedViewStart(0);
          { showTree(rf0, {tree: subTree}); }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
      containerRefreshStart(2);
      {
        const rf0 = embeddedViewStart(0);
        { showLabel(rf0, {label: ctx.tree.afterLabel}); }
        embeddedViewEnd();
      }
      containerRefreshEnd();
    }

    class ChildComponent {
      // TODO(issue/24571): remove '!'.
      beforeTree !: Tree;
      // TODO(issue/24571): remove '!'.
      afterTree !: Tree;
      static ngComponentDef = defineComponent({
        selectors: [['child']],
        type: ChildComponent,
        template: function ChildComponentTemplate(
            rf: RenderFlags, ctx: {beforeTree: Tree, afterTree: Tree}) {
          if (rf & RenderFlags.Create) {
            projectionDef();
            container(0);
            projection(1);
            container(2);
          }
          containerRefreshStart(0);
          {
            const rf0 = embeddedViewStart(0);
            { showTree(rf0, {tree: ctx.beforeTree}); }
            embeddedViewEnd();
          }
          containerRefreshEnd();
          containerRefreshStart(2);
          {
            const rf0 = embeddedViewStart(0);
            { showTree(rf0, {tree: ctx.afterTree}); }
            embeddedViewEnd();
          }
          containerRefreshEnd();
        },
        factory: () => new ChildComponent,
        inputs: {beforeTree: 'beforeTree', afterTree: 'afterTree'}
      });
    }

    function parentTemplate(rf: RenderFlags, ctx: ParentCtx) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'beforeTree', bind(ctx.beforeTree));
        elementProperty(0, 'afterTree', bind(ctx.afterTree));
        containerRefreshStart(1);
        {
          const rf0 = embeddedViewStart(0);
          { showTree(rf0, {tree: ctx.projectedTree}); }
          embeddedViewEnd();
        }
        containerRefreshEnd();
      }
    }

    it('should work with a tree', () => {

      const ctx: ParentCtx = {
        beforeTree: {subTrees: [{beforeLabel: 'a'}]},
        projectedTree: {beforeLabel: 'p'},
        afterTree: {afterLabel: 'z'}
      };
      const defs = [ChildComponent];
      expect(renderToHtml(parentTemplate, ctx, defs)).toEqual('<child>apz</child>');
      ctx.projectedTree = {subTrees: [{}, {}, {subTrees: [{}, {}]}, {}]};
      ctx.beforeTree.subTrees !.push({afterLabel: 'b'});
      expect(renderToHtml(parentTemplate, ctx, defs)).toEqual('<child>abz</child>');
      ctx.projectedTree.subTrees ![1].afterLabel = 'h';
      expect(renderToHtml(parentTemplate, ctx, defs)).toEqual('<child>abhz</child>');
      ctx.beforeTree.subTrees !.push({beforeLabel: 'c'});
      expect(renderToHtml(parentTemplate, ctx, defs)).toEqual('<child>abchz</child>');

      // To check the context easily:
      // console.log(JSON.stringify(ctx));
    });

  });

  describe('element bindings', () => {

    describe('elementAttribute', () => {
      it('should support attribute bindings', () => {
        const ctx: {title: string | null} = {title: 'Hello'};

        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'span');
          }
          if (rf & RenderFlags.Update) {
            elementAttribute(0, 'title', bind(ctx.title));
          }
        }

        // initial binding
        expect(renderToHtml(Template, ctx)).toEqual('<span title="Hello"></span>');

        // update binding
        ctx.title = 'Hi!';
        expect(renderToHtml(Template, ctx)).toEqual('<span title="Hi!"></span>');

        // remove attribute
        ctx.title = null;
        expect(renderToHtml(Template, ctx)).toEqual('<span></span>');
      });

      it('should stringify values used attribute bindings', () => {
        const ctx: {title: any} = {title: NaN};

        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'span');
          }
          if (rf & RenderFlags.Update) {
            elementAttribute(0, 'title', bind(ctx.title));
          }
        }

        expect(renderToHtml(Template, ctx)).toEqual('<span title="NaN"></span>');

        ctx.title = {toString: () => 'Custom toString'};
        expect(renderToHtml(Template, ctx)).toEqual('<span title="Custom toString"></span>');
      });

      it('should update bindings', () => {
        function Template(rf: RenderFlags, c: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'b');
          }
          if (rf & RenderFlags.Update) {
            elementAttribute(0, 'a', interpolationV(c));
            elementAttribute(0, 'a0', bind(c[1]));
            elementAttribute(0, 'a1', interpolation1(c[0], c[1], c[16]));
            elementAttribute(0, 'a2', interpolation2(c[0], c[1], c[2], c[3], c[16]));
            elementAttribute(0, 'a3', interpolation3(c[0], c[1], c[2], c[3], c[4], c[5], c[16]));
            elementAttribute(
                0, 'a4', interpolation4(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[16]));
            elementAttribute(
                0, 'a5',
                interpolation5(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[16]));
            elementAttribute(
                0, 'a6', interpolation6(
                             c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10],
                             c[11], c[16]));
            elementAttribute(
                0, 'a7', interpolation7(
                             c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10],
                             c[11], c[12], c[13], c[16]));
            elementAttribute(
                0, 'a8', interpolation8(
                             c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10],
                             c[11], c[12], c[13], c[14], c[15], c[16]));
          }
        }
        let args = ['(', 0, 'a', 1, 'b', 2, 'c', 3, 'd', 4, 'e', 5, 'f', 6, 'g', 7, ')'];
        expect(renderToHtml(Template, args))
            .toEqual(
                '<b a="(0a1b2c3d4e5f6g7)" a0="0" a1="(0)" a2="(0a1)" a3="(0a1b2)" a4="(0a1b2c3)" a5="(0a1b2c3d4)" a6="(0a1b2c3d4e5)" a7="(0a1b2c3d4e5f6)" a8="(0a1b2c3d4e5f6g7)"></b>');
        args = args.reverse();
        expect(renderToHtml(Template, args))
            .toEqual(
                '<b a=")7g6f5e4d3c2b1a0(" a0="7" a1=")7(" a2=")7g6(" a3=")7g6f5(" a4=")7g6f5e4(" a5=")7g6f5e4d3(" a6=")7g6f5e4d3c2(" a7=")7g6f5e4d3c2b1(" a8=")7g6f5e4d3c2b1a0("></b>');
        args = args.reverse();
        expect(renderToHtml(Template, args))
            .toEqual(
                '<b a="(0a1b2c3d4e5f6g7)" a0="0" a1="(0)" a2="(0a1)" a3="(0a1b2)" a4="(0a1b2c3)" a5="(0a1b2c3d4)" a6="(0a1b2c3d4e5)" a7="(0a1b2c3d4e5f6)" a8="(0a1b2c3d4e5f6g7)"></b>');
      });

      it('should not update DOM if context has not changed', () => {
        const ctx: {title: string | null} = {title: 'Hello'};

        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'span');
            container(1);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            elementAttribute(0, 'title', bind(ctx.title));
            containerRefreshStart(1);
            {
              if (true) {
                let rf1 = embeddedViewStart(1);
                {
                  if (rf1 & RenderFlags.Create) {
                    elementStart(0, 'b');
                    {}
                    elementEnd();
                  }
                  elementAttribute(0, 'title', bind(ctx.title));
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
        }

        // initial binding
        expect(renderToHtml(Template, ctx))
            .toEqual('<span title="Hello"><b title="Hello"></b></span>');
        // update DOM manually
        containerEl.querySelector('b') !.setAttribute('title', 'Goodbye');
        // refresh with same binding
        expect(renderToHtml(Template, ctx))
            .toEqual('<span title="Hello"><b title="Goodbye"></b></span>');
        // refresh again with same binding
        expect(renderToHtml(Template, ctx))
            .toEqual('<span title="Hello"><b title="Goodbye"></b></span>');
      });

      it('should support host attribute bindings', () => {
        let hostBindingDir: HostBindingDir;

        class HostBindingDir {
          /* @HostBinding('attr.aria-label') */
          label = 'some label';

          static ngDirectiveDef = defineDirective({
            type: HostBindingDir,
            selectors: [['', 'hostBindingDir', '']],
            factory: function HostBindingDir_Factory() {
              return hostBindingDir = new HostBindingDir();
            },
            hostBindings: function HostBindingDir_HostBindings(dirIndex: number, elIndex: number) {
              elementAttribute(
                  elIndex, 'aria-label', bind(loadDirective<HostBindingDir>(dirIndex).label));
            }
          });
        }

        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div', ['hostBindingDir', '']);
          }
        }

        const defs = [HostBindingDir];
        expect(renderToHtml(Template, {}, defs))
            .toEqual(`<div aria-label="some label" hostbindingdir=""></div>`);

        hostBindingDir !.label = 'other label';
        expect(renderToHtml(Template, {}, defs))
            .toEqual(`<div aria-label="other label" hostbindingdir=""></div>`);
      });
    });

    describe('elementStyle', () => {

      it('should support binding to styles', () => {
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'span');
            elementStyling(null, ['border-color']);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            elementStyleProp(0, 0, ctx);
            elementStylingApply(0);
          }
        }

        expect(renderToHtml(Template, 'red')).toEqual('<span style="border-color: red;"></span>');
        expect(renderToHtml(Template, 'green'))
            .toEqual('<span style="border-color: green;"></span>');
        expect(renderToHtml(Template, null)).toEqual('<span></span>');
      });

      it('should support binding to styles with suffix', () => {
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'span');
            elementStyling(null, ['font-size']);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            elementStyleProp(0, 0, ctx, 'px');
            elementStylingApply(0);
          }
        }

        expect(renderToHtml(Template, '100')).toEqual('<span style="font-size: 100px;"></span>');
        expect(renderToHtml(Template, 200)).toEqual('<span style="font-size: 200px;"></span>');
        expect(renderToHtml(Template, null)).toEqual('<span></span>');
      });
    });

    describe('elementClass', () => {

      it('should support CSS class toggle', () => {
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'span');
            elementStyling(['active']);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            elementClassProp(0, 0, ctx);
            elementStylingApply(0);
          }
        }

        expect(renderToHtml(Template, true)).toEqual('<span class="active"></span>');
        expect(renderToHtml(Template, false)).toEqual('<span class=""></span>');

        // truthy values
        expect(renderToHtml(Template, 'a_string')).toEqual('<span class="active"></span>');
        expect(renderToHtml(Template, 10)).toEqual('<span class="active"></span>');

        // falsy values
        expect(renderToHtml(Template, '')).toEqual('<span class=""></span>');
        expect(renderToHtml(Template, 0)).toEqual('<span class=""></span>');
      });

      it('should work correctly with existing static classes', () => {
        function Template(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'span');
            elementStyling(
                ['existing', 'active', InitialStylingFlags.VALUES_MODE, 'existing', true]);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            elementClassProp(0, 1, ctx);
            elementStylingApply(0);
          }
        }

        expect(renderToHtml(Template, true)).toEqual('<span class="existing active"></span>');
        expect(renderToHtml(Template, false)).toEqual('<span class="existing"></span>');
      });
    });
  });

  describe('template data', () => {

    it('should re-use template data and node data', () => {
      /**
       *  % if (condition) {
       *    <div></div>
       *  % }
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'div');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      expect((Template as any).ngPrivateData).toBeUndefined();

      renderToHtml(Template, {condition: true});

      const oldTemplateData = (Template as any).ngPrivateData;
      const oldContainerData = (oldTemplateData as any).data[HEADER_OFFSET];
      const oldElementData = oldContainerData.tViews[0][HEADER_OFFSET];
      expect(oldContainerData).not.toBeNull();
      expect(oldElementData).not.toBeNull();

      renderToHtml(Template, {condition: false});
      renderToHtml(Template, {condition: true});

      const newTemplateData = (Template as any).ngPrivateData;
      const newContainerData = (oldTemplateData as any).data[HEADER_OFFSET];
      const newElementData = oldContainerData.tViews[0][HEADER_OFFSET];
      expect(newTemplateData === oldTemplateData).toBe(true);
      expect(newContainerData === oldContainerData).toBe(true);
      expect(newElementData === oldElementData).toBe(true);
    });

  });

  describe('sanitization', () => {
    it('should sanitize data using the provided sanitization interface', () => {
      class SanitizationComp {
        static ngComponentDef = defineComponent({
          type: SanitizationComp,
          selectors: [['sanitize-this']],
          factory: () => new SanitizationComp(),
          template: (rf: RenderFlags, ctx: SanitizationComp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'a');
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'href', bind(ctx.href), sanitizeUrl);
            }
          }
        });

        private href = '';

        updateLink(href: any) { this.href = href; }
      }

      const sanitizer = new LocalSanitizer((value) => { return 'http://bar'; });

      const fixture = new ComponentFixture(SanitizationComp, {sanitizer});
      fixture.component.updateLink('http://foo');
      fixture.update();

      const anchor = fixture.hostElement.querySelector('a') !;
      expect(anchor.getAttribute('href')).toEqual('http://bar');

      fixture.component.updateLink(sanitizer.bypassSecurityTrustUrl('http://foo'));
      fixture.update();

      expect(anchor.getAttribute('href')).toEqual('http://foo');
    });
  });
});

class LocalSanitizedValue {
  constructor(public value: any) {}
  toString() { return this.value; }
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

  bypassSecurityTrustUrl(value: string) { return new LocalSanitizedValue(value); }
}
