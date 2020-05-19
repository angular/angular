/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Input, QueryList, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef, ViewRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('query logic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComp, QueryComp, SimpleCompA, SimpleCompB, StaticViewQueryComp, TextDirective,
        SubclassStaticViewQueryComp, StaticContentQueryComp, SubclassStaticContentQueryComp,
        QueryCompWithChanges, StaticContentQueryDir, SuperDirectiveQueryTarget, SuperDirective,
        SubComponent
      ]
    });
  });

  describe('view queries', () => {
    it('should return Component instances when Components are labeled and retrieved', () => {
      const template = `
           <div><simple-comp-a #viewQuery></simple-comp-a></div>
           <div><simple-comp-b #viewQuery></simple-comp-b></div>
         `;
      const fixture = initWithTemplate(QueryComp, template);
      const comp = fixture.componentInstance;
      expect(comp.viewChild).toBeAnInstanceOf(SimpleCompA);
      expect(comp.viewChildren.first).toBeAnInstanceOf(SimpleCompA);
      expect(comp.viewChildren.last).toBeAnInstanceOf(SimpleCompB);
    });

    it('should return ElementRef when HTML element is labeled and retrieved', () => {
      const template = `
      <div #viewQuery></div>
    `;
      const fixture = initWithTemplate(QueryComp, template);
      const comp = fixture.componentInstance;
      expect(comp.viewChild).toBeAnInstanceOf(ElementRef);
      expect(comp.viewChildren.first).toBeAnInstanceOf(ElementRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return ElementRefs when HTML elements are labeled and retrieved', () => {
          const template = `
              <div #viewQuery #first>A</div>
              <div #viewQuery #second>B</div>
            `;
          const fixture = initWithTemplate(QueryComp, template);
          const comp = fixture.componentInstance;

          expect(comp.viewChild).toBeAnInstanceOf(ElementRef);
          expect(comp.viewChild.nativeElement).toBe(fixture.debugElement.children[0].nativeElement);

          expect(comp.viewChildren.first).toBeAnInstanceOf(ElementRef);
          expect(comp.viewChildren.last).toBeAnInstanceOf(ElementRef);
          expect(comp.viewChildren.length).toBe(2);
        });

    it('should return TemplateRef when template is labeled and retrieved', () => {
      const template = `
      <ng-template #viewQuery></ng-template>
    `;
      const fixture = initWithTemplate(QueryComp, template);
      const comp = fixture.componentInstance;
      expect(comp.viewChildren.first).toBeAnInstanceOf(TemplateRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return TemplateRefs when templates are labeled and retrieved', () => {
          const template = `
              <ng-template #viewQuery></ng-template>
              <ng-template #viewQuery></ng-template>
            `;
          const fixture = initWithTemplate(QueryComp, template);
          const comp = fixture.componentInstance;
          expect(comp.viewChild).toBeAnInstanceOf(TemplateRef);
          expect(comp.viewChild.elementRef.nativeElement)
              .toBe(fixture.debugElement.childNodes[0].nativeNode);

          expect(comp.viewChildren.first).toBeAnInstanceOf(TemplateRef);
          expect(comp.viewChildren.last).toBeAnInstanceOf(TemplateRef);
          expect(comp.viewChildren.length).toBe(2);
        });

    it('should set static view child queries in creation mode (and just in creation mode)', () => {
      const fixture = TestBed.createComponent(StaticViewQueryComp);
      const component = fixture.componentInstance;

      // static ViewChild query should be set in creation mode, before CD runs
      expect(component.textDir).toBeAnInstanceOf(TextDirective);
      expect(component.textDir.text).toEqual('');
      expect(component.setEvents).toEqual(['textDir set']);

      // dynamic ViewChild query should not have been resolved yet
      expect(component.foo).not.toBeDefined();

      const span = fixture.nativeElement.querySelector('span');
      fixture.detectChanges();
      expect(component.textDir.text).toEqual('some text');
      expect(component.foo.nativeElement).toBe(span);
      expect(component.setEvents).toEqual(['textDir set', 'foo set']);
    });

    it('should support static view child queries inherited from superclasses', () => {
      const fixture = TestBed.createComponent(SubclassStaticViewQueryComp);
      const component = fixture.componentInstance;
      const divs = fixture.nativeElement.querySelectorAll('div');
      const spans = fixture.nativeElement.querySelectorAll('span');

      // static ViewChild queries should be set in creation mode, before CD runs
      expect(component.textDir).toBeAnInstanceOf(TextDirective);
      expect(component.textDir.text).toEqual('');
      expect(component.bar.nativeElement).toEqual(divs[1]);

      // dynamic ViewChild queries should not have been resolved yet
      expect(component.foo).not.toBeDefined();
      expect(component.baz).not.toBeDefined();

      fixture.detectChanges();
      expect(component.textDir.text).toEqual('some text');
      expect(component.foo.nativeElement).toBe(spans[0]);
      expect(component.baz.nativeElement).toBe(spans[1]);
    });

    it('should support multiple static view queries (multiple template passes)', () => {
      const template = `
           <static-view-query-comp></static-view-query-comp>
           <static-view-query-comp></static-view-query-comp>
         `;
      TestBed.overrideComponent(AppComp, {set: new Component({template})});
      const fixture = TestBed.createComponent(AppComp);

      const firstComponent = fixture.debugElement.children[0].injector.get(StaticViewQueryComp);
      const secondComponent = fixture.debugElement.children[1].injector.get(StaticViewQueryComp);

      // static ViewChild query should be set in creation mode, before CD runs
      expect(firstComponent.textDir).toBeAnInstanceOf(TextDirective);
      expect(secondComponent.textDir).toBeAnInstanceOf(TextDirective);
      expect(firstComponent.textDir.text).toEqual('');
      expect(secondComponent.textDir.text).toEqual('');
      expect(firstComponent.setEvents).toEqual(['textDir set']);
      expect(secondComponent.setEvents).toEqual(['textDir set']);

      // dynamic ViewChild query should not have been resolved yet
      expect(firstComponent.foo).not.toBeDefined();
      expect(secondComponent.foo).not.toBeDefined();

      const spans = fixture.nativeElement.querySelectorAll('span');
      fixture.detectChanges();
      expect(firstComponent.textDir.text).toEqual('some text');
      expect(secondComponent.textDir.text).toEqual('some text');
      expect(firstComponent.foo.nativeElement).toBe(spans[0]);
      expect(secondComponent.foo.nativeElement).toBe(spans[1]);
      expect(firstComponent.setEvents).toEqual(['textDir set', 'foo set']);
      expect(secondComponent.setEvents).toEqual(['textDir set', 'foo set']);
    });

    it('should allow for view queries to be inherited from a directive', () => {
      const fixture = TestBed.createComponent(SubComponent);
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.headers).toBeTruthy();
      expect(comp.headers.length).toBe(2);
      expect(comp.headers.toArray().every(result => result instanceof SuperDirectiveQueryTarget))
          .toBe(true);
    });

    it('should support ViewChild query inherited from undecorated superclasses', () => {
      class MyComp {
        @ViewChild('foo') foo: any;
      }

      @Component({selector: 'sub-comp', template: '<div #foo></div>'})
      class SubComp extends MyComp {
      }

      TestBed.configureTestingModule({declarations: [SubComp]});

      const fixture = TestBed.createComponent(SubComp);
      fixture.detectChanges();
      expect(fixture.componentInstance.foo).toBeAnInstanceOf(ElementRef);
    });

    it('should support ViewChild query inherited from undecorated grand superclasses', () => {
      class MySuperComp {
        @ViewChild('foo') foo: any;
      }

      class MyComp extends MySuperComp {}

      @Component({selector: 'sub-comp', template: '<div #foo></div>'})
      class SubComp extends MyComp {
      }

      TestBed.configureTestingModule({declarations: [SubComp]});

      const fixture = TestBed.createComponent(SubComp);
      fixture.detectChanges();
      expect(fixture.componentInstance.foo).toBeAnInstanceOf(ElementRef);
    });

    it('should support ViewChildren query inherited from undecorated superclasses', () => {
      @Directive({selector: '[some-dir]'})
      class SomeDir {
      }

      class MyComp {
        @ViewChildren(SomeDir) foo!: QueryList<SomeDir>;
      }

      @Component({
        selector: 'sub-comp',
        template: `
          <div some-dir></div>
          <div some-dir></div>
        `
      })
      class SubComp extends MyComp {
      }

      TestBed.configureTestingModule({declarations: [SubComp, SomeDir]});

      const fixture = TestBed.createComponent(SubComp);
      fixture.detectChanges();
      expect(fixture.componentInstance.foo).toBeAnInstanceOf(QueryList);
      expect(fixture.componentInstance.foo.length).toBe(2);
    });

    it('should support ViewChildren query inherited from undecorated grand superclasses', () => {
      @Directive({selector: '[some-dir]'})
      class SomeDir {
      }

      class MySuperComp {
        @ViewChildren(SomeDir) foo!: QueryList<SomeDir>;
      }

      class MyComp extends MySuperComp {}

      @Component({
        selector: 'sub-comp',
        template: `
          <div some-dir></div>
          <div some-dir></div>
        `
      })
      class SubComp extends MyComp {
      }

      TestBed.configureTestingModule({declarations: [SubComp, SomeDir]});

      const fixture = TestBed.createComponent(SubComp);
      fixture.detectChanges();
      expect(fixture.componentInstance.foo).toBeAnInstanceOf(QueryList);
      expect(fixture.componentInstance.foo.length).toBe(2);
    });

    it('should support ViewChild query where template is inserted in child component', () => {
      @Component({selector: 'required', template: ''})
      class Required {
      }

      @Component({
        selector: 'insertion',
        template: `<ng-container [ngTemplateOutlet]="content"></ng-container>`
      })
      class Insertion {
        @Input() content!: TemplateRef<{}>;
      }

      @Component({
        template: `
          <ng-template #template>
            <required></required>
          </ng-template>
          <insertion [content]="template"></insertion>
          `
      })
      class App {
        @ViewChild(Required) requiredEl!: Required;
        viewChildAvailableInAfterViewInit?: boolean;

        ngAfterViewInit() {
          this.viewChildAvailableInAfterViewInit = this.requiredEl !== undefined;
        }
      }

      const fixture = TestBed.configureTestingModule({declarations: [App, Insertion, Required]})
                          .createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.viewChildAvailableInAfterViewInit).toBe(true);
    });

    it('should destroy QueryList when the containing view is destroyed', () => {
      let queryInstance: QueryList<any>;

      @Component({
        selector: 'comp-with-view-query',
        template: '<div #foo>Content</div>',
      })
      class ComponentWithViewQuery {
        @ViewChildren('foo')
        set foo(value: any) {
          queryInstance = value;
        }
        get foo() {
          return queryInstance;
        }
      }

      @Component({
        selector: 'root',
        template: `
          <ng-container *ngIf="condition">
            <comp-with-view-query></comp-with-view-query>
          </ng-container>
        `
      })
      class Root {
        condition = true;
      }

      TestBed.configureTestingModule({
        declarations: [Root, ComponentWithViewQuery],
        imports: [CommonModule],
      });

      const fixture = TestBed.createComponent(Root);
      fixture.detectChanges();

      expect((queryInstance!.changes as EventEmitter<any>).closed).toBeFalsy();

      fixture.componentInstance.condition = false;
      fixture.detectChanges();

      expect((queryInstance!.changes as EventEmitter<any>).closed).toBeTruthy();
    });
  });

  describe('content queries', () => {
    it('should return Component instance when Component is labeled and retrieved', () => {
      const template = `
           <local-ref-query-component #q>
             <simple-comp-a #contentQuery></simple-comp-a>
           </local-ref-query-component>
         `;
      const fixture = initWithTemplate(AppComp, template);
      const comp = fixture.debugElement.children[0].references['q'];
      expect(comp.contentChild).toBeAnInstanceOf(SimpleCompA);
      expect(comp.contentChildren.first).toBeAnInstanceOf(SimpleCompA);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return Component instances when Components are labeled and retrieved', () => {
          const template = `
                <local-ref-query-component #q>
                  <simple-comp-a #contentQuery></simple-comp-a>
                  <simple-comp-b #contentQuery></simple-comp-b>
                </local-ref-query-component>
              `;
          const fixture = initWithTemplate(AppComp, template);
          const comp = fixture.debugElement.children[0].references['q'];
          expect(comp.contentChild).toBeAnInstanceOf(SimpleCompA);
          expect(comp.contentChildren.first).toBeAnInstanceOf(SimpleCompA);
          expect(comp.contentChildren.last).toBeAnInstanceOf(SimpleCompB);
          expect(comp.contentChildren.length).toBe(2);
        });


    it('should return ElementRef when HTML element is labeled and retrieved', () => {
      const template = `
         <local-ref-query-component #q>
           <div #contentQuery></div>
         </local-ref-query-component>
       `;
      const fixture = initWithTemplate(AppComp, template);
      const comp = fixture.debugElement.children[0].references['q'];
      expect(comp.contentChildren.first).toBeAnInstanceOf(ElementRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return ElementRefs when HTML elements are labeled and retrieved', () => {
          const template = `
              <local-ref-query-component #q>
                <div #contentQuery></div>
                <div #contentQuery></div>
              </local-ref-query-component>
            `;
          const fixture = initWithTemplate(AppComp, template);
          const firstChild = fixture.debugElement.children[0];
          const comp = firstChild.references['q'];

          expect(comp.contentChild).toBeAnInstanceOf(ElementRef);
          expect(comp.contentChild.nativeElement).toBe(firstChild.children[0].nativeElement);

          expect(comp.contentChildren.first).toBeAnInstanceOf(ElementRef);
          expect(comp.contentChildren.last).toBeAnInstanceOf(ElementRef);
          expect(comp.contentChildren.length).toBe(2);
        });

    it('should return TemplateRef when template is labeled and retrieved', () => {
      const template = `
       <local-ref-query-component #q>
         <ng-template #contentQuery></ng-template>
       </local-ref-query-component>
     `;
      const fixture = initWithTemplate(AppComp, template);
      const comp = fixture.debugElement.children[0].references['q'];
      expect(comp.contentChildren.first).toBeAnInstanceOf(TemplateRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return TemplateRefs when templates are labeled and retrieved', () => {
          const template = `
              <local-ref-query-component #q>
                <ng-template #contentQuery></ng-template>
                <ng-template #contentQuery></ng-template>
              </local-ref-query-component>
            `;
          const fixture = initWithTemplate(AppComp, template);
          const firstChild = fixture.debugElement.children[0];
          const comp = firstChild.references['q'];

          expect(comp.contentChild).toBeAnInstanceOf(TemplateRef);
          expect(comp.contentChild.elementRef.nativeElement)
              .toBe(firstChild.childNodes[0].nativeNode);

          expect(comp.contentChildren.first).toBeAnInstanceOf(TemplateRef);
          expect(comp.contentChildren.last).toBeAnInstanceOf(TemplateRef);
          expect(comp.contentChildren.length).toBe(2);
        });

    it('should set static content child queries in creation mode (and just in creation mode)',
       () => {
         const template = `
              <static-content-query-comp>
                  <div [text]="text"></div>
                  <span #foo></span>
              </static-content-query-comp>
            `;
         TestBed.overrideComponent(AppComp, {set: new Component({template})});
         const fixture = TestBed.createComponent(AppComp);
         const component = fixture.debugElement.children[0].injector.get(StaticContentQueryComp);

         // static ContentChild query should be set in creation mode, before CD runs
         expect(component.textDir).toBeAnInstanceOf(TextDirective);
         expect(component.textDir.text).toEqual('');
         expect(component.setEvents).toEqual(['textDir set']);

         // dynamic ContentChild query should not have been resolved yet
         expect(component.foo).not.toBeDefined();

         const span = fixture.nativeElement.querySelector('span');
         (fixture.componentInstance as any).text = 'some text';
         fixture.detectChanges();

         expect(component.textDir.text).toEqual('some text');
         expect(component.foo.nativeElement).toBe(span);
         expect(component.setEvents).toEqual(['textDir set', 'foo set']);
       });

    it('should support static content child queries inherited from superclasses', () => {
      const template = `
              <subclass-static-content-query-comp>
                  <div [text]="text"></div>
                  <span #foo></span>
                  <div #bar></div>
                  <span #baz></span>
              </subclass-static-content-query-comp>
            `;
      TestBed.overrideComponent(AppComp, {set: new Component({template})});
      const fixture = TestBed.createComponent(AppComp);
      const component =
          fixture.debugElement.children[0].injector.get(SubclassStaticContentQueryComp);
      const divs = fixture.nativeElement.querySelectorAll('div');
      const spans = fixture.nativeElement.querySelectorAll('span');

      // static ContentChild queries should be set in creation mode, before CD runs
      expect(component.textDir).toBeAnInstanceOf(TextDirective);
      expect(component.textDir.text).toEqual('');
      expect(component.bar.nativeElement).toEqual(divs[1]);

      // dynamic ContentChild queries should not have been resolved yet
      expect(component.foo).not.toBeDefined();
      expect(component.baz).not.toBeDefined();

      (fixture.componentInstance as any).text = 'some text';
      fixture.detectChanges();
      expect(component.textDir.text).toEqual('some text');
      expect(component.foo.nativeElement).toBe(spans[0]);
      expect(component.baz.nativeElement).toBe(spans[1]);
    });

    it('should set static content child queries on directives', () => {
      const template = `
              <div staticContentQueryDir>
                  <div [text]="text"></div>
                  <span #foo></span>
              </div>
            `;
      TestBed.overrideComponent(AppComp, {set: new Component({template})});
      const fixture = TestBed.createComponent(AppComp);
      const component = fixture.debugElement.children[0].injector.get(StaticContentQueryDir);

      // static ContentChild query should be set in creation mode, before CD runs
      expect(component.textDir).toBeAnInstanceOf(TextDirective);
      expect(component.textDir.text).toEqual('');
      expect(component.setEvents).toEqual(['textDir set']);

      // dynamic ContentChild query should not have been resolved yet
      expect(component.foo).not.toBeDefined();

      const span = fixture.nativeElement.querySelector('span');
      (fixture.componentInstance as any).text = 'some text';
      fixture.detectChanges();

      expect(component.textDir.text).toEqual('some text');
      expect(component.foo.nativeElement).toBe(span);
      expect(component.setEvents).toEqual(['textDir set', 'foo set']);
    });

    it('should support multiple content query components (multiple template passes)', () => {
      const template = `
              <static-content-query-comp>
                  <div [text]="text"></div>
                  <span #foo></span>
              </static-content-query-comp>
              <static-content-query-comp>
                  <div [text]="text"></div>
                  <span #foo></span>
              </static-content-query-comp>
            `;
      TestBed.overrideComponent(AppComp, {set: new Component({template})});
      const fixture = TestBed.createComponent(AppComp);
      const firstComponent = fixture.debugElement.children[0].injector.get(StaticContentQueryComp);
      const secondComponent = fixture.debugElement.children[1].injector.get(StaticContentQueryComp);

      // static ContentChild query should be set in creation mode, before CD runs
      expect(firstComponent.textDir).toBeAnInstanceOf(TextDirective);
      expect(secondComponent.textDir).toBeAnInstanceOf(TextDirective);
      expect(firstComponent.textDir.text).toEqual('');
      expect(secondComponent.textDir.text).toEqual('');
      expect(firstComponent.setEvents).toEqual(['textDir set']);
      expect(secondComponent.setEvents).toEqual(['textDir set']);

      // dynamic ContentChild query should not have been resolved yet
      expect(firstComponent.foo).not.toBeDefined();
      expect(secondComponent.foo).not.toBeDefined();

      const spans = fixture.nativeElement.querySelectorAll('span');
      (fixture.componentInstance as any).text = 'some text';
      fixture.detectChanges();

      expect(firstComponent.textDir.text).toEqual('some text');
      expect(secondComponent.textDir.text).toEqual('some text');

      expect(firstComponent.foo.nativeElement).toBe(spans[0]);
      expect(secondComponent.foo.nativeElement).toBe(spans[1]);

      expect(firstComponent.setEvents).toEqual(['textDir set', 'foo set']);
      expect(secondComponent.setEvents).toEqual(['textDir set', 'foo set']);
    });

    it('should support ContentChild query inherited from undecorated superclasses', () => {
      class MyComp {
        @ContentChild('foo') foo: any;
      }

      @Component({selector: 'sub-comp', template: '<ng-content></ng-content>'})
      class SubComp extends MyComp {
      }

      @Component({template: '<sub-comp><div #foo></div></sub-comp>'})
      class App {
        @ViewChild(SubComp) subComp!: SubComp;
      }

      TestBed.configureTestingModule({declarations: [App, SubComp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.subComp.foo).toBeAnInstanceOf(ElementRef);
    });

    it('should support ContentChild query inherited from undecorated grand superclasses', () => {
      class MySuperComp {
        @ContentChild('foo') foo: any;
      }

      class MyComp extends MySuperComp {}

      @Component({selector: 'sub-comp', template: '<ng-content></ng-content>'})
      class SubComp extends MyComp {
      }

      @Component({template: '<sub-comp><div #foo></div></sub-comp>'})
      class App {
        @ViewChild(SubComp) subComp!: SubComp;
      }

      TestBed.configureTestingModule({declarations: [App, SubComp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.subComp.foo).toBeAnInstanceOf(ElementRef);
    });

    it('should support ContentChildren query inherited from undecorated superclasses', () => {
      @Directive({selector: '[some-dir]'})
      class SomeDir {
      }

      class MyComp {
        @ContentChildren(SomeDir) foo!: QueryList<SomeDir>;
      }

      @Component({selector: 'sub-comp', template: '<ng-content></ng-content>'})
      class SubComp extends MyComp {
      }

      @Component({
        template: `
        <sub-comp>
          <div some-dir></div>
          <div some-dir></div>
        </sub-comp>
      `
      })
      class App {
        @ViewChild(SubComp) subComp!: SubComp;
      }

      TestBed.configureTestingModule({declarations: [App, SubComp, SomeDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.subComp.foo).toBeAnInstanceOf(QueryList);
      expect(fixture.componentInstance.subComp.foo.length).toBe(2);
    });

    it('should support ContentChildren query inherited from undecorated grand superclasses', () => {
      @Directive({selector: '[some-dir]'})
      class SomeDir {
      }

      class MySuperComp {
        @ContentChildren(SomeDir) foo!: QueryList<SomeDir>;
      }

      class MyComp extends MySuperComp {}

      @Component({selector: 'sub-comp', template: '<ng-content></ng-content>'})
      class SubComp extends MyComp {
      }

      @Component({
        template: `
        <sub-comp>
          <div some-dir></div>
          <div some-dir></div>
        </sub-comp>
      `
      })
      class App {
        @ViewChild(SubComp) subComp!: SubComp;
      }

      TestBed.configureTestingModule({declarations: [App, SubComp, SomeDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.subComp.foo).toBeAnInstanceOf(QueryList);
      expect(fixture.componentInstance.subComp.foo.length).toBe(2);
    });

    it('should match shallow content queries in views inserted / removed by ngIf', () => {
      @Component({
        selector: 'test-comp',
        template: `
          <shallow-comp>
            <div *ngIf="showing" #foo></div>
          </shallow-comp>
        `
      })
      class TestComponent {
        showing = false;
      }

      @Component({
        selector: 'shallow-comp',
        template: '',
      })
      class ShallowComp {
        @ContentChildren('foo', {descendants: false}) foos!: QueryList<ElementRef>;
      }

      TestBed.configureTestingModule(
          {declarations: [TestComponent, ShallowComp], imports: [CommonModule]});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const shallowComp = fixture.debugElement.query(By.directive(ShallowComp)).componentInstance;
      const queryList = shallowComp!.foos;
      expect(queryList.length).toBe(0);

      fixture.componentInstance.showing = true;
      fixture.detectChanges();
      expect(queryList.length).toBe(1);

      fixture.componentInstance.showing = false;
      fixture.detectChanges();
      expect(queryList.length).toBe(0);
    });

    it('should support content queries for directives within repeated embedded views', () => {
      const withContentInstances: DirWithContentQuery[] = [];

      @Directive({
        selector: '[with-content]',
      })
      class DirWithContentQuery {
        constructor() {
          withContentInstances.push(this);
        }

        @ContentChildren('foo', {descendants: false}) foos!: QueryList<ElementRef>;

        contentInitQuerySnapshot = 0;
        contentCheckedQuerySnapshot = 0;

        ngAfterContentInit() {
          this.contentInitQuerySnapshot = this.foos ? this.foos.length : 0;
        }

        ngAfterContentChecked() {
          this.contentCheckedQuerySnapshot = this.foos ? this.foos.length : 0;
        }
      }

      @Component({
        selector: 'comp',
        template: `
          <ng-container *ngFor="let item of items">
            <div with-content>
              <span #foo></span>
            </div>
          </ng-container>
        `,
      })
      class Root {
        items = [1, 2, 3];
      }

      TestBed.configureTestingModule({
        declarations: [Root, DirWithContentQuery],
        imports: [CommonModule],
      });
      const fixture = TestBed.createComponent(Root);
      fixture.detectChanges();

      for (let i = 0; i < 3; i++) {
        expect(withContentInstances[i].foos.length)
            .toBe(1, `Expected content query to match <span #foo>.`);

        expect(withContentInstances[i].contentInitQuerySnapshot)
            .toBe(
                1,
                `Expected content query results to be available when ngAfterContentInit was called.`);

        expect(withContentInstances[i].contentCheckedQuerySnapshot)
            .toBe(
                1,
                `Expected content query results to be available when ngAfterContentChecked was called.`);
      }
    });
  });

  // Some root components may have ContentChildren queries if they are also
  // usable as a child component. We should still generate an empty QueryList
  // for these queries when they are at root for backwards compatibility with
  // ViewEngine.
  it('should generate an empty QueryList for root components', () => {
    const fixture = TestBed.createComponent(QueryComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.contentChildren).toBeAnInstanceOf(QueryList);
    expect(fixture.componentInstance.contentChildren.length).toBe(0);
  });

  describe('descendants: false (default)', () => {
    /**
     * A helper function to check if a given object looks like ElementRef. It is used in place of
     * the `instanceof ElementRef` check since ivy returns a type that looks like ElementRef (have
     * the same properties but doesn't pass the instanceof ElementRef test)
     */
    function isElementRefLike(result: any): boolean {
      return result.nativeElement != null;
    }

    it('should match directives on elements that used to be wrapped by a required parent in HTML parser',
       () => {
         @Directive({selector: '[myDef]'})
         class MyDef {
         }

         @Component({selector: 'my-container', template: ``})
         class MyContainer {
           @ContentChildren(MyDef) myDefs!: QueryList<MyDef>;
         }
         @Component(
             {selector: 'test-cmpt', template: `<my-container><tr myDef></tr></my-container>`})
         class TestCmpt {
         }

         TestBed.configureTestingModule({declarations: [TestCmpt, MyContainer, MyDef]});
         const fixture = TestBed.createComponent(TestCmpt);
         const cmptWithQuery = fixture.debugElement.children[0].injector.get(MyContainer);

         fixture.detectChanges();
         expect(cmptWithQuery.myDefs.length).toBe(1);
       });

    it('should match elements with local refs inside <ng-container>', () => {
      @Component({selector: 'needs-target', template: ``})
      class NeedsTarget {
        @ContentChildren('target') targets!: QueryList<ElementRef>;
      }
      @Component({
        selector: 'test-cmpt',
        template: `
          <needs-target>
            <ng-container>
              <tr #target></tr>
            </ng-container>
          </needs-target>
        `,
      })
      class TestCmpt {
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, NeedsTarget]});
      const fixture = TestBed.createComponent(TestCmpt);
      const cmptWithQuery = fixture.debugElement.children[0].injector.get(NeedsTarget);

      fixture.detectChanges();
      expect(cmptWithQuery.targets.length).toBe(1);
      expect(isElementRefLike(cmptWithQuery.targets.first)).toBeTruthy();
    });

    it('should match elements with local refs inside nested <ng-container>', () => {
      @Component({selector: 'needs-target', template: ``})
      class NeedsTarget {
        @ContentChildren('target') targets!: QueryList<ElementRef>;
      }

      @Component({
        selector: 'test-cmpt',
        template: `
          <needs-target>
            <ng-container>
              <ng-container>
                <ng-container>
                  <tr #target></tr>
                </ng-container>
              </ng-container>
            </ng-container>
          </needs-target>
        `,
      })
      class TestCmpt {
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, NeedsTarget]});
      const fixture = TestBed.createComponent(TestCmpt);
      const cmptWithQuery = fixture.debugElement.children[0].injector.get(NeedsTarget);

      fixture.detectChanges();
      expect(cmptWithQuery.targets.length).toBe(1);
      expect(isElementRefLike(cmptWithQuery.targets.first)).toBeTruthy();
    });

    it('should match directives inside <ng-container>', () => {
      @Directive({selector: '[targetDir]'})
      class TargetDir {
      }

      @Component({selector: 'needs-target', template: ``})
      class NeedsTarget {
        @ContentChildren(TargetDir) targets!: QueryList<HTMLElement>;
      }

      @Component({
        selector: 'test-cmpt',
        template: `
          <needs-target>
            <ng-container>
              <tr targetDir></tr>
            </ng-container>
          </needs-target>
        `,
      })
      class TestCmpt {
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, NeedsTarget, TargetDir]});
      const fixture = TestBed.createComponent(TestCmpt);
      const cmptWithQuery = fixture.debugElement.children[0].injector.get(NeedsTarget);

      fixture.detectChanges();
      expect(cmptWithQuery.targets.length).toBe(1);
      expect(cmptWithQuery.targets.first).toBeAnInstanceOf(TargetDir);
    });

    it('should match directives inside nested <ng-container>', () => {
      @Directive({selector: '[targetDir]'})
      class TargetDir {
      }

      @Component({selector: 'needs-target', template: ``})
      class NeedsTarget {
        @ContentChildren(TargetDir) targets!: QueryList<HTMLElement>;
      }

      @Component({
        selector: 'test-cmpt',
        template: `
          <needs-target>
            <ng-container>
              <ng-container>
                <ng-container>
                  <tr targetDir></tr>
                </ng-container>
              </ng-container>
            </ng-container>
          </needs-target>
        `,
      })
      class TestCmpt {
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, NeedsTarget, TargetDir]});
      const fixture = TestBed.createComponent(TestCmpt);
      const cmptWithQuery = fixture.debugElement.children[0].injector.get(NeedsTarget);

      fixture.detectChanges();
      expect(cmptWithQuery.targets.length).toBe(1);
      expect(cmptWithQuery.targets.first).toBeAnInstanceOf(TargetDir);
    });

    it('should cross child ng-container when query is declared on ng-container', () => {
      @Directive({selector: '[targetDir]'})
      class TargetDir {
      }

      @Directive({selector: '[needs-target]'})
      class NeedsTarget {
        @ContentChildren(TargetDir) targets!: QueryList<HTMLElement>;
      }

      @Component({
        selector: 'test-cmpt',
        template: `
          <ng-container targetDir>
            <ng-container needs-target>
              <ng-container>
                <tr targetDir></tr>
              </ng-container>
            </ng-container>
          </ng-container>
        `,
      })
      class TestCmpt {
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, NeedsTarget, TargetDir]});
      const fixture = TestBed.createComponent(TestCmpt);
      const cmptWithQuery = fixture.debugElement.children[0].injector.get(NeedsTarget);

      fixture.detectChanges();
      expect(cmptWithQuery.targets.length).toBe(1);
      expect(cmptWithQuery.targets.first).toBeAnInstanceOf(TargetDir);
    });

    it('should match nodes when using structural directives (*syntax) on <ng-container>', () => {
      @Directive({selector: '[targetDir]'})
      class TargetDir {
      }

      @Component({selector: 'needs-target', template: ``})
      class NeedsTarget {
        @ContentChildren(TargetDir) dirTargets!: QueryList<TargetDir>;
        @ContentChildren('target') localRefsTargets!: QueryList<ElementRef>;
      }

      @Component({
        selector: 'test-cmpt',
        template: `
          <needs-target>
            <ng-container *ngIf="true">
              <div targetDir></div>
              <div #target></div>
            </ng-container>
          </needs-target>
        `,
      })
      class TestCmpt {
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, NeedsTarget, TargetDir]});
      const fixture = TestBed.createComponent(TestCmpt);
      const cmptWithQuery = fixture.debugElement.children[0].injector.get(NeedsTarget);

      fixture.detectChanges();
      expect(cmptWithQuery.dirTargets.length).toBe(1);
      expect(cmptWithQuery.dirTargets.first).toBeAnInstanceOf(TargetDir);
      expect(cmptWithQuery.localRefsTargets.length).toBe(1);
      expect(isElementRefLike(cmptWithQuery.localRefsTargets.first)).toBeTruthy();
    });

    onlyInIvy(
        'VE uses injectors hierarchy to determine if node matches, ivy uses elements as written in a template')
        .it('should match directives on <ng-container> when crossing nested <ng-container>', () => {
          @Directive({selector: '[targetDir]'})
          class TargetDir {
          }

          @Component({selector: 'needs-target', template: ``})
          class NeedsTarget {
            @ContentChildren(TargetDir) targets!: QueryList<HTMLElement>;
          }

          @Component({
            selector: 'test-cmpt',
            template: `
          <needs-target>
            <ng-container>
              <ng-container targetDir>
                <ng-container targetDir>
                  <tr targetDir></tr>
                </ng-container>
              </ng-container>
            </ng-container>
          </needs-target>
        `,
          })
          class TestCmpt {
          }

          TestBed.configureTestingModule({declarations: [TestCmpt, NeedsTarget, TargetDir]});
          const fixture = TestBed.createComponent(TestCmpt);
          const cmptWithQuery = fixture.debugElement.children[0].injector.get(NeedsTarget);

          fixture.detectChanges();
          expect(cmptWithQuery.targets.length).toBe(3);
        });
  });



  describe('observable interface', () => {
    it('should allow observing changes to query list', () => {
      const fixture = TestBed.createComponent(QueryCompWithChanges);
      let changes = 0;
      fixture.detectChanges();

      fixture.componentInstance.foos.changes.subscribe((value: any) => {
        changes += 1;
        expect(value).toBe(fixture.componentInstance.foos);
      });

      // refresh without setting dirty - no emit
      fixture.detectChanges();
      expect(changes).toBe(0);

      // refresh with setting dirty - emit
      fixture.componentInstance.showing = true;
      fixture.detectChanges();
      expect(changes).toBe(1);
    });
  });

  describe('view boundaries', () => {
    describe('ViewContainerRef', () => {
      @Directive({selector: '[vc]', exportAs: 'vc'})
      class ViewContainerManipulatorDirective {
        constructor(private _vcRef: ViewContainerRef) {}

        insertTpl(tpl: TemplateRef<{}>, ctx: {}, idx?: number): ViewRef {
          return this._vcRef.createEmbeddedView(tpl, ctx, idx);
        }

        remove(index?: number) {
          this._vcRef.remove(index);
        }

        move(viewRef: ViewRef, index: number) {
          this._vcRef.move(viewRef, index);
        }
      }

      it('should report results in views inserted / removed by ngIf', () => {
        @Component({
          selector: 'test-comp',
          template: `
            <ng-template [ngIf]="value">
              <div #foo></div>
            </ng-template>
          `
        })
        class TestComponent {
          value: boolean = false;
          @ViewChildren('foo') query!: QueryList<any>;
        }

        TestBed.configureTestingModule({declarations: [TestComponent]});

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const queryList = fixture.componentInstance.query;
        expect(queryList.length).toBe(0);

        fixture.componentInstance.value = true;
        fixture.detectChanges();
        expect(queryList.length).toBe(1);

        fixture.componentInstance.value = false;
        fixture.detectChanges();
        expect(queryList.length).toBe(0);
      });

      it('should report results in views inserted / removed by ngFor', () => {
        @Component({
          selector: 'test-comp',
          template: `
            <ng-template ngFor let-item [ngForOf]="value">
              <div #foo [id]="item"></div>
            </ng-template>
          `,
        })
        class TestComponent {
          value: string[]|undefined;
          @ViewChildren('foo') query!: QueryList<any>;
        }

        TestBed.configureTestingModule({declarations: [TestComponent]});
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const queryList = fixture.componentInstance.query;
        expect(queryList.length).toBe(0);

        fixture.componentInstance.value = ['a', 'b', 'c'];
        fixture.detectChanges();
        expect(queryList.length).toBe(3);

        // Remove the "b" element from the value.
        fixture.componentInstance.value.splice(1, 1);
        fixture.detectChanges();
        expect(queryList.length).toBe(2);

        // make sure that the "b" element has been removed from query results
        expect(queryList.first.nativeElement.id).toBe('a');
        expect(queryList.last.nativeElement.id).toBe('c');
      });

      /**
       * ViewContainerRef API allows "moving" a view to the same (previous) index. Such operation
       * has no observable effect on the rendered UI (displays stays the same) but internally we've
       * got 2 implementation choices when it comes to "moving" a view:
       * - systematically detach and insert a view - this would result in unnecessary processing
       * when the previous and new indexes for the move operation are the same;
       * - detect the situation where the indexes are the same and do no processing in such case.
       *
       * This tests asserts on the implementation choices done by the VE (detach and insert) so we
       * can replicate the same behaviour in ivy.
       */
      it('should notify on changes when a given view is removed and re-inserted at the same index',
         () => {
           @Component({
             selector: 'test-comp',
             template: `
              <ng-template #tpl><div #foo>match</div></ng-template>
              <ng-template vc></ng-template>
            `,
           })
           class TestComponent implements AfterViewInit {
             queryListNotificationCounter = 0;

             @ViewChild(ViewContainerManipulatorDirective) vc!: ViewContainerManipulatorDirective;
             @ViewChild('tpl') tpl!: TemplateRef<any>;
             @ViewChildren('foo') query!: QueryList<any>;

             ngAfterViewInit() {
               this.query.changes.subscribe(() => this.queryListNotificationCounter++);
             }
           }

           TestBed.configureTestingModule(
               {declarations: [ViewContainerManipulatorDirective, TestComponent]});
           const fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();

           const queryList = fixture.componentInstance.query;
           const {tpl, vc} = fixture.componentInstance;

           const viewRef = vc.insertTpl(tpl, {}, 0);
           fixture.detectChanges();
           expect(queryList.length).toBe(1);
           expect(fixture.componentInstance.queryListNotificationCounter).toBe(1);

           vc.move(viewRef, 0);
           fixture.detectChanges();
           expect(queryList.length).toBe(1);
           expect(fixture.componentInstance.queryListNotificationCounter).toBe(2);
         });

      it('should support a mix of content queries from the declaration and embedded view', () => {
        @Directive({selector: '[query-for-lots-of-content]'})
        class QueryForLotsOfContent {
          @ContentChildren('foo', {descendants: true}) foos1!: QueryList<ElementRef>;
          @ContentChildren('foo', {descendants: true}) foos2!: QueryList<ElementRef>;
        }

        @Directive({selector: '[query-for-content]'})
        class QueryForContent {
          @ContentChildren('foo') foos!: QueryList<ElementRef>;
        }

        @Component({
          selector: 'test-comp',
          template: `
            <div query-for-lots-of-content>
              <ng-template ngFor let-item [ngForOf]="items">
                <div query-for-content>
                  <span #foo></span>
                </div>
              </ng-template>
            </div>
          `
        })
        class TestComponent {
          items = [1, 2];
        }

        TestBed.configureTestingModule(
            {declarations: [TestComponent, QueryForContent, QueryForLotsOfContent]});

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const lotsOfContentEl = fixture.debugElement.query(By.directive(QueryForLotsOfContent));
        const lotsOfContentInstance = lotsOfContentEl.injector.get(QueryForLotsOfContent);

        const contentEl = fixture.debugElement.query(By.directive(QueryForContent));
        const contentInstance = contentEl.injector.get(QueryForContent);

        expect(lotsOfContentInstance.foos1.length).toBe(2);
        expect(lotsOfContentInstance.foos2.length).toBe(2);
        expect(contentInstance.foos.length).toBe(1);

        fixture.componentInstance.items = [];
        fixture.detectChanges();
        expect(lotsOfContentInstance.foos1.length).toBe(0);
        expect(lotsOfContentInstance.foos2.length).toBe(0);
      });

      // https://stackblitz.com/edit/angular-rrmmuf?file=src/app/app.component.ts
      it('should report results when different instances of TemplateRef are inserted into one ViewContainerRefs',
         () => {
           @Component({
             selector: 'test-comp',
             template: `
               <ng-template #tpl1 let-idx="idx">
                 <div #foo [id]="'foo1_' + idx"></div>
               </ng-template>

               <div #foo id="middle"></div>

               <ng-template #tpl2 let-idx="idx">
                 <div #foo [id]="'foo2_' + idx"></div>
               </ng-template>

               <ng-template vc></ng-template>
             `,
           })
           class TestComponent {
             @ViewChild(ViewContainerManipulatorDirective) vc!: ViewContainerManipulatorDirective;
             @ViewChild('tpl1') tpl1!: TemplateRef<any>;
             @ViewChild('tpl2') tpl2!: TemplateRef<any>;
             @ViewChildren('foo') query!: QueryList<any>;
           }

           TestBed.configureTestingModule(
               {declarations: [ViewContainerManipulatorDirective, TestComponent]});
           const fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();

           const queryList = fixture.componentInstance.query;
           const {tpl1, tpl2, vc} = fixture.componentInstance;

           expect(queryList.length).toBe(1);
           expect(queryList.first.nativeElement.getAttribute('id')).toBe('middle');

           vc.insertTpl(tpl1!, {idx: 0}, 0);
           vc.insertTpl(tpl2!, {idx: 1}, 1);
           fixture.detectChanges();

           expect(queryList.length).toBe(3);
           let qListArr = queryList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('middle');
           expect(qListArr[2].nativeElement.getAttribute('id')).toBe('foo2_1');

           vc.insertTpl(tpl1!, {idx: 1}, 1);
           fixture.detectChanges();

           expect(queryList.length).toBe(4);
           qListArr = queryList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('foo1_1');
           expect(qListArr[2].nativeElement.getAttribute('id')).toBe('middle');
           expect(qListArr[3].nativeElement.getAttribute('id')).toBe('foo2_1');

           vc.remove(1);
           fixture.detectChanges();

           expect(queryList.length).toBe(3);
           qListArr = queryList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('middle');
           expect(qListArr[2].nativeElement.getAttribute('id')).toBe('foo2_1');

           vc.remove(1);
           fixture.detectChanges();

           expect(queryList.length).toBe(2);
           qListArr = queryList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('middle');
         });

      // https://stackblitz.com/edit/angular-7vvo9j?file=src%2Fapp%2Fapp.component.ts
      // https://stackblitz.com/edit/angular-xzwp6n
      it('should report results when the same TemplateRef is inserted into different ViewContainerRefs',
         () => {
           @Component({
             selector: 'test-comp',
             template: `
               <ng-template #tpl let-idx="idx" let-container_idx="container_idx">
                 <div #foo [id]="'foo_' + container_idx + '_' + idx"></div>
               </ng-template>

               <ng-template vc #vi0="vc"></ng-template>
               <ng-template vc #vi1="vc"></ng-template>
             `,
           })
           class TestComponent {
             @ViewChild('tpl') tpl!: TemplateRef<any>;
             @ViewChild('vi0') vi0!: ViewContainerManipulatorDirective;
             @ViewChild('vi1') vi1!: ViewContainerManipulatorDirective;
             @ViewChildren('foo') query!: QueryList<any>;
           }

           TestBed.configureTestingModule(
               {declarations: [ViewContainerManipulatorDirective, TestComponent]});
           const fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();

           const queryList = fixture.componentInstance.query;
           const {tpl, vi0, vi1} = fixture.componentInstance;

           expect(queryList.length).toBe(0);

           vi0.insertTpl(tpl!, {idx: 0, container_idx: 0}, 0);
           vi1.insertTpl(tpl!, {idx: 0, container_idx: 1}, 0);
           fixture.detectChanges();

           expect(queryList.length).toBe(2);
           let qListArr = queryList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo_0_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('foo_1_0');

           vi0.remove();
           fixture.detectChanges();

           expect(queryList.length).toBe(1);
           qListArr = queryList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo_1_0');

           vi1.remove();
           fixture.detectChanges();
           expect(queryList.length).toBe(0);
         });

      // https://stackblitz.com/edit/angular-wpd6gv?file=src%2Fapp%2Fapp.component.ts
      it('should report results from views inserted in a lifecycle hook', () => {
        @Component({
          selector: 'my-app',
          template: `
            <ng-template #tpl>
              <span #foo id="from_tpl"></span>
            </ng-template>

            <ng-template [ngTemplateOutlet]="show ? tpl : null"></ng-template>
          `,
        })
        class MyApp {
          show = false;
          @ViewChildren('foo') query!: QueryList<any>;
        }

        TestBed.configureTestingModule({declarations: [MyApp], imports: [CommonModule]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const queryList = fixture.componentInstance.query;
        expect(queryList.length).toBe(0);

        fixture.componentInstance.show = true;
        fixture.detectChanges();
        expect(queryList.length).toBe(1);
        expect(queryList.first.nativeElement.id).toBe('from_tpl');

        fixture.componentInstance.show = false;
        fixture.detectChanges();
        expect(queryList.length).toBe(0);
      });
    });
  });

  describe('non-regression', () => {
    it('should query by provider super-type in an embedded view', () => {
      @Directive({selector: '[child]'})
      class Child {
      }

      @Directive({selector: '[parent]', providers: [{provide: Child, useExisting: Parent}]})
      class Parent extends Child {
      }

      @Component({
        selector: 'test-cmpt',
        template:
            `<ng-template [ngIf]="true"><ng-template [ngIf]="true"><div parent></div></ng-template></ng-template>`
      })
      class TestCmpt {
        @ViewChildren(Child) instances!: QueryList<Child>;
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, Parent, Child]});
      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();

      expect(fixture.componentInstance.instances.length).toBe(1);
    });

    it('should flatten multi-provider results', () => {
      class MyClass {}

      @Component({
        selector: 'with-multi-provider',
        template: '',
        providers:
            [{provide: MyClass, useExisting: forwardRef(() => WithMultiProvider), multi: true}]
      })
      class WithMultiProvider {
      }

      @Component({selector: 'test-cmpt', template: `<with-multi-provider></with-multi-provider>`})
      class TestCmpt {
        @ViewChildren(MyClass) queryResults!: QueryList<WithMultiProvider>;
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, WithMultiProvider]});
      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();

      expect(fixture.componentInstance.queryResults.length).toBe(1);
      expect(fixture.componentInstance.queryResults.first).toBeAnInstanceOf(WithMultiProvider);
    });

    it('should flatten multi-provider results when crossing ng-template', () => {
      class MyClass {}

      @Component({
        selector: 'with-multi-provider',
        template: '',
        providers:
            [{provide: MyClass, useExisting: forwardRef(() => WithMultiProvider), multi: true}]
      })
      class WithMultiProvider {
      }

      @Component({
        selector: 'test-cmpt',
        template: `
          <ng-template [ngIf]="true"><with-multi-provider></with-multi-provider></ng-template>
          <with-multi-provider></with-multi-provider>
        `
      })
      class TestCmpt {
        @ViewChildren(MyClass) queryResults!: QueryList<WithMultiProvider>;
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, WithMultiProvider]});
      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();

      expect(fixture.componentInstance.queryResults.length).toBe(2);
      expect(fixture.componentInstance.queryResults.first).toBeAnInstanceOf(WithMultiProvider);
      expect(fixture.componentInstance.queryResults.last).toBeAnInstanceOf(WithMultiProvider);
    });

    it('should allow undefined provider value in a [View/Content]Child queries', () => {
      @Directive({selector: '[group]'})
      class GroupDir {
      }

      @Directive(
          {selector: '[undefinedGroup]', providers: [{provide: GroupDir, useValue: undefined}]})
      class UndefinedGroup {
      }

      @Component({
        template: `
          <div group></div>
          <ng-template [ngIf]="true">
            <div undefinedGroup></div>
          </ng-template>
        `
      })
      class App {
        @ViewChild(GroupDir) group!: GroupDir;
      }

      TestBed.configureTestingModule(
          {declarations: [App, GroupDir, UndefinedGroup], imports: [CommonModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.group).toBeAnInstanceOf(GroupDir);
    });

    it('should allow null / undefined provider value in a [View/Content]Children queries', () => {
      @Directive({selector: '[group]'})
      class GroupDir {
      }

      @Directive({selector: '[nullGroup]', providers: [{provide: GroupDir, useValue: null}]})
      class NullGroup {
      }

      @Directive(
          {selector: '[undefinedGroup]', providers: [{provide: GroupDir, useValue: undefined}]})
      class UndefinedGroup {
      }

      @Component({
        template: `
          <ng-template [ngIf]="true">
            <div nullGroup></div>
          </ng-template>
          <div group></div>
          <ng-template [ngIf]="true">
            <div undefinedGroup></div>
          </ng-template>
        `
      })
      class App {
        @ViewChildren(GroupDir) groups!: QueryList<GroupDir>;
      }

      TestBed.configureTestingModule(
          {declarations: [App, GroupDir, NullGroup, UndefinedGroup], imports: [CommonModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const queryList = fixture.componentInstance.groups;
      expect(queryList.length).toBe(3);

      const groups = queryList.toArray();
      expect(groups[0]).toBeNull();
      expect(groups[1]).toBeAnInstanceOf(GroupDir);
      expect(groups[2]).toBeUndefined();
    });
  });
});

function initWithTemplate(compType: Type<any>, template: string) {
  TestBed.overrideComponent(compType, {set: new Component({template})});
  const fixture = TestBed.createComponent(compType);
  fixture.detectChanges();
  return fixture;
}

@Component({selector: 'local-ref-query-component', template: '<ng-content></ng-content>'})
class QueryComp {
  @ViewChild('viewQuery') viewChild!: any;
  @ContentChild('contentQuery') contentChild!: any;

  @ViewChildren('viewQuery') viewChildren!: QueryList<any>;
  @ContentChildren('contentQuery') contentChildren!: QueryList<any>;
}

@Component({selector: 'app-comp', template: ``})
class AppComp {
}

@Component({selector: 'simple-comp-a', template: ''})
class SimpleCompA {
}

@Component({selector: 'simple-comp-b', template: ''})
class SimpleCompB {
}

@Directive({selector: '[text]'})
class TextDirective {
  @Input() text = '';
}

@Component({
  selector: 'static-view-query-comp',
  template: `
    <div [text]="text"></div>
    <span #foo></span>
  `
})
class StaticViewQueryComp {
  private _textDir!: TextDirective;
  private _foo!: ElementRef;
  setEvents: string[] = [];

  @ViewChild(TextDirective, {static: true})
  get textDir(): TextDirective {
    return this._textDir;
  }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ViewChild('foo')
  get foo(): ElementRef {
    return this._foo;
  }

  set foo(value: ElementRef) {
    this.setEvents.push('foo set');
    this._foo = value;
  }

  text = 'some text';
}

@Component({
  selector: 'subclass-static-view-query-comp',
  template: `
    <div [text]="text"></div>
    <span #foo></span>

    <div #bar></div>
    <span #baz></span>
  `
})
class SubclassStaticViewQueryComp extends StaticViewQueryComp {
  @ViewChild('bar', {static: true}) bar!: ElementRef;

  @ViewChild('baz') baz!: ElementRef;
}


@Component({selector: 'static-content-query-comp', template: `<ng-content></ng-content>`})
class StaticContentQueryComp {
  private _textDir!: TextDirective;
  private _foo!: ElementRef;
  setEvents: string[] = [];

  @ContentChild(TextDirective, {static: true})
  get textDir(): TextDirective {
    return this._textDir;
  }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ContentChild('foo')
  get foo(): ElementRef {
    return this._foo;
  }

  set foo(value: ElementRef) {
    this.setEvents.push('foo set');
    this._foo = value;
  }
}

@Directive({selector: '[staticContentQueryDir]'})
class StaticContentQueryDir {
  private _textDir!: TextDirective;
  private _foo!: ElementRef;
  setEvents: string[] = [];

  @ContentChild(TextDirective, {static: true})
  get textDir(): TextDirective {
    return this._textDir;
  }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ContentChild('foo')
  get foo(): ElementRef {
    return this._foo;
  }

  set foo(value: ElementRef) {
    this.setEvents.push('foo set');
    this._foo = value;
  }
}

@Component({selector: 'subclass-static-content-query-comp', template: `<ng-content></ng-content>`})
class SubclassStaticContentQueryComp extends StaticContentQueryComp {
  @ContentChild('bar', {static: true}) bar!: ElementRef;

  @ContentChild('baz') baz!: ElementRef;
}

@Component({
  selector: 'query-with-changes',
  template: `
    <div *ngIf="showing" #foo></div>
  `
})
export class QueryCompWithChanges {
  @ViewChildren('foo') foos!: QueryList<any>;

  showing = false;
}

@Component({selector: 'query-target', template: '<ng-content></ng-content>'})
class SuperDirectiveQueryTarget {
}

@Directive({selector: '[super-directive]'})
class SuperDirective {
  @ViewChildren(SuperDirectiveQueryTarget) headers!: QueryList<SuperDirectiveQueryTarget>;
}

@Component({
  template: `
    <query-target>One</query-target>
    <query-target>Two</query-target>
  `
})
class SubComponent extends SuperDirective {
}
