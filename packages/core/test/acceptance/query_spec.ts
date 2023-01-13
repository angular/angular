/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, InjectionToken, Input, QueryList, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef, ViewRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('query logic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComp,
        QueryComp,
        SimpleCompA,
        SimpleCompB,
        StaticViewQueryComp,
        TextDirective,
        SubclassStaticViewQueryComp,
        StaticContentQueryComp,
        SubclassStaticContentQueryComp,
        QueryCompWithChanges,
        StaticContentQueryDir,
        SuperDirectiveQueryTarget,
        SuperDirective,
        SubComponent,
        TestComponentWithToken,
        TestInjectionTokenContentQueries,
        TestInjectionTokenQueries,
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

    it('should return ElementRefs when HTML elements are labeled and retrieved', () => {
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

    it('should support selecting InjectionToken', () => {
      const fixture = TestBed.createComponent(TestInjectionTokenQueries);
      const instance = fixture.componentInstance;
      fixture.detectChanges();
      expect(instance.viewFirstOption).toBeDefined();
      expect(instance.viewFirstOption instanceof TestComponentWithToken).toBe(true);
      expect(instance.viewOptions).toBeDefined();
      expect(instance.viewOptions.length).toBe(2);
      expect(instance.contentFirstOption).toBeUndefined();
      expect(instance.contentOptions).toBeDefined();
      expect(instance.contentOptions.length).toBe(0);
    });

    it('should return TemplateRefs when templates are labeled and retrieved', () => {
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

    it('should support selecting InjectionToken', () => {
      const fixture = TestBed.createComponent(TestInjectionTokenContentQueries);
      const instance =
          fixture.debugElement.query(By.directive(TestInjectionTokenQueries)).componentInstance;
      fixture.detectChanges();
      expect(instance.contentFirstOption).toBeDefined();
      expect(instance.contentFirstOption instanceof TestComponentWithToken).toBe(true);
      expect(instance.contentOptions).toBeDefined();
      expect(instance.contentOptions.length).toBe(2);
    });

    it('should return Component instances when Components are labeled and retrieved', () => {
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

    it('should return ElementRefs when HTML elements are labeled and retrieved', () => {
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

    it('should return TemplateRefs when templates are labeled and retrieved', () => {
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
      expect(comp.contentChild.elementRef.nativeElement).toBe(firstChild.childNodes[0].nativeNode);

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

    it('should not match directive host with content queries', () => {
      @Directive({
        selector: '[content-query]',
        standalone: true,
      })
      class ContentQueryDirective {
        @ContentChildren('foo', {descendants: true}) foos!: QueryList<ElementRef>;
      }

      @Component({
        standalone: true,
        imports: [ContentQueryDirective],
        template: `<div content-query #foo></div>`
      })
      class TestCmp {
        @ViewChild(ContentQueryDirective, {static: true})
        contentQueryDirective!: ContentQueryDirective;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.contentQueryDirective.foos;
      expect(qList.length).toBe(0);
    });

    it('should report results to appropriate queries where deep content queries are nested', () => {
      @Directive({selector: '[content-query]', standalone: true, exportAs: 'query'})
      class ContentQueryDirective {
        @ContentChildren('foo, bar, baz', {descendants: true}) qlist!: QueryList<ElementRef>;
      }

      @Component({
        standalone: true,
        imports: [ContentQueryDirective],
        template: `
          <div content-query #out="query">
            <span #foo></span>
            <div content-query #in="query">
              <span #bar></span>
            </div>
            <span #baz></span>
          </div>
        `
      })
      class TestCmp {
        @ViewChild('in', {static: true}) in !: ContentQueryDirective;
        @ViewChild('out', {static: true}) out!: ContentQueryDirective;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const inQList = fixture.componentInstance.in.qlist;
      expect(inQList.length).toBe(1);

      const outQList = fixture.componentInstance.out.qlist;
      expect(outQList.length).toBe(3);
    });

    it('should support nested shallow content queries', () => {
      @Directive({selector: '[content-query]', standalone: true, exportAs: 'query'})
      class ContentQueryDirective {
        @ContentChildren('foo') qlist!: QueryList<ElementRef>;
      }

      @Component({
        standalone: true,
        imports: [ContentQueryDirective],
        template: `
          <div content-query #out="query">
            <div content-query #in="query" #foo>
              <span #foo></span>
            </div>
          </div>
        `
      })
      class TestCmp {
        @ViewChild('in', {static: true}) in !: ContentQueryDirective;
        @ViewChild('out', {static: true}) out!: ContentQueryDirective;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const inQList = fixture.componentInstance.in.qlist;
      expect(inQList.length).toBe(1);

      const outQList = fixture.componentInstance.out.qlist;
      expect(outQList.length).toBe(1);
    });

    it('should respect shallow flag on content queries when mixing deep and shallow queries',
       () => {
         @Directive(
             {selector: '[shallow-content-query]', standalone: true, exportAs: 'shallow-query'})
         class ShallowContentQueryDirective {
           @ContentChildren('foo') qlist!: QueryList<ElementRef>;
         }

         @Directive({selector: '[deep-content-query]', standalone: true, exportAs: 'deep-query'})
         class DeepContentQueryDirective {
           @ContentChildren('foo', {descendants: true}) qlist!: QueryList<ElementRef>;
         }

         @Component({
           standalone: true,
           imports: [ShallowContentQueryDirective, DeepContentQueryDirective],
           template: `
          <div shallow-content-query #shallow="shallow-query" deep-content-query #deep="deep-query">
            <span #foo></span>
            <div>
              <span #foo></span>
            </div>
          </div>
        `
         })
         class TestCmp {
           @ViewChild('shallow', {static: true}) shallow!: ShallowContentQueryDirective;
           @ViewChild('deep', {static: true}) deep!: DeepContentQueryDirective;
         }

         const fixture = TestBed.createComponent(TestCmp);
         fixture.detectChanges();

         const inQList = fixture.componentInstance.shallow.qlist;
         expect(inQList.length).toBe(1);

         const outQList = fixture.componentInstance.deep.qlist;
         expect(outQList.length).toBe(2);
       });

    it('should support shallow ContentChild queries', () => {
      @Directive({selector: '[query-dir]', standalone: true})
      class ContentQueryDirective {
        @ContentChild('foo', {descendants: false}) shallow: ElementRef|undefined;
        // ContentChild queries have {descendants: true} option by default
        @ContentChild('foo') deep: ElementRef|undefined;
      }

      @Component({
        standalone: true,
        imports: [ContentQueryDirective],
        template: `
          <div query-dir>
            <div>
              <span #foo></span>
            </div>
          </div>
        `
      })
      class TestCmp {
        @ViewChild(ContentQueryDirective, {static: true}) queryDir!: ContentQueryDirective;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      expect(fixture.componentInstance.queryDir.shallow).toBeUndefined();
      expect(fixture.componentInstance.queryDir.deep).toBeInstanceOf(ElementRef);
    });

    it('should support view and content queries matching the same element', () => {
      @Directive({
        selector: '[content-query]',
        standalone: true,
      })
      class ContentQueryDirective {
        @ContentChildren('foo') foos!: QueryList<ElementRef>;
      }

      @Component({
        standalone: true,
        imports: [ContentQueryDirective],
        template: `
          <div content-query>
            <div id="contentAndView" #foo></div>
          </div>
          <div id="contentOnly" #bar></div>
        `
      })
      class TestCmp {
        @ViewChild(ContentQueryDirective, {static: true}) contentQueryDir!: ContentQueryDirective;
        @ViewChildren('foo, bar') fooBars!: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const contentQList = fixture.componentInstance.contentQueryDir.foos;
      expect(contentQList.length).toBe(1);
      expect(contentQList.first.nativeElement.getAttribute('id')).toBe('contentAndView');

      const viewQList = fixture.componentInstance.fooBars;
      expect(viewQList.length).toBe(2);
      expect(viewQList.first.nativeElement.getAttribute('id')).toBe('contentAndView');
      expect(viewQList.last.nativeElement.getAttribute('id')).toBe('contentOnly');
    });
  });

  describe('query order', () => {
    @Directive({selector: '[text]', standalone: true})
    class TextDirective {
      @Input() text: string|undefined;
    }

    it('should register view query matches from top to bottom', () => {
      @Component({
        standalone: true,
        imports: [TextDirective],
        template: `
          <span text="A"></span>
          <div text="B">
            <span text="C">
              <span text="D"></span>
            </span>
          </div>
          <span text="E"></span>`
      })
      class TestCmp {
        @ViewChildren(TextDirective) texts!: QueryList<TextDirective>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      expect(fixture.componentInstance.texts.map(item => item.text)).toEqual([
        'A', 'B', 'C', 'D', 'E'
      ]);
    });

    it('should register content query matches from top to bottom', () => {
      @Directive({
        selector: '[content-query]',
        standalone: true,
      })
      class ContentQueryDirective {
        @ContentChildren(TextDirective, {descendants: true}) texts!: QueryList<TextDirective>;
      }

      @Component({
        standalone: true,
        imports: [TextDirective, ContentQueryDirective],
        template: `
          <div content-query>
            <span text="A"></span>
            <div text="B">
              <span text="C">
                <span text="D"></span>
              </span>
            </div>
            <span text="E"></span>
          </div>`
      })
      class TestCmp {
        @ViewChild(ContentQueryDirective, {static: true})
        contentQueryDirective!: ContentQueryDirective;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      expect(fixture.componentInstance.contentQueryDirective.texts.map(item => item.text)).toEqual([
        'A', 'B', 'C', 'D', 'E'
      ]);
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

    it('should match directives on <ng-container> when crossing nested <ng-container>', () => {
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

  describe('read option', () => {
    @Directive({selector: '[child]', standalone: true})
    class Child {
    }

    @Directive({selector: '[otherChild]', standalone: true})
    class OtherChild {
    }

    it('should query using type predicate and read ElementRef', () => {
      @Component({
        standalone: true,
        imports: [Child],
        template: `<div child></div>`,
      })
      class TestCmp {
        @ViewChildren(Child, {read: ElementRef}) query?: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      const elToQuery = fixture.nativeElement.querySelector('div');

      expect(qList.length).toBe(1);
      expect(qList.first.nativeElement).toBe(elToQuery);
    });

    it('should query using type predicate and read another directive type', () => {
      @Component({
        standalone: true,
        imports: [Child, OtherChild],
        template: `<div child otherChild></div>`,
      })
      class TestCmp {
        @ViewChildren(Child, {read: OtherChild}) query?: QueryList<OtherChild>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeAnInstanceOf(OtherChild);
    });

    it('should not add results to query if a requested token cant be read', () => {
      @Component({
        standalone: true,
        imports: [Child],
        template: `<div child></div>`,
      })
      class TestCmp {
        @ViewChildren(Child, {read: OtherChild}) query?: QueryList<OtherChild>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(0);
    });

    it('should query using local ref and read ElementRef by default', () => {
      @Component({
        standalone: true,
        template: `
          <div #foo></div>
          <div></div>
        `,
      })
      class TestCmp {
        @ViewChildren('foo') query?: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      const elToQuery = fixture.nativeElement.querySelector('div');

      expect(qList.length).toBe(1);
      expect(qList.first.nativeElement).toBe(elToQuery);
    });

    it('should query for multiple elements and read ElementRef by default', () => {
      @Component({
        standalone: true,
        template: `
          <div #foo></div>
          <div></div>
          <div #bar></div>
        `,
      })
      class TestCmp {
        @ViewChildren('foo,bar') query?: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      const elToQuery = fixture.nativeElement.querySelectorAll('div');

      expect(qList.length).toBe(2);
      expect(qList.first.nativeElement).toBe(elToQuery[0]);
      expect(qList.last.nativeElement).toBe(elToQuery[2]);
    });

    it('should read ElementRef from an element when explicitly asked for', () => {
      @Component({
        standalone: true,
        template: `
          <div #foo></div>
          <div></div>
        `,
      })
      class TestCmp {
        @ViewChildren('foo', {read: ElementRef}) query?: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      const elToQuery = fixture.nativeElement.querySelector('div');

      expect(qList.length).toBe(1);
      expect(qList.first.nativeElement).toBe(elToQuery);
    });

    it('should query for <ng-container> and read ElementRef with a native element pointing to comment node',
       () => {
         @Component({
           standalone: true,
           template: `<ng-container #foo></ng-container>`,
         })
         class TestCmp {
           @ViewChildren('foo', {read: ElementRef}) query?: QueryList<ElementRef>;
         }

         const fixture = TestBed.createComponent(TestCmp);
         fixture.detectChanges();

         const qList = fixture.componentInstance.query!;
         expect(qList.length).toBe(1);
         expect(qList.first.nativeElement.nodeType).toBe(Node.COMMENT_NODE);
       });

    it('should query for <ng-container> and read ElementRef without explicit read option', () => {
      @Component({
        standalone: true,
        template: `<ng-container #foo></ng-container>`,
      })
      class TestCmp {
        @ViewChildren('foo') query?: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first.nativeElement.nodeType).toBe(Node.COMMENT_NODE);
    });

    it('should read ViewContainerRef from element nodes when explicitly asked for', () => {
      @Component({
        standalone: true,
        template: `<div #foo></div>`,
      })
      class TestCmp {
        @ViewChildren('foo', {read: ViewContainerRef}) query?: QueryList<ViewContainerRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(ViewContainerRef);
    });

    it('should read ViewContainerRef from ng-template nodes when explicitly asked for', () => {
      @Component({
        standalone: true,
        template: `<ng-template #foo></ng-template>`,
      })
      class TestCmp {
        @ViewChildren('foo', {read: ViewContainerRef}) query?: QueryList<ViewContainerRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(ViewContainerRef);
    });

    it('should read ElementRef with a native element pointing to comment DOM node from ng-template',
       () => {
         @Component({
           standalone: true,
           template: `<ng-template #foo></ng-template>`,
         })
         class TestCmp {
           @ViewChildren('foo', {read: ElementRef}) query?: QueryList<ElementRef>;
         }

         const fixture = TestBed.createComponent(TestCmp);
         fixture.detectChanges();

         const qList = fixture.componentInstance.query!;
         expect(qList.length).toBe(1);
         expect(qList.first.nativeElement.nodeType).toBe(Node.COMMENT_NODE);
       });

    it('should read TemplateRef from ng-template by default', () => {
      @Component({
        standalone: true,
        template: `<ng-template #foo></ng-template>`,
      })
      class TestCmp {
        @ViewChildren('foo') query?: QueryList<TemplateRef<unknown>>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(TemplateRef);
    });

    it('should read TemplateRef from ng-template when explicitly asked for', () => {
      @Component({
        standalone: true,
        template: `<ng-template #foo></ng-template>`,
      })
      class TestCmp {
        @ViewChildren('foo', {read: TemplateRef}) query?: QueryList<TemplateRef<unknown>>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(TemplateRef);
    });

    it('should read component instance if element queried for is a component host', () => {
      @Component({selector: 'child-cmp', standalone: true, template: ''})
      class ChildCmp {
      }

      @Component({
        standalone: true,
        imports: [ChildCmp],
        template: `<child-cmp #foo></child-cmp>`,
      })
      class TestCmp {
        @ViewChildren('foo') query?: QueryList<ChildCmp>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(ChildCmp);
    });

    it('should read component instance with explicit exportAs', () => {
      @Component({
        selector: 'child-cmp',
        exportAs: 'child',
        standalone: true,
        template: '',
      })
      class ChildCmp {
      }

      @Component({
        standalone: true,
        imports: [ChildCmp],
        template: `<child-cmp #foo="child"></child-cmp>`,
      })
      class TestCmp {
        @ViewChildren('foo') query?: QueryList<ChildCmp>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(ChildCmp);
    });

    it('should read directive instance if element queried for has an exported directive with a matching name',
       () => {
         @Directive({selector: '[child]', exportAs: 'child', standalone: true})
         class ChildDirective {
         }

         @Component({
           standalone: true,
           imports: [ChildDirective],
           template: `<div #foo="child" child></div>`,
         })
         class TestCmp {
           @ViewChildren('foo') query?: QueryList<ChildDirective>;
         }

         const fixture = TestBed.createComponent(TestCmp);
         fixture.detectChanges();

         const qList = fixture.componentInstance.query!;
         expect(qList.length).toBe(1);
         expect(qList.first).toBeInstanceOf(ChildDirective);
       });

    it('should read all matching directive instances from a given element', () => {
      @Directive({selector: '[child1]', exportAs: 'child1', standalone: true})
      class Child1Dir {
      }

      @Directive({selector: '[child2]', exportAs: 'child2', standalone: true})
      class Child2Dir {
      }

      @Component({
        standalone: true,
        imports: [Child1Dir, Child2Dir],
        template: `<div #foo="child1" child1 #bar="child2" child2></div>`,
      })
      class TestCmp {
        @ViewChildren('foo, bar') query?: QueryList<unknown>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(2);
      expect(qList.first).toBeInstanceOf(Child1Dir);
      expect(qList.last).toBeInstanceOf(Child2Dir);
    });

    it('should read multiple locals exporting the same directive from a given element', () => {
      @Directive({selector: '[child]', exportAs: 'child', standalone: true})
      class ChildDir {
      }

      @Component({
        standalone: true,
        imports: [ChildDir],
        template: `<div child #foo="child" #bar="child"></div>`,
      })
      class TestCmp {
        @ViewChildren('foo, bar') query?: QueryList<ChildDir>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(2);
      expect(qList.first).toBeInstanceOf(ChildDir);
      expect(qList.last).toBeInstanceOf(ChildDir);
    });

    it('should query multiple locals on the same element', () => {
      @Component({
        selector: 'multiple-local-refs',
        template: `
          <div #foo #bar id="target"></div>
          <div></div>
        `,
      })
      class MultipleLocalRefsComp {
        @ViewChildren('foo') fooQuery!: QueryList<any>;
        @ViewChildren('bar') barQuery!: QueryList<any>;
      }

      const fixture = TestBed.createComponent(MultipleLocalRefsComp);
      fixture.detectChanges();

      const cmptInstance = fixture.componentInstance;

      const targetElement = fixture.nativeElement.querySelector('#target');
      const fooList = cmptInstance.fooQuery;

      expect(fooList.length).toBe(1);
      expect(fooList.first.nativeElement).toEqual(targetElement);

      const barList = cmptInstance.barQuery;
      expect(barList.length).toBe(1);
      expect(barList.first.nativeElement).toEqual(targetElement);
    });

    it('should match on exported directive name and read a requested token', () => {
      @Directive({selector: '[child]', exportAs: 'child', standalone: true})
      class ChildDir {
      }

      @Component({
        standalone: true,
        imports: [ChildDir],
        template: `<div child #foo="child"></div>`,
      })
      class TestCmp {
        @ViewChildren('foo', {read: ElementRef}) query?: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(ElementRef);
    });

    it('should support reading a mix of ElementRef and directive instances', () => {
      @Directive({selector: '[child]', exportAs: 'child', standalone: true})
      class ChildDir {
      }

      @Component({
        standalone: true,
        imports: [ChildDir],
        template: `<div #foo #bar="child" child></div>`,
      })
      class TestCmp {
        @ViewChildren('foo, bar') query?: QueryList<unknown>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(2);
      expect(qList.first).toBeInstanceOf(ElementRef);
      expect(qList.last).toBeInstanceOf(ChildDir);
    });

    it('should not add results to selector-based query if a requested token cant be read', () => {
      @Directive({selector: '[child]', standalone: true})
      class ChildDir {
      }

      @Component({
        standalone: true,
        imports: [],
        template: `<div #foo></div>`,
      })
      class TestCmp {
        @ViewChildren('foo', {read: ChildDir}) query?: QueryList<ChildDir>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(0);
    });

    it('should not add results to directive-based query if only read token matches', () => {
      @Directive({selector: '[child]', standalone: true})
      class ChildDir {
      }

      @Directive({selector: '[otherChild]', standalone: true})
      class OtherChildDir {
      }

      @Component({
        standalone: true,
        imports: [Child],
        template: `<div child></div>`,
      })
      class TestCmp {
        @ViewChildren(OtherChild, {read: Child}) query?: QueryList<ChildDir>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(0);
    });

    it('should not add results to TemplateRef-based query if only read token matches', () => {
      @Component({
        standalone: true,
        template: `<div></div>`,
      })
      class TestCmp {
        @ViewChildren(TemplateRef, {read: ElementRef}) query?: QueryList<ElementRef>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(0);
    });

    it('should not add results to the query in case no match found (via TemplateRef)', () => {
      @Component({
        standalone: true,
        template: `<div></div>`,
      })
      class TestCmp {
        @ViewChildren(TemplateRef) query?: QueryList<TemplateRef<unknown>>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(0);
    });

    it('should query templates if the type is TemplateRef (and respect "read" option)', () => {
      @Component({
        standalone: true,
        template: `
          <ng-template #foo><div>Test</div></ng-template>
          <ng-template #bar><div>Test</div></ng-template>
          <ng-template #baz><div>Test</div></ng-template>
        `,
      })
      class TestCmp {
        @ViewChildren(TemplateRef) tplQuery?: QueryList<TemplateRef<unknown>>;
        @ViewChildren(TemplateRef, {read: ElementRef}) elRefQuery?: QueryList<TemplateRef<unknown>>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const tplQuery = fixture.componentInstance.tplQuery!;
      const elRefQuery = fixture.componentInstance.elRefQuery!;

      expect(tplQuery.length).toBe(3);
      expect(tplQuery.first).toBeInstanceOf(TemplateRef);

      expect(elRefQuery.length).toBe(3);
      expect(elRefQuery.first).toBeInstanceOf(ElementRef);
    });

    it('should match using string selector and directive as a read argument', () => {
      @Component({
        standalone: true,
        imports: [Child],
        template: `<div child #foo></div>`,
      })
      class TestCmp {
        @ViewChildren('foo', {read: Child}) query?: QueryList<Child>;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const qList = fixture.componentInstance.query!;
      expect(qList.length).toBe(1);
      expect(qList.first).toBeInstanceOf(Child);
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

    it('should only fire if the content of the query changes', () => {
      // When views are inserted/removed the content query need to be recomputed.
      // Recomputing the query may result in no changes to the query (the item added/removed was
      // not part of the query). This tests asserts that the query does not fire when no changes
      // occur.
      TestBed.configureTestingModule(
          {declarations: [QueryCompWithStrictChangeEmitParent, QueryCompWithNoChanges]});
      const fixture = TestBed.createComponent(QueryCompWithNoChanges);
      let changesStrict = 0;
      const componentInstance = fixture.componentInstance.queryComp;
      fixture.detectChanges();

      componentInstance.foos.changes.subscribe((value: any) => {
        // subscribe to the changes and record when changes occur.
        changesStrict += 1;
      });

      // First verify that the subscription is working.
      fixture.componentInstance.innerShowing = false;
      fixture.detectChanges();
      expect(changesStrict).toBe(1);  // We detected a change
      expect(componentInstance.foos.toArray().length).toEqual(1);


      // now verify that removing a view does not needlessly fire subscription
      fixture.componentInstance.showing = false;
      fixture.detectChanges();
      expect(changesStrict).toBe(1);  // We detected a change
      expect(componentInstance.foos.toArray().length).toEqual(1);

      // now verify that adding a view does not needlessly fire subscription
      fixture.componentInstance.showing = true;
      fixture.detectChanges();
      expect(changesStrict).toBe(1);  // We detected a change
      // Note: even though the `showing` is `true` and the second `<div>` is displayed, the
      // child element of that <div> is hidden because the `innerShowing` flag is still `false`,
      // so we expect only one element to be present in the `foos` array.
      expect(componentInstance.foos.toArray().length).toEqual(1);
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
       */
      it('should NOT notify on changes when a given view is removed and re-inserted at the same index',
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
           expect(fixture.componentInstance.queryListNotificationCounter).toBe(1);
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

  describe('querying for string token providers', () => {
    @Directive({
      selector: '[text-token]',
      providers: [{provide: 'Token', useExisting: TextTokenDirective}],
    })
    class TextTokenDirective {
    }

    it('should match string injection token in a ViewChild query', () => {
      @Component({template: '<div text-token></div>'})
      class App {
        @ViewChild('Token') token: any;
      }

      TestBed.configureTestingModule({declarations: [App, TextTokenDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.token).toBeAnInstanceOf(TextTokenDirective);
    });

    it('should give precedence to local reference if both a reference and a string injection token provider match a ViewChild query',
       () => {
         @Component({template: '<div text-token #Token></div>'})
         class App {
           @ViewChild('Token') token: any;
         }

         TestBed.configureTestingModule({declarations: [App, TextTokenDirective]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();
         expect(fixture.componentInstance.token).toBeAnInstanceOf(ElementRef);
       });

    it('should match string injection token in a ViewChildren query', () => {
      @Component({template: '<div text-token></div>'})
      class App {
        @ViewChildren('Token') tokens!: QueryList<any>;
      }

      TestBed.configureTestingModule({declarations: [App, TextTokenDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const tokens = fixture.componentInstance.tokens;
      expect(tokens.length).toBe(1);
      expect(tokens.first).toBeAnInstanceOf(TextTokenDirective);
    });

    it('should match both string injection token and local reference inside a ViewChildren query',
       () => {
         @Component({template: '<div text-token #Token></div>'})
         class App {
           @ViewChildren('Token') tokens!: QueryList<any>;
         }

         TestBed.configureTestingModule({declarations: [App, TextTokenDirective]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(fixture.componentInstance.tokens.toArray()).toEqual([
           jasmine.any(ElementRef), jasmine.any(TextTokenDirective)
         ]);
       });

    it('should match string injection token in a ContentChild query', () => {
      @Component({selector: 'has-query', template: '<ng-content></ng-content>'})
      class HasQuery {
        @ContentChild('Token') token: any;
      }

      @Component({template: '<has-query><div text-token></div></has-query>'})
      class App {
        @ViewChild(HasQuery) queryComp!: HasQuery;
      }

      TestBed.configureTestingModule({declarations: [App, HasQuery, TextTokenDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.queryComp.token).toBeAnInstanceOf(TextTokenDirective);
    });

    it('should give precedence to local reference if both a reference and a string injection token provider match a ContentChild query',
       () => {
         @Component({selector: 'has-query', template: '<ng-content></ng-content>'})
         class HasQuery {
           @ContentChild('Token') token: any;
         }

         @Component({template: '<has-query><div text-token #Token></div></has-query>'})
         class App {
           @ViewChild(HasQuery) queryComp!: HasQuery;
         }

         TestBed.configureTestingModule({declarations: [App, HasQuery, TextTokenDirective]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(fixture.componentInstance.queryComp.token).toBeAnInstanceOf(ElementRef);
       });

    it('should match string injection token in a ContentChildren query', () => {
      @Component({selector: 'has-query', template: '<ng-content></ng-content>'})
      class HasQuery {
        @ContentChildren('Token') tokens!: QueryList<any>;
      }

      @Component({template: '<has-query><div text-token></div></has-query>'})
      class App {
        @ViewChild(HasQuery) queryComp!: HasQuery;
      }

      TestBed.configureTestingModule({declarations: [App, HasQuery, TextTokenDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const tokens = fixture.componentInstance.queryComp.tokens;
      expect(tokens.length).toBe(1);
      expect(tokens.first).toBeAnInstanceOf(TextTokenDirective);
    });

    it('should match both string injection token and local reference inside a ContentChildren query',
       () => {
         @Component({selector: 'has-query', template: '<ng-content></ng-content>'})
         class HasQuery {
           @ContentChildren('Token') tokens!: QueryList<any>;
         }

         @Component({template: '<has-query><div text-token #Token></div></has-query>'})
         class App {
           @ViewChild(HasQuery) queryComp!: HasQuery;
         }

         TestBed.configureTestingModule({declarations: [App, HasQuery, TextTokenDirective]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(fixture.componentInstance.queryComp.tokens.toArray()).toEqual([
           jasmine.any(ElementRef), jasmine.any(TextTokenDirective)
         ]);
       });

    it('should match string token specified through the `read` option of a view query', () => {
      @Component({template: '<div text-token #Token></div>'})
      class App {
        @ViewChild('Token', {read: 'Token'}) token: any;
      }

      TestBed.configureTestingModule({declarations: [App, TextTokenDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.token).toBeAnInstanceOf(TextTokenDirective);
    });

    it('should match string token specified through the `read` option of a content query', () => {
      @Component({selector: 'has-query', template: '<ng-content></ng-content>'})
      class HasQuery {
        @ContentChild('Token', {read: 'Token'}) token: any;
      }

      @Component({template: '<has-query><div text-token #Token></div></has-query>'})
      class App {
        @ViewChild(HasQuery) queryComp!: HasQuery;
      }

      TestBed.configureTestingModule({declarations: [App, HasQuery, TextTokenDirective]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.queryComp.token).toBeAnInstanceOf(TextTokenDirective);
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

@Component({
  selector: 'query-with-no-changes',
  template: `
    <query-component>
      <div *ngIf="true" #foo></div>
      <div *ngIf="showing">
        Showing me should not change the content of the query
        <div *ngIf="innerShowing" #foo></div>
      </div>
    </query-component>
  `
})
export class QueryCompWithNoChanges {
  showing: boolean = true;
  innerShowing: boolean = true;
  queryComp!: QueryCompWithStrictChangeEmitParent;
}

@Component({selector: 'query-component', template: `<ng-content></ng-content>`})
export class QueryCompWithStrictChangeEmitParent {
  @ContentChildren('foo', {
    descendants: true,
    emitDistinctChangesOnly: true,
  })
  foos!: QueryList<any>;

  constructor(public queryCompWithNoChanges: QueryCompWithNoChanges) {
    queryCompWithNoChanges.queryComp = this;
  }
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

const MY_OPTION_TOKEN = new InjectionToken<TestComponentWithToken>('ComponentWithToken');

@Component({
  selector: 'my-option',
  template: 'Option',
  providers: [{provide: MY_OPTION_TOKEN, useExisting: TestComponentWithToken}],
})
class TestComponentWithToken {
}

@Component({
  selector: 'test-injection-token',
  template: `
    <my-option></my-option>
    <my-option></my-option>
    <ng-content></ng-content>
  `
})
class TestInjectionTokenQueries {
  @ViewChild(MY_OPTION_TOKEN) viewFirstOption!: TestComponentWithToken;
  @ViewChildren(MY_OPTION_TOKEN) viewOptions!: QueryList<TestComponentWithToken>;
  @ContentChild(MY_OPTION_TOKEN) contentFirstOption!: TestComponentWithToken;
  @ContentChildren(MY_OPTION_TOKEN) contentOptions!: QueryList<TestComponentWithToken>;
}

@Component({
  template: `
    <test-injection-token>
      <my-option></my-option>
      <my-option></my-option>
    </test-injection-token>
  `
})
class TestInjectionTokenContentQueries {
}
