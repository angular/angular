/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {AnimationDriver} from '@angular/animations/browser';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';
import {CommonModule} from '@angular/common';
import {
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgModule,
  OnInit,
  Output,
  Pipe,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '../../src/core';
import {Inject} from '../../src/di';
import {readPatchedLView} from '../../src/render3/context_discovery';
import {LContainer} from '../../src/render3/interfaces/container';
import {getLViewById} from '../../src/render3/interfaces/lview_tracking';
import {isLView} from '../../src/render3/interfaces/type_checks';
import {ID, LView, PARENT, TVIEW} from '../../src/render3/interfaces/view';
import {getLView} from '../../src/render3/state';
import {fakeAsync, flushMicrotasks, TestBed} from '../../testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('acceptance integration tests', () => {
  function stripHtmlComments(str: string) {
    return str.replace(/<!--[\s\S]*?-->/g, '');
  }

  describe('render', () => {
    it('should render basic template', () => {
      @Component({
        template: '<span title="Hello">Greetings</span>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);

      expect(fixture.nativeElement.innerHTML).toEqual('<span title="Hello">Greetings</span>');
    });
  });

  describe('ng-container', () => {
    it('should insert as a child of a regular element', () => {
      @Component({
        template: '<div>before|<ng-container>Greetings<span></span></ng-container>|after</div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);

      // Strip comments since VE and Ivy put them in different places.
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe(
        '<div>before|Greetings<span></span>|after</div>',
      );
    });

    it('should add and remove DOM nodes when ng-container is a child of a regular element', () => {
      @Component({
        template:
          '<ng-template [ngIf]="render"><div><ng-container>content</ng-container></div></ng-template>',
        standalone: false,
      })
      class App {
        render = false;
      }

      TestBed.configureTestingModule({declarations: [App], imports: [CommonModule]});
      const fixture = TestBed.createComponent(App);

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');

      fixture.componentInstance.render = true;
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('<div>content</div>');

      fixture.componentInstance.render = false;
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');
    });

    it('should add and remove DOM nodes when ng-container is a child of an embedded view', () => {
      @Component({
        template: '<ng-container *ngIf="render">content</ng-container>',
        standalone: false,
      })
      class App {
        render = false;
      }

      TestBed.configureTestingModule({declarations: [App], imports: [CommonModule]});
      const fixture = TestBed.createComponent(App);

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');

      fixture.componentInstance.render = true;
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('content');

      fixture.componentInstance.render = false;
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');
    });

    // https://stackblitz.com/edit/angular-tfhcz1?file=src%2Fapp%2Fapp.component.ts
    it('should add and remove DOM nodes when ng-container is a child of a delayed embedded view', () => {
      @Directive({
        selector: '[testDirective]',
        standalone: false,
      })
      class TestDirective {
        constructor(
          private _tplRef: TemplateRef<any>,
          private _vcRef: ViewContainerRef,
        ) {}

        createAndInsert() {
          this._vcRef.insert(this._tplRef.createEmbeddedView({}));
        }

        clear() {
          this._vcRef.clear();
        }
      }

      @Component({
        template: '<ng-template testDirective><ng-container>content</ng-container></ng-template>',
        standalone: false,
      })
      class App {
        @ViewChild(TestDirective, {static: true}) testDirective!: TestDirective;
      }

      TestBed.configureTestingModule({declarations: [App, TestDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe('');

      fixture.componentInstance.testDirective.createAndInsert();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe('content');

      fixture.componentInstance.testDirective.clear();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe('');
    });

    it('should render at the component view root', () => {
      @Component({
        selector: 'test-cmpt',
        template: '<ng-container>component template</ng-container>',
        standalone: false,
      })
      class TestCmpt {}

      @Component({
        template: '<test-cmpt></test-cmpt>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, TestCmpt]});
      const fixture = TestBed.createComponent(App);

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe(
        '<test-cmpt>component template</test-cmpt>',
      );
    });

    it('should render inside another ng-container', () => {
      @Component({
        selector: 'test-cmpt',
        template:
          '<ng-container><ng-container><ng-container>content</ng-container></ng-container></ng-container>',
        standalone: false,
      })
      class TestCmpt {}

      @Component({
        template: '<test-cmpt></test-cmpt>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, TestCmpt]});
      const fixture = TestBed.createComponent(App);

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe(
        '<test-cmpt>content</test-cmpt>',
      );
    });

    it('should render inside another ng-container at the root of a delayed view', () => {
      @Directive({
        selector: '[testDirective]',
        standalone: false,
      })
      class TestDirective {
        constructor(
          private _tplRef: TemplateRef<any>,
          private _vcRef: ViewContainerRef,
        ) {}

        createAndInsert() {
          this._vcRef.insert(this._tplRef.createEmbeddedView({}));
        }

        clear() {
          this._vcRef.clear();
        }
      }

      @Component({
        template:
          '<ng-template testDirective><ng-container><ng-container><ng-container>content</ng-container></ng-container></ng-container></ng-template>',
        standalone: false,
      })
      class App {
        @ViewChild(TestDirective, {static: true}) testDirective!: TestDirective;
      }

      TestBed.configureTestingModule({declarations: [App, TestDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe('');

      fixture.componentInstance.testDirective.createAndInsert();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe('content');

      fixture.componentInstance.testDirective.createAndInsert();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe('contentcontent');

      fixture.componentInstance.testDirective.clear();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toBe('');
    });

    it('should support directives and inject ElementRef', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class TestDirective {
        constructor(public elRef: ElementRef) {}
      }

      @Component({
        template: '<div><ng-container dir></ng-container></div>',
        standalone: false,
      })
      class App {
        @ViewChild(TestDirective) testDirective!: TestDirective;
      }

      TestBed.configureTestingModule({declarations: [App, TestDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('<div></div>');
      expect(fixture.componentInstance.testDirective.elRef.nativeElement.nodeType).toBe(
        Node.COMMENT_NODE,
      );
    });

    it('should support ViewContainerRef when ng-container is at the root of a view', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class TestDirective {
        @Input() contentTpl: TemplateRef<{}> | null = null;

        constructor(private _vcRef: ViewContainerRef) {}

        insertView() {
          this._vcRef.createEmbeddedView(this.contentTpl as TemplateRef<{}>);
        }

        clear() {
          this._vcRef.clear();
        }
      }

      @Component({
        template:
          '<ng-container dir [contentTpl]="content"><ng-template #content>Content</ng-template></ng-container>',
        standalone: false,
      })
      class App {
        @ViewChild(TestDirective) testDirective!: TestDirective;
      }

      TestBed.configureTestingModule({declarations: [App, TestDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');

      fixture.componentInstance.testDirective.insertView();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('Content');

      fixture.componentInstance.testDirective.clear();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');
    });

    it('should support ViewContainerRef on <ng-template> inside <ng-container>', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class TestDirective {
        constructor(
          private _tplRef: TemplateRef<{}>,
          private _vcRef: ViewContainerRef,
        ) {}

        insertView() {
          this._vcRef.createEmbeddedView(this._tplRef);
        }

        clear() {
          this._vcRef.clear();
        }
      }

      @Component({
        template: '<ng-container><ng-template dir>Content</ng-template></ng-container>',
        standalone: false,
      })
      class App {
        @ViewChild(TestDirective) testDirective!: TestDirective;
      }

      TestBed.configureTestingModule({declarations: [App, TestDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');

      fixture.componentInstance.testDirective.insertView();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('Content');

      fixture.componentInstance.testDirective.clear();
      fixture.detectChanges();
      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('');
    });

    it('should not set any attributes', () => {
      @Component({
        template: '<div><ng-container id="foo"></ng-container></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripHtmlComments(fixture.nativeElement.innerHTML)).toEqual('<div></div>');
    });
  });

  describe('text bindings', () => {
    it('should render "undefined" as ""', () => {
      @Component({
        template: '{{name}}',
        standalone: false,
      })
      class App {
        name: string | undefined = 'benoit';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('benoit');

      fixture.componentInstance.name = undefined;
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('');
    });

    it('should render "null" as ""', () => {
      @Component({
        template: '{{name}}',
        standalone: false,
      })
      class App {
        name: string | null = 'benoit';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('benoit');

      fixture.componentInstance.name = null;
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('');
    });

    it('should be able to render the result of a function called $any by using this', () => {
      @Component({
        template: '{{this.$any(1, 2)}}',
        standalone: false,
      })
      class App {
        $any(value: number, multiplier: number) {
          return value * multiplier;
        }
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('2');
    });
  });

  describe('ngNonBindable handling', () => {
    function stripNgNonBindable(str: string) {
      return str.replace(/ ngnonbindable=""/i, '');
    }

    it('should keep local ref for host element', () => {
      @Component({
        template: `
          <b ngNonBindable #myRef id="my-id">
            <i>Hello {{ name }}!</i>
          </b>
          {{ myRef.id }}
        `,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripNgNonBindable(fixture.nativeElement.innerHTML)).toEqual(
        '<b id="my-id"><i>Hello {{ name }}!</i></b> my-id ',
      );
    });

    it('should invoke directives for host element', () => {
      let directiveInvoked: boolean = false;

      @Directive({
        selector: '[directive]',
        standalone: false,
      })
      class TestDirective implements OnInit {
        ngOnInit() {
          directiveInvoked = true;
        }
      }

      @Component({
        template: `
          <b ngNonBindable directive>
            <i>Hello {{ name }}!</i>
          </b>
        `,
        standalone: false,
      })
      class App {
        name = 'World';
      }

      TestBed.configureTestingModule({declarations: [App, TestDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripNgNonBindable(fixture.nativeElement.innerHTML)).toEqual(
        '<b directive=""><i>Hello {{ name }}!</i></b>',
      );
      expect(directiveInvoked).toEqual(true);
    });

    it('should not invoke directives for nested elements', () => {
      let directiveInvoked: boolean = false;

      @Directive({
        selector: '[directive]',
        standalone: false,
      })
      class TestDirective implements OnInit {
        ngOnInit() {
          directiveInvoked = true;
        }
      }

      @Component({
        template: `
          <b ngNonBindable>
            <i directive>Hello {{ name }}!</i>
          </b>
        `,
        standalone: false,
      })
      class App {
        name = 'World';
      }

      TestBed.configureTestingModule({declarations: [App, TestDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(stripNgNonBindable(fixture.nativeElement.innerHTML)).toEqual(
        '<b><i directive="">Hello {{ name }}!</i></b>',
      );
      expect(directiveInvoked).toEqual(false);
    });
  });

  describe('Siblings update', () => {
    it('should handle a flat list of static/bound text nodes', () => {
      @Component({
        template: 'Hello {{name}}!',
        standalone: false,
      })
      class App {
        name = '';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.name = 'world';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('Hello world!');

      fixture.componentInstance.name = 'monde';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('Hello monde!');
    });

    it('should handle a list of static/bound text nodes as element children', () => {
      @Component({
        template: '<b>Hello {{name}}!</b>',
        standalone: false,
      })
      class App {
        name = '';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.name = 'world';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<b>Hello world!</b>');

      fixture.componentInstance.name = 'mundo';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<b>Hello mundo!</b>');
    });

    it('should render/update text node as a child of a deep list of elements', () => {
      @Component({
        template: '<b><b><b><b>Hello {{name}}!</b></b></b></b>',
        standalone: false,
      })
      class App {
        name = '';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.name = 'world';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<b><b><b><b>Hello world!</b></b></b></b>');

      fixture.componentInstance.name = 'mundo';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<b><b><b><b>Hello mundo!</b></b></b></b>');
    });

    it('should update 2 sibling elements', () => {
      @Component({
        template: '<b><span></span><span class="foo" [id]="id"></span></b>',
        standalone: false,
      })
      class App {
        id = '';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.id = 'foo';
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<b><span></span><span class="foo" id="foo"></span></b>',
      );

      fixture.componentInstance.id = 'bar';
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<b><span></span><span class="foo" id="bar"></span></b>',
      );
    });

    it('should handle sibling text node after element with child text node', () => {
      @Component({
        template: '<p>hello</p>{{name}}',
        standalone: false,
      })
      class App {
        name = '';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);

      fixture.componentInstance.name = 'world';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<p>hello</p>world');

      fixture.componentInstance.name = 'mundo';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<p>hello</p>mundo');
    });
  });

  describe('basic components', () => {
    @Component({
      selector: 'todo',
      template: '<p>Todo{{value}}</p>',
      standalone: false,
    })
    class TodoComponent {
      value = ' one';
    }

    it('should support a basic component template', () => {
      @Component({
        template: '<todo></todo>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, TodoComponent]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<todo><p>Todo one</p></todo>');
    });

    it('should support a component template with sibling', () => {
      @Component({
        template: '<todo></todo>two',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, TodoComponent]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<todo><p>Todo one</p></todo>two');
    });

    it('should support a component template with component sibling', () => {
      @Component({
        template: '<todo></todo><todo></todo>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, TodoComponent]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<todo><p>Todo one</p></todo><todo><p>Todo one</p></todo>',
      );
    });

    it('should support a component with binding on host element', () => {
      @Component({
        selector: 'todo',
        template: '{{title}}',
        standalone: false,
      })
      class TodoComponentHostBinding {
        @HostBinding() title = 'one';
      }

      @Component({
        template: '<todo></todo>',
        standalone: false,
      })
      class App {
        @ViewChild(TodoComponentHostBinding) todoComponentHostBinding!: TodoComponentHostBinding;
      }

      TestBed.configureTestingModule({declarations: [App, TodoComponentHostBinding]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<todo title="one">one</todo>');

      fixture.componentInstance.todoComponentHostBinding.title = 'two';
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<todo title="two">two</todo>');
    });

    it('should support root component with host attribute', () => {
      @Component({
        selector: 'host-attr-comp',
        template: '',
        host: {'role': 'button'},
        standalone: false,
      })
      class HostAttributeComp {}

      TestBed.configureTestingModule({declarations: [HostAttributeComp]});
      const fixture = TestBed.createComponent(HostAttributeComp);
      fixture.detectChanges();

      expect(fixture.nativeElement.getAttribute('role')).toEqual('button');
    });

    it('should support component with bindings in template', () => {
      @Component({
        selector: 'comp',
        template: '<p>{{ name }}</p>',
        standalone: false,
      })
      class MyComp {
        name = 'Bess';
      }

      @Component({
        template: '<comp></comp>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyComp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<comp><p>Bess</p></comp>');
    });

    it('should support a component with sub-views', () => {
      @Component({
        selector: 'comp',
        template: '<div *ngIf="condition">text</div>',
        standalone: false,
      })
      class MyComp {
        @Input() condition!: boolean;
      }

      @Component({
        template: '<comp [condition]="condition"></comp>',
        standalone: false,
      })
      class App {
        condition = false;
      }

      TestBed.configureTestingModule({declarations: [App, MyComp], imports: [CommonModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const compElement = fixture.nativeElement.querySelector('comp');

      fixture.componentInstance.condition = true;
      fixture.detectChanges();
      expect(stripHtmlComments(compElement.innerHTML)).toEqual('<div>text</div>');

      fixture.componentInstance.condition = false;
      fixture.detectChanges();
      expect(stripHtmlComments(compElement.innerHTML)).toEqual('');
    });
  });

  describe('element bindings', () => {
    describe('elementAttribute', () => {
      it('should support attribute bindings', () => {
        @Component({
          template: '<button [attr.title]="title"></button>',
          standalone: false,
        })
        class App {
          title: string | null = '';
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.title = 'Hello';
        fixture.detectChanges();
        // initial binding
        expect(fixture.nativeElement.innerHTML).toEqual('<button title="Hello"></button>');

        // update binding
        fixture.componentInstance.title = 'Hi!';
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual('<button title="Hi!"></button>');

        // remove attribute
        fixture.componentInstance.title = null;
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual('<button></button>');
      });

      it('should stringify values used attribute bindings', () => {
        @Component({
          template: '<button [attr.title]="title"></button>',
          standalone: false,
        })
        class App {
          title: any;
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.title = NaN;
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual('<button title="NaN"></button>');

        fixture.componentInstance.title = {toString: () => 'Custom toString'};
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual(
          '<button title="Custom toString"></button>',
        );
      });

      it('should update bindings', () => {
        @Component({
          template: [
            'a:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[4]}}{{c[5]}}{{c[6]}}{{c[7]}}{{c[8]}}{{c[9]}}{{c[10]}}{{c[11]}}{{c[12]}}{{c[13]}}{{c[14]}}{{c[15]}}{{c[16]}}',
            'a0:{{c[1]}}',
            'a1:{{c[0]}}{{c[1]}}{{c[16]}}',
            'a2:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[16]}}',
            'a3:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[4]}}{{c[5]}}{{c[16]}}',
            'a4:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[4]}}{{c[5]}}{{c[6]}}{{c[7]}}{{c[16]}}',
            'a5:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[4]}}{{c[5]}}{{c[6]}}{{c[7]}}{{c[8]}}{{c[9]}}{{c[16]}}',
            'a6:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[4]}}{{c[5]}}{{c[6]}}{{c[7]}}{{c[8]}}{{c[9]}}{{c[10]}}{{c[11]}}{{c[16]}}',
            'a7:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[4]}}{{c[5]}}{{c[6]}}{{c[7]}}{{c[8]}}{{c[9]}}{{c[10]}}{{c[11]}}{{c[12]}}{{c[13]}}{{c[16]}}',
            'a8:{{c[0]}}{{c[1]}}{{c[2]}}{{c[3]}}{{c[4]}}{{c[5]}}{{c[6]}}{{c[7]}}{{c[8]}}{{c[9]}}{{c[10]}}{{c[11]}}{{c[12]}}{{c[13]}}{{c[14]}}{{c[15]}}{{c[16]}}',
          ].join('\n'),
          standalone: false,
        })
        class App {
          c = ['(', 0, 'a', 1, 'b', 2, 'c', 3, 'd', 4, 'e', 5, 'f', 6, 'g', 7, ')'];
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent.trim()).toEqual(
          [
            'a:(0a1b2c3d4e5f6g7)',
            'a0:0',
            'a1:(0)',
            'a2:(0a1)',
            'a3:(0a1b2)',
            'a4:(0a1b2c3)',
            'a5:(0a1b2c3d4)',
            'a6:(0a1b2c3d4e5)',
            'a7:(0a1b2c3d4e5f6)',
            'a8:(0a1b2c3d4e5f6g7)',
          ].join('\n'),
        );

        fixture.componentInstance.c.reverse();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent.trim()).toEqual(
          [
            'a:)7g6f5e4d3c2b1a0(',
            'a0:7',
            'a1:)7(',
            'a2:)7g6(',
            'a3:)7g6f5(',
            'a4:)7g6f5e4(',
            'a5:)7g6f5e4d3(',
            'a6:)7g6f5e4d3c2(',
            'a7:)7g6f5e4d3c2b1(',
            'a8:)7g6f5e4d3c2b1a0(',
          ].join('\n'),
        );

        fixture.componentInstance.c.reverse();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent.trim()).toEqual(
          [
            'a:(0a1b2c3d4e5f6g7)',
            'a0:0',
            'a1:(0)',
            'a2:(0a1)',
            'a3:(0a1b2)',
            'a4:(0a1b2c3)',
            'a5:(0a1b2c3d4)',
            'a6:(0a1b2c3d4e5)',
            'a7:(0a1b2c3d4e5f6)',
            'a8:(0a1b2c3d4e5f6g7)',
          ].join('\n'),
        );
      });

      it('should not update DOM if context has not changed', () => {
        @Component({
          template: `
            <span [attr.title]="title">
              <b [attr.title]="title" *ngIf="shouldRender"></b>
            </span>
          `,
          standalone: false,
        })
        class App {
          title: string | null = '';
          shouldRender = true;
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
        const bold: HTMLElement = span.querySelector('b')!;

        fixture.componentInstance.title = 'Hello';
        fixture.detectChanges();

        // initial binding
        expect(span.getAttribute('title')).toBe('Hello');
        expect(bold.getAttribute('title')).toBe('Hello');

        // update DOM manually
        bold.setAttribute('title', 'Goodbye');

        // refresh with same binding
        fixture.detectChanges();
        expect(span.getAttribute('title')).toBe('Hello');
        expect(bold.getAttribute('title')).toBe('Goodbye');

        // refresh again with same binding
        fixture.detectChanges();
        expect(span.getAttribute('title')).toBe('Hello');
        expect(bold.getAttribute('title')).toBe('Goodbye');
      });

      it('should support host attribute bindings', () => {
        @Directive({
          selector: '[hostBindingDir]',
          standalone: false,
        })
        class HostBindingDir {
          @HostBinding('attr.aria-label') label = 'some label';
        }

        @Component({
          template: '<div hostBindingDir></div>',
          standalone: false,
        })
        class App {
          @ViewChild(HostBindingDir) hostBindingDir!: HostBindingDir;
        }

        TestBed.configureTestingModule({declarations: [App, HostBindingDir]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const hostBindingEl = fixture.nativeElement.querySelector('div');

        // Needs `toLowerCase`, because different browsers produce
        // attributes either in camel case or lower case.
        expect(hostBindingEl.getAttribute('aria-label')).toBe('some label');

        fixture.componentInstance.hostBindingDir.label = 'other label';
        fixture.detectChanges();

        expect(hostBindingEl.getAttribute('aria-label')).toBe('other label');
      });
    });

    describe('elementStyle', () => {
      it('should support binding to styles', () => {
        @Component({
          template: '<span [style.font-size]="size"></span>',
          standalone: false,
        })
        class App {
          size: string | null = '';
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.size = '10px';
        fixture.detectChanges();
        const span: HTMLElement = fixture.nativeElement.querySelector('span');

        expect(span.style.fontSize).toBe('10px');

        fixture.componentInstance.size = '16px';
        fixture.detectChanges();
        expect(span.style.fontSize).toBe('16px');

        fixture.componentInstance.size = null;
        fixture.detectChanges();
        expect(span.style.fontSize).toBeFalsy();
      });

      it('should support binding to styles with suffix', () => {
        @Component({
          template: '<span [style.font-size.px]="size"></span>',
          standalone: false,
        })
        class App {
          size: string | number | null = '';
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.size = '100';
        fixture.detectChanges();
        const span: HTMLElement = fixture.nativeElement.querySelector('span');

        expect(span.style.fontSize).toEqual('100px');

        fixture.componentInstance.size = 200;
        fixture.detectChanges();
        expect(span.style.fontSize).toEqual('200px');

        fixture.componentInstance.size = 0;
        fixture.detectChanges();
        expect(span.style.fontSize).toEqual('0px');

        fixture.componentInstance.size = null;
        fixture.detectChanges();
        expect(span.style.fontSize).toBeFalsy();
      });
    });

    describe('class-based styling', () => {
      it('should support CSS class toggle', () => {
        @Component({
          template: '<span [class.active]="value"></span>',
          standalone: false,
        })
        class App {
          value: any;
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.value = true;
        fixture.detectChanges();
        const span = fixture.nativeElement.querySelector('span');

        expect(span.getAttribute('class')).toEqual('active');

        fixture.componentInstance.value = false;
        fixture.detectChanges();
        expect(span.getAttribute('class')).toBeFalsy();

        // truthy values
        fixture.componentInstance.value = 'a_string';
        fixture.detectChanges();
        expect(span.getAttribute('class')).toEqual('active');

        fixture.componentInstance.value = 10;
        fixture.detectChanges();
        expect(span.getAttribute('class')).toEqual('active');

        // falsy values
        fixture.componentInstance.value = '';
        fixture.detectChanges();
        expect(span.getAttribute('class')).toBeFalsy();

        fixture.componentInstance.value = 0;
        fixture.detectChanges();
        expect(span.getAttribute('class')).toBeFalsy();
      });

      it('should work correctly with existing static classes', () => {
        @Component({
          template: '<span class="existing" [class.active]="value"></span>',
          standalone: false,
        })
        class App {
          value: any;
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.value = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual('<span class="existing active"></span>');

        fixture.componentInstance.value = false;
        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toEqual('<span class="existing"></span>');
      });

      it('should apply classes properly when nodes are components', () => {
        @Component({
          selector: 'my-comp',
          template: 'Comp Content',
          standalone: false,
        })
        class MyComp {}

        @Component({
          template: '<my-comp [class.active]="value"></my-comp>',
          standalone: false,
        })
        class App {
          value: any;
        }

        TestBed.configureTestingModule({declarations: [App, MyComp]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.value = true;
        fixture.detectChanges();
        const compElement = fixture.nativeElement.querySelector('my-comp');

        expect(fixture.nativeElement.textContent).toContain('Comp Content');
        expect(compElement.getAttribute('class')).toBe('active');

        fixture.componentInstance.value = false;
        fixture.detectChanges();
        expect(compElement.getAttribute('class')).toBeFalsy();
      });

      it('should apply classes properly when nodes have containers', () => {
        @Component({
          selector: 'structural-comp',
          template: 'Comp Content',
          standalone: false,
        })
        class StructuralComp {
          @Input() tmp!: TemplateRef<any>;

          constructor(public vcr: ViewContainerRef) {}

          create() {
            this.vcr.createEmbeddedView(this.tmp);
          }
        }

        @Component({
          template: `
            <ng-template #foo>Temp Content</ng-template>
            <structural-comp [class.active]="value" [tmp]="foo"></structural-comp>
          `,
          standalone: false,
        })
        class App {
          @ViewChild(StructuralComp) structuralComp!: StructuralComp;
          value: any;
        }

        TestBed.configureTestingModule({declarations: [App, StructuralComp]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.value = true;
        fixture.detectChanges();
        const structuralCompEl = fixture.nativeElement.querySelector('structural-comp');

        expect(structuralCompEl.getAttribute('class')).toEqual('active');

        fixture.componentInstance.structuralComp.create();
        fixture.detectChanges();
        expect(structuralCompEl.getAttribute('class')).toEqual('active');

        fixture.componentInstance.value = false;
        fixture.detectChanges();
        expect(structuralCompEl.getAttribute('class')).toBeFalsy();
      });

      @Directive({
        selector: '[DirWithClass]',
        standalone: false,
      })
      class DirWithClassDirective {
        public classesVal: string = '';

        @Input('class')
        set klass(value: string) {
          this.classesVal = value;
        }
      }

      @Directive({
        selector: '[DirWithStyle]',
        standalone: false,
      })
      class DirWithStyleDirective {
        public stylesVal: any = '';

        @Input()
        set style(value: any) {
          this.stylesVal = value;
        }
      }

      it('should delegate initial classes to a [class] input binding if present on a directive on the same element', () => {
        @Component({
          template: '<div class="apple orange banana" DirWithClass></div>',
          standalone: false,
        })
        class App {
          @ViewChild(DirWithClassDirective) mockClassDirective!: DirWithClassDirective;
        }

        TestBed.configureTestingModule({declarations: [App, DirWithClassDirective]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        // the initial values always get sorted in non VE code
        // but there is no sorting guarantee within VE code
        expect(fixture.componentInstance.mockClassDirective.classesVal.split(/\s+/).sort()).toEqual(
          ['apple', 'banana', 'orange'],
        );
      });

      it('should delegate initial styles to a [style] input binding if present on a directive on the same element', () => {
        @Component({
          template: '<div style="width: 100px; height: 200px" DirWithStyle></div>',
          standalone: false,
        })
        class App {
          @ViewChild(DirWithStyleDirective) mockStyleDirective!: DirWithStyleDirective;
        }

        TestBed.configureTestingModule({declarations: [App, DirWithStyleDirective]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const styles = fixture.componentInstance.mockStyleDirective.stylesVal;

        expect(styles).toEqual('width: 100px; height: 200px;');
      });

      it('should update `[class]` and bindings in the provided directive if the input is matched', () => {
        @Component({
          template: '<div DirWithClass [class]="value"></div>',
          standalone: false,
        })
        class App {
          @ViewChild(DirWithClassDirective) mockClassDirective!: DirWithClassDirective;
          value = '';
        }

        TestBed.configureTestingModule({declarations: [App, DirWithClassDirective]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.value = 'cucumber grape';
        fixture.detectChanges();

        expect(fixture.componentInstance.mockClassDirective.classesVal).toEqual('cucumber grape');
      });

      it('should update `[style]` and bindings in the provided directive if the input is matched', () => {
        @Component({
          template: '<div DirWithStyle [style]="value"></div>',
          standalone: false,
        })
        class App {
          @ViewChild(DirWithStyleDirective) mockStyleDirective!: DirWithStyleDirective;
          value!: {[key: string]: string};
        }

        TestBed.configureTestingModule({declarations: [App, DirWithStyleDirective]});
        const fixture = TestBed.createComponent(App);
        fixture.componentInstance.value = {width: '200px', height: '500px'};
        fixture.detectChanges();

        expect(fixture.componentInstance.mockStyleDirective.stylesVal).toEqual({
          width: '200px',
          height: '500px',
        });
      });

      it('should apply initial styling to the element that contains the directive with host styling', () => {
        @Directive({
          selector: '[DirWithInitialStyling]',
          host: {
            'title': 'foo',
            'class': 'heavy golden',
            'style': 'color: purple',
            '[style.font-weight]': '"bold"',
          },
          standalone: false,
        })
        class DirWithInitialStyling {}

        @Component({
          template: `
                <div DirWithInitialStyling
                  class="big"
                  style="color:black; font-size:200px"></div>
             `,
          standalone: false,
        })
        class App {}

        TestBed.configureTestingModule({declarations: [App, DirWithInitialStyling]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const target: HTMLDivElement = fixture.nativeElement.querySelector('div');
        const classes = target.getAttribute('class')!.split(/\s+/).sort();
        expect(classes).toEqual(['big', 'golden', 'heavy']);

        expect(target.getAttribute('title')).toEqual('foo');
        expect(target.style.getPropertyValue('color')).toEqual('black');
        expect(target.style.getPropertyValue('font-size')).toEqual('200px');
        expect(target.style.getPropertyValue('font-weight')).toEqual('bold');
      });

      it("should apply single styling bindings present within a directive onto the same element and defer the element's initial styling values when missing", () => {
        @Directive({
          selector: '[DirWithSingleStylingBindings]',
          host: {
            'class': 'def',
            '[class.xyz]': 'activateXYZClass',
            '[style.width]': 'width',
            '[style.height]': 'height',
          },
          standalone: false,
        })
        class DirWithSingleStylingBindings {
          width: string | null | undefined = undefined;
          height: string | null | undefined = undefined;
          activateXYZClass: boolean = false;
        }

        @Component({
          template: `
              <div DirWithSingleStylingBindings class="abc" style="width:100px;"></div>
            `,
          standalone: false,
        })
        class App {
          @ViewChild(DirWithSingleStylingBindings) dirInstance!: DirWithSingleStylingBindings;
        }

        TestBed.configureTestingModule({declarations: [App, DirWithSingleStylingBindings]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const dirInstance = fixture.componentInstance.dirInstance;
        const target: HTMLDivElement = fixture.nativeElement.querySelector('div');
        expect(target.style.getPropertyValue('width')).toEqual('100px');
        expect(target.style.getPropertyValue('height')).toEqual('');
        expect(target.classList.contains('abc')).toBeTruthy();
        expect(target.classList.contains('def')).toBeTruthy();
        expect(target.classList.contains('xyz')).toBeFalsy();

        dirInstance.width = '444px';
        dirInstance.height = '999px';
        dirInstance.activateXYZClass = true;
        fixture.detectChanges();

        expect(target.style.getPropertyValue('width')).toEqual('100px');
        expect(target.style.getPropertyValue('height')).toEqual('999px');
        expect(target.classList.contains('abc')).toBeTruthy();
        expect(target.classList.contains('def')).toBeTruthy();
        expect(target.classList.contains('xyz')).toBeTruthy();

        dirInstance.width = undefined;
        dirInstance.height = undefined;
        fixture.detectChanges();

        expect(target.style.getPropertyValue('width')).toEqual('100px');
        expect(target.style.getPropertyValue('height')).toEqual('');
        expect(target.classList.contains('abc')).toBeTruthy();
        expect(target.classList.contains('def')).toBeTruthy();
        expect(target.classList.contains('xyz')).toBeTruthy();
      });

      it('should properly prioritize single style binding collisions when they exist on multiple directives', () => {
        @Directive({
          selector: '[Dir1WithStyle]',
          host: {'[style.width]': 'width'},
          standalone: false,
        })
        class Dir1WithStyle {
          width: null | string | undefined = undefined;
        }

        @Directive({
          selector: '[Dir2WithStyle]',
          host: {'style': 'width: 111px', '[style.width]': 'width'},
          standalone: false,
        })
        class Dir2WithStyle {
          width: null | string | undefined = undefined;
        }

        @Component({
          template: '<div Dir1WithStyle Dir2WithStyle [style.width]="width"></div>',
          standalone: false,
        })
        class App {
          @ViewChild(Dir1WithStyle) dir1Instance!: Dir1WithStyle;
          @ViewChild(Dir2WithStyle) dir2Instance!: Dir2WithStyle;
          width: string | null | undefined = undefined;
        }

        TestBed.configureTestingModule({declarations: [App, Dir2WithStyle, Dir1WithStyle]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const {dir1Instance, dir2Instance} = fixture.componentInstance;

        const target: HTMLDivElement = fixture.nativeElement.querySelector('div');
        expect(target.style.getPropertyValue('width')).toEqual('111px');

        fixture.componentInstance.width = '999px';
        dir1Instance.width = '222px';
        dir2Instance.width = '333px';
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('999px');

        fixture.componentInstance.width = undefined;
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('222px');

        dir1Instance.width = undefined;
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('333px');

        dir2Instance.width = undefined;
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('111px');

        dir1Instance.width = '666px';
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('666px');

        fixture.componentInstance.width = '777px';
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('777px');
      });

      it('should properly prioritize multi style binding collisions when they exist on multiple directives', () => {
        @Directive({
          selector: '[Dir1WithStyling]',
          host: {'[style]': 'stylesExp', '[class]': 'classesExp'},
          standalone: false,
        })
        class Dir1WithStyling {
          classesExp: any = {};
          stylesExp: any = {};
        }

        @Directive({
          selector: '[Dir2WithStyling]',
          host: {'style': 'width: 111px', '[style]': 'stylesExp'},
          standalone: false,
        })
        class Dir2WithStyling {
          stylesExp: any = {};
        }

        @Component({
          template:
            '<div Dir1WithStyling Dir2WithStyling [style]="stylesExp" [class]="classesExp"></div>',
          standalone: false,
        })
        class App {
          @ViewChild(Dir1WithStyling) dir1Instance!: Dir1WithStyling;
          @ViewChild(Dir2WithStyling) dir2Instance!: Dir2WithStyling;
          stylesExp: any = {};
          classesExp: any = {};
        }

        TestBed.configureTestingModule({declarations: [App, Dir2WithStyling, Dir1WithStyling]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const {dir1Instance, dir2Instance} = fixture.componentInstance;

        const target = fixture.nativeElement.querySelector('div')!;
        expect(target.style.getPropertyValue('width')).toEqual('111px');

        const compInstance = fixture.componentInstance;
        compInstance.stylesExp = {width: '999px', height: undefined};
        compInstance.classesExp = {one: true, two: false};
        dir1Instance.stylesExp = {width: '222px'};
        dir1Instance.classesExp = {two: true, three: false};
        dir2Instance.stylesExp = {width: '333px', height: '100px'};
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('999px');
        expect(target.style.getPropertyValue('height')).toEqual('100px');
        expect(target.classList.contains('one')).toBeTruthy();
        expect(target.classList.contains('two')).toBeFalsy();
        expect(target.classList.contains('three')).toBeFalsy();

        compInstance.stylesExp = {};
        compInstance.classesExp = {};
        dir1Instance.stylesExp = {width: '222px', height: '200px'};
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('222px');
        expect(target.style.getPropertyValue('height')).toEqual('200px');
        expect(target.classList.contains('one')).toBeFalsy();
        expect(target.classList.contains('two')).toBeTruthy();
        expect(target.classList.contains('three')).toBeFalsy();

        dir1Instance.stylesExp = {};
        dir1Instance.classesExp = {};
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('333px');
        expect(target.style.getPropertyValue('height')).toEqual('100px');
        expect(target.classList.contains('one')).toBeFalsy();
        expect(target.classList.contains('two')).toBeFalsy();
        expect(target.classList.contains('three')).toBeFalsy();

        dir2Instance.stylesExp = {};
        compInstance.stylesExp = {height: '900px'};
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('111px');
        expect(target.style.getPropertyValue('height')).toEqual('900px');

        dir1Instance.stylesExp = {width: '666px', height: '600px'};
        dir1Instance.classesExp = {four: true, one: true};
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('666px');
        expect(target.style.getPropertyValue('height')).toEqual('900px');
        expect(target.classList.contains('one')).toBeTruthy();
        expect(target.classList.contains('two')).toBeFalsy();
        expect(target.classList.contains('three')).toBeFalsy();
        expect(target.classList.contains('four')).toBeTruthy();

        compInstance.stylesExp = {width: '777px'};
        compInstance.classesExp = {four: false};
        fixture.detectChanges();
        expect(target.style.getPropertyValue('width')).toEqual('777px');
        expect(target.style.getPropertyValue('height')).toEqual('600px');
        expect(target.classList.contains('one')).toBeTruthy();
        expect(target.classList.contains('two')).toBeFalsy();
        expect(target.classList.contains('three')).toBeFalsy();
        expect(target.classList.contains('four')).toBeFalsy();
      });
    });

    it('should properly handle and render interpolation for class attribute bindings', () => {
      @Component({
        template: '<div class="-{{name}}-{{age}}-"></div>',
        standalone: false,
      })
      class App {
        name = '';
        age = '';
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      const target = fixture.nativeElement.querySelector('div')!;

      expect(target.classList.contains('-fred-36-')).toBeFalsy();

      fixture.componentInstance.name = 'fred';
      fixture.componentInstance.age = '36';
      fixture.detectChanges();

      expect(target.classList.contains('-fred-36-')).toBeTruthy();
    });
  });

  describe('NgModule assertions', () => {
    it('should throw with descriptive error message when a module imports itself', () => {
      @Component({
        template: '',
        standalone: false,
      })
      class FixtureComponent {}

      @NgModule({imports: [SomeModule], declarations: [FixtureComponent]})
      class SomeModule {}
      expect(() => {
        TestBed.configureTestingModule({imports: [SomeModule]}).createComponent(FixtureComponent);
      }).toThrowError(`'SomeModule' module can't import itself`);
    });

    it('should throw with descriptive error message when a directive is passed to imports', () => {
      @Component({
        template: '',
        standalone: false,
      })
      class SomeComponent {}

      @NgModule({imports: [SomeComponent]})
      class ModuleWithImportedComponent {}
      expect(() => {
        TestBed.configureTestingModule({imports: [ModuleWithImportedComponent]}).createComponent(
          SomeComponent,
        );
      }).toThrowError(
        /^Unexpected directive 'SomeComponent' imported by the module 'ModuleWithImportedComponent'\. Please add an @NgModule annotation\.$/,
      );
    });

    it('should throw with descriptive error message when a pipe is passed to imports', () => {
      @Component({
        template: '',
        standalone: false,
      })
      class FixtureComponent {}
      @Pipe({
        name: 'somePipe',
        standalone: false,
      })
      class SomePipe {}
      @NgModule({imports: [SomePipe], declarations: [FixtureComponent]})
      class ModuleWithImportedPipe {}
      expect(() => {
        TestBed.configureTestingModule({imports: [ModuleWithImportedPipe]}).createComponent(
          FixtureComponent,
        );
      }).toThrowError(
        /^Unexpected pipe 'SomePipe' imported by the module 'ModuleWithImportedPipe'\. Please add an @NgModule annotation\.$/,
      );
    });

    it('should throw with descriptive error message when a module is passed to declarations', () => {
      @Component({
        template: '',
        standalone: false,
      })
      class FixtureComponent {}
      @NgModule({})
      class SomeModule {}
      @NgModule({declarations: [SomeModule, FixtureComponent]})
      class ModuleWithDeclaredModule {}

      const expectedErrorMessage = `Unexpected value 'SomeModule' declared by the module 'ModuleWithDeclaredModule'. Please add a @Pipe/@Directive/@Component annotation.`;

      expect(() => {
        TestBed.configureTestingModule({imports: [ModuleWithDeclaredModule]}).createComponent(
          FixtureComponent,
        );
      }).toThrowError(expectedErrorMessage);
    });

    it('should throw with descriptive error message when a declaration is missing annotation', () => {
      @Component({
        template: '',
        standalone: false,
      })
      class FixtureComponent {}
      class SomeClass {}
      @NgModule({declarations: [SomeClass, FixtureComponent]})
      class SomeModule {}
      expect(() => {
        TestBed.configureTestingModule({imports: [SomeModule]}).createComponent(FixtureComponent);
      }).toThrowError(
        `Unexpected value 'SomeClass' declared by the module 'SomeModule'. Please add a @Pipe/@Directive/@Component annotation.`,
      );
    });

    it('should throw with descriptive error message when an imported module is missing annotation', () => {
      @Component({
        template: '',
        standalone: false,
      })
      class FixtureComponent {}
      class SomeModule {}
      @NgModule({imports: [SomeModule], declarations: [FixtureComponent]})
      class ModuleWithImportedModule {}
      expect(() => {
        TestBed.configureTestingModule({imports: [ModuleWithImportedModule]}).createComponent(
          FixtureComponent,
        );
      }).toThrowError(
        /^Unexpected value 'SomeModule' imported by the module 'ModuleWithImportedModule'\. Please add an @NgModule annotation\.$/,
      );
    });
  });

  describe('self-closing tags', () => {
    it('should allow a self-closing tag for a custom tag name', () => {
      @Component({
        selector: 'my-comp',
        template: 'hello',
        standalone: false,
      })
      class MyComp {}

      @Component({
        template: '<my-comp/>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyComp]});
      const fixture = TestBed.createComponent(App);

      expect(fixture.nativeElement.innerHTML).toEqual('<my-comp>hello</my-comp>');
    });

    it('should not confuse self-closing tag for an end tag', () => {
      @Component({
        selector: 'my-comp',
        template: '<ng-content/>',
        standalone: false,
      })
      class MyComp {}

      @Component({
        template: '<my-comp title="a">Before<my-comp title="b"/>After</my-comp>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyComp]});
      const fixture = TestBed.createComponent(App);

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<my-comp title="a">Before<my-comp title="b"></my-comp>After</my-comp>',
      );
    });
  });

  it('should only call inherited host listeners once', () => {
    let clicks = 0;

    @Component({
      template: '',
      standalone: false,
    })
    class ButtonSuperClass {
      @HostListener('click')
      clicked() {
        clicks++;
      }
    }

    @Component({
      selector: 'button[custom-button]',
      template: '',
      standalone: false,
    })
    class ButtonSubClass extends ButtonSuperClass {}

    @Component({
      template: '<button custom-button></button>',
      standalone: false,
    })
    class MyApp {}

    TestBed.configureTestingModule({declarations: [MyApp, ButtonSuperClass, ButtonSubClass]});
    const fixture = TestBed.createComponent(MyApp);
    const button = fixture.debugElement.query(By.directive(ButtonSubClass));
    fixture.detectChanges();

    button.nativeElement.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should support inherited view queries', () => {
    @Directive({
      selector: '[someDir]',
      standalone: false,
    })
    class SomeDir {}

    @Component({
      template: '<div someDir></div>',
      standalone: false,
    })
    class SuperComp {
      @ViewChildren(SomeDir) dirs!: QueryList<SomeDir>;
    }

    @Component({
      selector: 'button[custom-button]',
      template: '<div someDir></div>',
      standalone: false,
    })
    class SubComp extends SuperComp {}

    @Component({
      template: '<button custom-button></button>',
      standalone: false,
    })
    class MyApp {}

    TestBed.configureTestingModule({declarations: [MyApp, SuperComp, SubComp, SomeDir]});
    const fixture = TestBed.createComponent(MyApp);
    const subInstance = fixture.debugElement.query(By.directive(SubComp)).componentInstance;
    fixture.detectChanges();

    expect(subInstance.dirs.length).toBe(1);
    expect(subInstance.dirs.first).toBeInstanceOf(SomeDir);
  });

  it('should not set inputs after destroy', () => {
    @Directive({
      selector: '[no-assign-after-destroy]',
      standalone: false,
    })
    class NoAssignAfterDestroy {
      private _isDestroyed = false;

      @Input()
      get value() {
        return this._value;
      }
      set value(newValue: any) {
        if (this._isDestroyed) {
          throw Error('Cannot assign to value after destroy.');
        }

        this._value = newValue;
      }
      private _value: any;

      ngOnDestroy() {
        this._isDestroyed = true;
      }
    }

    @Component({
      template: '<div no-assign-after-destroy [value]="directiveValue"></div>',
      standalone: false,
    })
    class App {
      directiveValue = 'initial-value';
    }

    TestBed.configureTestingModule({declarations: [NoAssignAfterDestroy, App]});
    let fixture = TestBed.createComponent(App);
    fixture.destroy();

    expect(() => {
      fixture = TestBed.createComponent(App);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should support host attribute and @ContentChild on the same component', () => {
    @Component({
      selector: 'test-component',
      template: `foo`,
      host: {'[attr.aria-disabled]': 'true'},
      standalone: false,
    })
    class TestComponent {
      @ContentChild(TemplateRef, {static: true}) tpl!: TemplateRef<any>;
    }

    TestBed.configureTestingModule({declarations: [TestComponent]});
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.tpl).not.toBeNull();
    expect(fixture.debugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should inherit inputs from undecorated superclasses', () => {
    class ButtonSuperClass {
      @Input() isDisabled!: boolean;
    }

    @Component({
      selector: 'button[custom-button]',
      template: '',
      standalone: false,
    })
    class ButtonSubClass extends ButtonSuperClass {}

    @Component({
      template: '<button custom-button [isDisabled]="disableButton"></button>',
      standalone: false,
    })
    class MyApp {
      disableButton = false;
    }

    TestBed.configureTestingModule({declarations: [MyApp, ButtonSubClass]});
    const fixture = TestBed.createComponent(MyApp);
    const button = fixture.debugElement.query(By.directive(ButtonSubClass)).componentInstance;
    fixture.detectChanges();

    expect(button.isDisabled).toBe(false);

    fixture.componentInstance.disableButton = true;
    fixture.detectChanges();

    expect(button.isDisabled).toBe(true);
  });

  it('should inherit outputs from undecorated superclasses', () => {
    let clicks = 0;

    class ButtonSuperClass {
      @Output() clicked = new EventEmitter<void>();
      emitClick() {
        this.clicked.emit();
      }
    }

    @Component({
      selector: 'button[custom-button]',
      template: '',
      standalone: false,
    })
    class ButtonSubClass extends ButtonSuperClass {}

    @Component({
      template: '<button custom-button (clicked)="handleClick()"></button>',
      standalone: false,
    })
    class MyApp {
      handleClick() {
        clicks++;
      }
    }

    TestBed.configureTestingModule({declarations: [MyApp, ButtonSubClass]});
    const fixture = TestBed.createComponent(MyApp);
    const button = fixture.debugElement.query(By.directive(ButtonSubClass)).componentInstance;

    button.emitClick();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host bindings from undecorated superclasses', () => {
    class BaseButton {
      @HostBinding('attr.tabindex') tabindex = -1;
    }

    @Component({
      selector: '[sub-button]',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class SubButton extends BaseButton {}

    @Component({
      template: '<button sub-button>Click me</button>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [SubButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton));
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('-1');

    button.componentInstance.tabindex = 2;
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('2');
  });

  it('should inherit host bindings from undecorated grand superclasses', () => {
    class SuperBaseButton {
      @HostBinding('attr.tabindex') tabindex = -1;
    }

    class BaseButton extends SuperBaseButton {}

    @Component({
      selector: '[sub-button]',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class SubButton extends BaseButton {}

    @Component({
      template: '<button sub-button>Click me</button>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [SubButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton));
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('-1');

    button.componentInstance.tabindex = 2;
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('2');
  });

  it('should inherit host listeners from undecorated superclasses', () => {
    let clicks = 0;

    class BaseButton {
      @HostListener('click')
      handleClick() {
        clicks++;
      }
    }

    @Component({
      selector: '[sub-button]',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class SubButton extends BaseButton {}

    @Component({
      template: '<button sub-button>Click me</button>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [SubButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host listeners from superclasses once', () => {
    let clicks = 0;

    @Directive({
      selector: '[baseButton]',
      standalone: false,
    })
    class BaseButton {
      @HostListener('click')
      handleClick() {
        clicks++;
      }
    }

    @Component({
      selector: '[subButton]',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class SubButton extends BaseButton {}

    @Component({
      template: '<button subButton>Click me</button>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [SubButton, BaseButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host listeners from grand superclasses once', () => {
    let clicks = 0;

    @Directive({
      selector: '[superBaseButton]',
      standalone: false,
    })
    class SuperBaseButton {
      @HostListener('click')
      handleClick() {
        clicks++;
      }
    }

    @Directive({
      selector: '[baseButton]',
      standalone: false,
    })
    class BaseButton extends SuperBaseButton {}

    @Component({
      selector: '[subButton]',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class SubButton extends BaseButton {}

    @Component({
      template: '<button subButton>Click me</button>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [SubButton, SuperBaseButton, BaseButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host listeners from grand grand superclasses once', () => {
    let clicks = 0;

    @Directive({
      selector: '[superSuperBaseButton]',
      standalone: false,
    })
    class SuperSuperBaseButton {
      @HostListener('click')
      handleClick() {
        clicks++;
      }
    }

    @Directive({
      selector: '[superBaseButton]',
      standalone: false,
    })
    class SuperBaseButton extends SuperSuperBaseButton {}

    @Directive({
      selector: '[baseButton]',
      standalone: false,
    })
    class BaseButton extends SuperBaseButton {}

    @Component({
      selector: '[subButton]',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class SubButton extends BaseButton {}

    @Component({
      template: '<button subButton>Click me</button>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({
      declarations: [SubButton, SuperBaseButton, SuperSuperBaseButton, BaseButton, App],
    });
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should not mask errors thrown during lifecycle hooks', () => {
    @Directive({
      selector: '[dir]',
      inputs: ['dir'],
      standalone: false,
    })
    class Dir {
      get dir(): any {
        return null;
      }

      set dir(value: any) {
        throw new Error('this error is expected');
      }
    }

    @Component({
      template: '<div [dir]="3"></div>',
      standalone: false,
    })
    class Cmp {
      ngAfterViewInit(): void {
        // This lifecycle hook should never run, since attempting to bind to Dir's input will throw
        // an error. If the runtime continues to run lifecycle hooks after that error, then it will
        // execute this hook and throw this error, which will mask the real problem. This test
        // verifies this don't happen.
        throw new Error('this error is unexpected');
      }
    }

    TestBed.configureTestingModule({
      declarations: [Cmp, Dir],
    });
    const fixture = TestBed.createComponent(Cmp);
    expect(() => fixture.detectChanges()).toThrowError('this error is expected');
  });

  it('should handle nullish coalescing inside templates', () => {
    @Component({
      template: `
        <span [title]="'Your last name is ' + (lastName ?? lastNameFallback ?? 'unknown')">
          Hello, {{ firstName ?? 'Frodo' }}!
          You are a Balrog: {{ falsyValue ?? true }}
        </span>
      `,
      standalone: false,
    })
    class App {
      firstName: string | null = null;
      lastName: string | null = null;
      lastNameFallback = 'Baggins';
      falsyValue = false;
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const content = fixture.nativeElement.innerHTML;

    expect(content).toContain('Hello, Frodo!');
    expect(content).toContain('You are a Balrog: false');
    expect(content).toContain(`<span title="Your last name is Baggins">`);
  });

  it('should handle safe keyed reads inside templates', () => {
    @Component({
      template: `
      <span [title]="'Your last name is ' + (unknownNames?.[0] || 'unknown')">
        Hello, {{ knownNames?.[0]?.[1] }}!
        You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
        You are an Elf: {{ speciesMap?.[keys?.[0] ?? 'key'] }}
        You are an Orc: {{ speciesMap?.['key'] }}
      </span>
    `,
      standalone: false,
    })
    class App {
      unknownNames: string[] | null = null;
      knownNames: string[][] = [['Frodo', 'Bilbo']];
      species = null;
      keys = null;
      speciesMap: Record<string, string> = {key: 'unknown'};
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const content = fixture.nativeElement.innerHTML;

    expect(content).toContain('Hello, Bilbo!');
    expect(content).toContain('You are a Balrog: unknown');
    expect(content).toContain('You are an Elf: unknown');
    expect(content).toContain(`<span title="Your last name is unknown">`);
  });

  it('should handle safe keyed reads inside templates', () => {
    @Component({
      template: `
        <span [title]="'Your last name is ' + (person.getLastName?.() ?? 'unknown')">
          Hello, {{ person.getName?.() }}!
          You are a Balrog: {{ person.getSpecies?.()?.()?.()?.()?.() || 'unknown' }}
        </span>
      `,
      standalone: false,
    })
    class App {
      person: {
        getName: () => string;
        getLastName?: () => string;
        getSpecies?: () => () => () => () => () => string;
      } = {getName: () => 'Bilbo'};
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const content = fixture.nativeElement.innerHTML;

    expect(content).toContain('Hello, Bilbo!');
    expect(content).toContain('You are a Balrog: unknown');
    expect(content).toContain(`<span title="Your last name is unknown">`);
  });

  it('should not invoke safe calls more times than plain calls', () => {
    const returnValue = () => () => () => () => 'hi';
    let plainCalls = 0;
    let safeCalls = 0;

    @Component({
      template: `{{ safe?.()?.()?.()?.()?.() }} {{ plain()()()()() }}`,
      standalone: false,
    })
    class App {
      plain() {
        plainCalls++;
        return returnValue;
      }

      safe() {
        safeCalls++;
        return returnValue;
      }
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(safeCalls).toBeGreaterThan(0);
    expect(safeCalls).toBe(plainCalls);
  });

  it('should handle nullish coalescing inside host bindings', () => {
    const logs: string[] = [];

    @Directive({
      selector: '[some-dir]',
      host: {
        '[attr.first-name]': `'Hello, ' + (firstName ?? 'Frodo') + '!'`,
        '(click)': `logLastName(lastName ?? lastNameFallback ?? 'unknown')`,
      },
      standalone: false,
    })
    class Dir {
      firstName: string | null = null;
      lastName: string | null = null;
      lastNameFallback = 'Baggins';

      logLastName(name: string) {
        logs.push(name);
      }
    }

    @Component({
      template: `<button some-dir>Click me</button>`,
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('first-name')).toBe('Hello, Frodo!');
    expect(logs).toEqual(['Baggins']);
  });

  it('should render SVG nodes placed inside ng-template', () => {
    @Component({
      template: `
        <svg>
          <ng-template [ngIf]="condition">
            <text>Hello</text>
          </ng-template>
        </svg>
      `,
      standalone: false,
    })
    class MyComp {
      condition = true;
    }

    TestBed.configureTestingModule({declarations: [MyComp], imports: [CommonModule]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toContain('<text>Hello</text>');
  });

  it('should handle shorthand property declarations in templates', () => {
    @Directive({
      selector: '[my-dir]',
      standalone: false,
    })
    class Dir {
      @Input('my-dir') value: any;
    }

    @Component({
      template: `<div [my-dir]="{a, b: 2, someProp}"></div>`,
      standalone: false,
    })
    class App {
      @ViewChild(Dir) directive!: Dir;
      a = 1;
      someProp = 3;
    }

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.directive.value).toEqual({a: 1, b: 2, someProp: 3});
  });

  it('should handle numeric separators in templates', () => {
    @Component({
      template: 'Balance: ${{ 1_000_000 * multiplier }}',
      standalone: false,
    })
    class App {
      multiplier = 5;
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Balance: $5000000');
  });

  it('should handle calls to a safe access in templates', () => {
    @Component({
      template: `
      <span>Hello, {{ (person?.getName() || 'unknown') }}!</span>
    `,
      standalone: false,
    })
    class App {
      person = null;
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hello, unknown!');
  });

  it('should handle nested calls to a safe access methods in templates', () => {
    const log: string[] = [];

    class Person {
      constructor(
        public name: string,
        public title: string,
      ) {}

      getName(includeTitle: boolean | undefined) {
        log.push(`person.getName(${includeTitle})`);
        return includeTitle ? `${this.title} ${this.name}` : this.name;
      }
    }

    @Component({
      template: `
      <span>Hello, {{ (person?.getName(getConfig('showTitle')?.enabled ?? getDefaultShowTitle()) ?? getFallbackName()) }}!</span>
    `,
      standalone: false,
    })
    class App {
      person: Person | null = null;
      showTitle: boolean | null = null;

      getConfig(name: string): {enabled: boolean} | null {
        log.push(`getConfig(${name})`);
        return this.showTitle !== null ? {enabled: this.showTitle} : null;
      }

      getDefaultShowTitle(): boolean {
        log.push(`getDefaultShowTitle()`);
        return false;
      }

      getFallbackName(): string {
        log.push(`getFallbackName()`);
        return 'unknown';
      }
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(/* checkNoChanges */ false);
    expect(fixture.nativeElement.textContent).toContain('Hello, unknown!');
    expect(log).toEqual(['getFallbackName()']);
    log.length = 0;

    fixture.componentInstance.person = new Person('Penelope', 'Lady');
    fixture.detectChanges(/* checkNoChanges */ false);
    expect(fixture.nativeElement.textContent).toContain('Hello, Penelope!');
    expect(log).toEqual(['getConfig(showTitle)', 'getDefaultShowTitle()', 'person.getName(false)']);
    log.length = 0;

    fixture.componentInstance.showTitle = true;
    fixture.detectChanges(/* checkNoChanges */ false);
    expect(fixture.nativeElement.textContent).toContain('Hello, Lady Penelope!');
    expect(log).toEqual(['getConfig(showTitle)', 'person.getName(true)']);
    log.length = 0;

    fixture.componentInstance.showTitle = false;
    fixture.detectChanges(/* checkNoChanges */ false);
    expect(fixture.nativeElement.textContent).toContain('Hello, Penelope!');
    expect(log).toEqual(['getConfig(showTitle)', 'person.getName(false)']);
    log.length = 0;
  });

  it('should remove child LView from the registry when the root view is destroyed', () => {
    @Component({
      template: '<child></child>',
      standalone: false,
    })
    class App {}

    @Component({
      selector: 'child',
      template: '<grand-child></grand-child>',
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'grand-child',
      template: '',
      standalone: false,
    })
    class GrandChild {}

    TestBed.configureTestingModule({declarations: [App, Child, GrandChild]});
    const fixture = TestBed.createComponent(App);
    const grandChild = fixture.debugElement.query(By.directive(GrandChild)).componentInstance;
    fixture.detectChanges();
    const leafLView = readPatchedLView(grandChild)!;
    const lViewIds: number[] = [];
    let current: LView | LContainer | null = leafLView;

    while (current) {
      isLView(current) && lViewIds.push(current[ID]);
      current = current[PARENT];
    }

    // We expect 3 views: `GrandChild`, `Child` and `App`.
    expect(lViewIds).toEqual([leafLView[ID], leafLView[ID] - 1, leafLView[ID] - 2]);
    expect(lViewIds.every((id) => getLViewById(id) !== null)).toBe(true);

    fixture.destroy();

    // Expect all 3 views to be removed from the registry once the root is destroyed.
    expect(lViewIds.map(getLViewById)).toEqual([null, null, null]);
  });

  it('should handle content inside <template> elements', () => {
    @Component({
      template: '<template><strong>Hello</strong><em>World</em></template>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const template: HTMLTemplateElement = fixture.nativeElement.querySelector('template');
    // `content` won't exist in browsers that don't support `template`.
    const root = template.content || template;

    expect(root.childNodes.length).toBe(2);
    expect(root.childNodes[0].textContent).toBe('Hello');
    expect((root.childNodes[0] as HTMLElement).tagName).toBe('STRONG');
    expect(root.childNodes[1].textContent).toBe('World');
    expect((root.childNodes[1] as HTMLElement).tagName).toBe('EM');
  });

  it('should be able to insert and remove elements inside <template>', () => {
    @Component({
      template: '<template><strong *ngIf="render">Hello</strong></template>',
      standalone: false,
    })
    class App {
      render = true;
    }

    TestBed.configureTestingModule({declarations: [App], imports: [CommonModule]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const template: HTMLTemplateElement = fixture.nativeElement.querySelector('template');
    // `content` won't exist in browsers that don't support `template`.
    const root = template.content || template;

    expect(root.querySelector('strong')).toBeTruthy();

    fixture.componentInstance.render = false;
    fixture.detectChanges();
    expect(root.querySelector('strong')).toBeFalsy();

    fixture.componentInstance.render = true;
    fixture.detectChanges();
    expect(root.querySelector('strong')).toBeTruthy();
  });

  it('should handle data binding inside <template> elements', () => {
    @Component({
      template: '<template><strong>Hello {{name}}</strong></template>',
      standalone: false,
    })
    class App {
      name = 'Bilbo';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const template: HTMLTemplateElement = fixture.nativeElement.querySelector('template');
    // `content` won't exist in browsers that don't support `template`.
    const root = template.content || template;
    const strong = root.querySelector('strong')!;

    expect(strong.textContent).toBe('Hello Bilbo');

    fixture.componentInstance.name = 'Frodo';
    fixture.detectChanges();

    expect(strong.textContent).toBe('Hello Frodo');
  });

  it('should not throw for a non-null assertion after a safe access', () => {
    @Component({
      template: `
        {{ val?.foo!.bar }}
        {{ val?.[0].foo!.bar }}
        {{ foo(val)?.foo!.bar }}
        {{ $any(val)?.foo!.bar }}
      `,
      standalone: false,
    })
    class Comp {
      val: any = null;

      foo(val: unknown) {
        return val;
      }
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    expect(() => TestBed.createComponent(Comp).detectChanges()).not.toThrow();
  });

  it('should support template literals in expressions', () => {
    @Component({
      template: 'Message: {{`Hello, ${name} - ${value}`}}',
    })
    class TestComponent {
      name = 'Frodo';
      value = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Message: Hello, Frodo - 0');

    fixture.componentInstance.value++;
    fixture.componentInstance.name = 'Bilbo';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Message: Hello, Bilbo - 1');
  });

  it('should support void expressions', () => {
    @Component({
      host: {
        '(click)': 'void doStuff($event)',
      },
    })
    class TestComponent {
      e: Event | null = null;

      doStuff(e: Event) {
        this.e = e;
        return false;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    fixture.nativeElement.click();
    expect(fixture.componentInstance.e).not.toBeNull();
    expect(fixture.componentInstance.e!.defaultPrevented).toBe(false);
  });

  it('should have correct operator precedence', () => {
    @Component({
      template: '{{1 + 10 ** -2 * 3}}',
    })
    class TestComponent {}
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual('1.03');
  });

  it('should throw on ambiguous unary operator in exponentiation expression', () => {
    @Component({
      template: '{{1 + -10 ** -2 * 3}}',
    })
    class TestComponent {}
    expect(() => TestBed.createComponent(TestComponent)).toThrowError(
      /Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence/,
    );
  });

  it('should not throw on unambiguous unary operator in exponentiation expression', () => {
    @Component({
      template: '{{1 + (-10) ** -2 * 3}} | {{1 + -(10 ** -2) * 3}}',
    })
    class TestComponent {}
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual('1.03 | 0.97');
  });

  it('should have right-to-left associativity for exponentiation', () => {
    @Component({
      template: '{{2 ** 2 ** 3}}',
    })
    class TestComponent {}
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual('256');
  });

  it('should support tagged template literals with no interpolations in expressions', () => {
    @Component({
      standalone: true,
      template: `
        <p>:{{ caps\`Hello, World!\` }}:{{ excited?.caps(3)\`Uncomfortably excited\` }}:</p> 
        <p>{{ greet\`Hi, I'm \${name}, and I'm \${age}\` }}</p>
      `,
    })
    class TestComponent {
      name = 'Frodo';
      age = 50;
      greet(strings: TemplateStringsArray, person: string, age: number) {
        return `${strings[0]}${person}${strings[1]}${age} years old${strings[2]}`;
      }
      caps(strings: TemplateStringsArray) {
        return strings.join('').toUpperCase();
      }
      excited = {
        caps: (excitementLevel: number) => {
          return (strings: TemplateStringsArray) => {
            return strings.join('').toUpperCase() + '!'.repeat(excitementLevel);
          };
        },
      };
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(':HELLO, WORLD!:');
    expect(text).toContain(':UNCOMFORTABLY EXCITED!!!:');
    expect(text).toContain(`Hi, I'm Frodo, and I'm 50 years old`);
  });

  it('should not confuse operators for template literal tags', () => {
    @Component({
      standalone: true,
      template: '{{ typeof`test` }}',
    })
    class TestComponent {
      typeof = (...args: unknown[]) => 'fail';
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(`string`);
  });

  it('should support "in" expressions', () => {
    @Component({
      standalone: true,
      template: `{{'foo' in obj ? 'OK' : 'KO'}}`,
    })
    class TestComponent {
      obj: any = {foo: 'bar'};
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('OK');

    fixture.componentInstance.obj = {bar: 'foo'};
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('KO');
  });

  describe('tView.firstUpdatePass', () => {
    function isFirstUpdatePass() {
      const lView = getLView();
      const tView = lView[TVIEW];
      return tView.firstUpdatePass;
    }

    function assertAttrValues(element: Element, value: string) {
      expect(element.getAttribute('data-comp')).toEqual(value);
      expect(element.getAttribute('data-dir')).toEqual(value);
    }

    it('should be marked with `firstUpdatePass` up until the template and host bindings are evaluated', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        @HostBinding('attr.data-dir')
        get text() {
          return isFirstUpdatePass() ? 'first-update-pass' : 'post-update-pass';
        }
      }

      @Component({
        template: '<div [attr.data-comp]="text" dir></div>',
        standalone: false,
      })
      class Cmp {
        get text() {
          return isFirstUpdatePass() ? 'first-update-pass' : 'post-update-pass';
        }
      }

      TestBed.configureTestingModule({
        declarations: [Cmp, Dir],
      });
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges(false);
      const element = fixture.nativeElement.querySelector('div')!;

      assertAttrValues(element, 'first-update-pass');

      fixture.detectChanges(false);

      assertAttrValues(element, 'post-update-pass');
    });

    it('tView.firstUpdatePass should be applied immediately after the first embedded view is processed', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        @HostBinding('attr.data-dir')
        get text() {
          return isFirstUpdatePass() ? 'first-update-pass' : 'post-update-pass';
        }
      }

      @Component({
        template: `
          <div *ngFor="let item of items" dir [attr.data-comp]="text">
            ...
          </div>
        `,
        standalone: false,
      })
      class Cmp {
        items = [1, 2, 3];
        get text() {
          return isFirstUpdatePass() ? 'first-update-pass' : 'post-update-pass';
        }
      }

      TestBed.configureTestingModule({
        declarations: [Cmp, Dir],
      });
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges(false);

      const elements = fixture.nativeElement.querySelectorAll('div');
      assertAttrValues(elements[0], 'first-update-pass');
      assertAttrValues(elements[1], 'post-update-pass');
      assertAttrValues(elements[2], 'post-update-pass');

      fixture.detectChanges(false);
      assertAttrValues(elements[0], 'post-update-pass');
      assertAttrValues(elements[1], 'post-update-pass');
      assertAttrValues(elements[2], 'post-update-pass');
    });
  });

  describe('animations', () => {
    it('should apply triggers for a list of items when they are sorted and reSorted', fakeAsync(() => {
      interface Item {
        value: any;
        id: number;
      }

      @Component({
        template: `
          <div *ngIf="showWarningMessage; else listOfItems">
            Nooo!
          </div>

          <ng-template #listOfItems>
            <animation-comp *ngFor="let item of items; trackBy: itemTrackFn">
              {{ item.value }}
            </animation-comp>
          </ng-template>
        `,
        standalone: false,
      })
      class Cmp {
        showWarningMessage = false;

        items: Item[] = [
          {value: 1, id: 1},
          {value: 2, id: 2},
          {value: 3, id: 3},
          {value: 4, id: 4},
          {value: 5, id: 5},
        ];

        itemTrackFn(value: Item) {
          return value.id;
        }
      }

      @Component({
        selector: 'animation-comp',
        animations: [
          trigger('host', [
            state('void', style({height: '0px'})),
            transition('* => *', [animate('1s')]),
          ]),
        ],
        template: `
                  <ng-content></ng-content>
                `,
        standalone: false,
      })
      class AnimationComp {
        @HostBinding('@host') public hostState = '';

        @HostListener('@host.start', ['$event'])
        onLeaveStart(event: AnimationEvent) {
          // we just want to register the listener
        }
      }

      TestBed.configureTestingModule({
        declarations: [Cmp, AnimationComp],
        imports: [NoopAnimationsModule],
        providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
      });
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      let elements = queryAll(fixture.nativeElement, 'animation-comp');
      expect(elements.length).toEqual(5);
      expect(elements.map((e) => e.textContent?.trim())).toEqual(['1', '2', '3', '4', '5']);

      const items = fixture.componentInstance.items;
      arraySwap(items, 2, 0); // 3 2 1 4 5
      arraySwap(items, 2, 1); // 3 1 2 4 5
      const first = items.shift()!;
      items.push(first); // 1 2 4 5 3
      fixture.detectChanges();

      elements = queryAll(fixture.nativeElement, 'animation-comp');
      expect(elements.length).toEqual(5);
      expect(elements.map((e) => e.textContent?.trim())).toEqual(['1', '2', '4', '5', '3']);
      completeAnimations();

      fixture.componentInstance.showWarningMessage = true;
      fixture.detectChanges();
      completeAnimations();

      elements = queryAll(fixture.nativeElement, 'animation-comp');
      expect(elements.length).toEqual(0);
      expect(fixture.nativeElement.textContent.trim()).toEqual('Nooo!');

      fixture.componentInstance.showWarningMessage = false;
      fixture.detectChanges();

      elements = queryAll(fixture.nativeElement, 'animation-comp');
      expect(elements.length).toEqual(5);
    }));

    it('should insert and remove views in the correct order when animations are present', fakeAsync(() => {
      @Component({
        animations: [
          trigger('root', [transition('* => *', [])]),
          trigger('outer', [transition('* => *', [])]),
          trigger('inner', [transition('* => *', [])]),
        ],
        template: `
          <div *ngIf="showRoot" (@root.start)="track('root', $event)" @root>
            <div *ngIf="showIfContents; else innerCompList" (@outer.start)="track('outer', $event)" @outer>
              Nooo!
            </div>

            <ng-template #innerCompList>
              <inner-comp *ngFor="let item of items; trackBy: itemTrackFn" (@inner.start)="track('inner', $event)" @inner>
                {{ item.value }}
              </inner-comp>
            </ng-template>
          </div>
        `,
        standalone: false,
      })
      class Cmp {
        showRoot = true;
        showIfContents = true;
        items = [1];
        log: string[] = [];

        track(name: string, event: AnimationEvent) {
          this.log.push(name);
        }
      }

      @Component({
        selector: 'inner-comp',
        animations: [trigger('host', [transition('* => *', [])])],
        template: `
                  <ng-content></ng-content>
                `,
        standalone: false,
      })
      class InnerComp {
        @HostBinding('@host') public hostState = '';

        constructor(@Inject(Cmp) private parent: Cmp) {}

        @HostListener('@host.start', ['$event'])
        onLeaveStart(event: AnimationEvent) {
          this.parent.log.push('host');
        }
      }

      TestBed.configureTestingModule({
        declarations: [Cmp, InnerComp],
        imports: [NoopAnimationsModule],
        providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
      });
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      completeAnimations();
      const comp = fixture.componentInstance;
      expect(comp.log).toEqual([
        'root', // insertion of the inner-comp content
        'outer', // insertion of the default ngIf
      ]);

      comp.log = [];
      comp.showIfContents = false;
      fixture.detectChanges();
      completeAnimations();

      expect(comp.log).toEqual([
        'host', // insertion of the inner-comp content
        'outer', // insertion of the template into the ngIf
        'inner', // insertion of the inner comp element
      ]);

      comp.log = [];
      comp.showRoot = false;
      fixture.detectChanges();
      completeAnimations();

      expect(comp.log).toEqual([
        'root', // removal the root div container
        'host', // removal of the inner-comp content
        'inner', // removal of the inner comp element
      ]);
    }));
  });
});

function completeAnimations() {
  flushMicrotasks();
  const log = MockAnimationDriver.log as MockAnimationPlayer[];
  log.forEach((player) => player.finish());
  flushMicrotasks();
}

function arraySwap(arr: any[], indexA: number, indexB: number): void {
  const item = arr[indexA];
  arr[indexA] = arr[indexB];
  arr[indexB] = item;
}

/**
 * Queries the provided `root` element for sub elements by the selector and casts the result as an
 * array of elements
 */
function queryAll(root: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll(selector));
}
