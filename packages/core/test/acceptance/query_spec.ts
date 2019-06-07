/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, ContentChild, ContentChildren, Directive, ElementRef, Input, QueryList, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef, forwardRef} from '@angular/core';
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
        @ViewChild('foo', {static: false}) foo: any;
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
        @ViewChild('foo', {static: false}) foo: any;
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
        @ViewChildren(SomeDir) foo !: QueryList<SomeDir>;
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
        @ViewChildren(SomeDir) foo !: QueryList<SomeDir>;
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
        @ContentChild('foo', {static: false}) foo: any;
      }

      @Component({selector: 'sub-comp', template: '<ng-content></ng-content>'})
      class SubComp extends MyComp {
      }

      @Component({template: '<sub-comp><div #foo></div></sub-comp>'})
      class App {
        @ViewChild(SubComp, {static: false}) subComp !: SubComp;
      }

      TestBed.configureTestingModule({declarations: [App, SubComp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.subComp.foo).toBeAnInstanceOf(ElementRef);
    });

    it('should support ContentChild query inherited from undecorated grand superclasses', () => {
      class MySuperComp {
        @ContentChild('foo', {static: false}) foo: any;
      }

      class MyComp extends MySuperComp {}

      @Component({selector: 'sub-comp', template: '<ng-content></ng-content>'})
      class SubComp extends MyComp {
      }

      @Component({template: '<sub-comp><div #foo></div></sub-comp>'})
      class App {
        @ViewChild(SubComp, {static: false}) subComp !: SubComp;
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
        @ContentChildren(SomeDir) foo !: QueryList<SomeDir>;
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
        @ViewChild(SubComp, {static: false}) subComp !: SubComp;
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
        @ContentChildren(SomeDir) foo !: QueryList<SomeDir>;
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
        @ViewChild(SubComp, {static: false}) subComp !: SubComp;
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
        @ContentChildren('foo', {descendants: false}) foos !: QueryList<ElementRef>;
      }

      TestBed.configureTestingModule(
          {declarations: [TestComponent, ShallowComp], imports: [CommonModule]});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const shallowComp = fixture.debugElement.query(By.directive(ShallowComp)).componentInstance;
      const queryList = shallowComp !.foos;
      expect(queryList.length).toBe(0);

      fixture.componentInstance.showing = true;
      fixture.detectChanges();
      expect(queryList.length).toBe(1);

      fixture.componentInstance.showing = false;
      fixture.detectChanges();
      expect(queryList.length).toBe(0);
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

  describe('descendants', () => {

    it('should match directives on elements that used to be wrapped by a required parent in HTML parser',
       () => {

         @Directive({selector: '[myDef]'})
         class MyDef {
         }

         @Component({selector: 'my-container', template: ``})
         class MyContainer {
           @ContentChildren(MyDef) myDefs !: QueryList<MyDef>;
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

        insertTpl(tpl: TemplateRef<{}>, ctx: {}, idx?: number) {
          this._vcRef.createEmbeddedView(tpl, ctx, idx);
        }

        remove(index?: number) { this._vcRef.remove(index); }
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
          @ViewChildren('foo') query !: QueryList<any>;
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
          @ViewChildren('foo') query !: QueryList<any>;
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

      it('should support a mix of content queries from the declaration and embedded view', () => {
        @Directive({selector: '[query-for-lots-of-content]'})
        class QueryForLotsOfContent {
          @ContentChildren('foo', {descendants: true}) foos1 !: QueryList<ElementRef>;
          @ContentChildren('foo', {descendants: true}) foos2 !: QueryList<ElementRef>;
        }

        @Directive({selector: '[query-for-content]'})
        class QueryForContent {
          @ContentChildren('foo') foos !: QueryList<ElementRef>;
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
             @ViewChild(ViewContainerManipulatorDirective, {static: false})
             vc !: ViewContainerManipulatorDirective;
             @ViewChild('tpl1', {static: false}) tpl1 !: TemplateRef<any>;
             @ViewChild('tpl2', {static: false}) tpl2 !: TemplateRef<any>;
             @ViewChildren('foo') query !: QueryList<any>;
           }

           TestBed.configureTestingModule(
               {declarations: [ViewContainerManipulatorDirective, TestComponent]});
           const fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();

           const queryList = fixture.componentInstance.query;
           const {tpl1, tpl2, vc} = fixture.componentInstance;

           expect(queryList.length).toBe(1);
           expect(queryList.first.nativeElement.getAttribute('id')).toBe('middle');

           vc.insertTpl(tpl1 !, {idx: 0}, 0);
           vc.insertTpl(tpl2 !, {idx: 1}, 1);
           fixture.detectChanges();

           expect(queryList.length).toBe(3);
           let qListArr = queryList.toArray();
           expect(qListArr[0].nativeElement.getAttribute('id')).toBe('foo1_0');
           expect(qListArr[1].nativeElement.getAttribute('id')).toBe('middle');
           expect(qListArr[2].nativeElement.getAttribute('id')).toBe('foo2_1');

           vc.insertTpl(tpl1 !, {idx: 1}, 1);
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
             @ViewChild('tpl', {static: false}) tpl !: TemplateRef<any>;
             @ViewChild('vi0', {static: false}) vi0 !: ViewContainerManipulatorDirective;
             @ViewChild('vi1', {static: false}) vi1 !: ViewContainerManipulatorDirective;
             @ViewChildren('foo') query !: QueryList<any>;
           }

           TestBed.configureTestingModule(
               {declarations: [ViewContainerManipulatorDirective, TestComponent]});
           const fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();

           const queryList = fixture.componentInstance.query;
           const {tpl, vi0, vi1} = fixture.componentInstance;

           expect(queryList.length).toBe(0);

           vi0.insertTpl(tpl !, {idx: 0, container_idx: 0}, 0);
           vi1.insertTpl(tpl !, {idx: 0, container_idx: 1}, 0);
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
          @ViewChildren('foo') query !: QueryList<any>;
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
        @ViewChildren(Child) instances !: QueryList<Child>;
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
        @ViewChildren(MyClass) queryResults !: QueryList<WithMultiProvider>;
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
        @ViewChildren(MyClass) queryResults !: QueryList<WithMultiProvider>;
      }

      TestBed.configureTestingModule({declarations: [TestCmpt, WithMultiProvider]});
      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();

      expect(fixture.componentInstance.queryResults.length).toBe(2);
      expect(fixture.componentInstance.queryResults.first).toBeAnInstanceOf(WithMultiProvider);
      expect(fixture.componentInstance.queryResults.last).toBeAnInstanceOf(WithMultiProvider);
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
  @ViewChild('viewQuery', {static: false}) viewChild !: any;
  @ContentChild('contentQuery', {static: false}) contentChild !: any;

  @ViewChildren('viewQuery') viewChildren !: QueryList<any>;
  @ContentChildren('contentQuery') contentChildren !: QueryList<any>;
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
  private _textDir !: TextDirective;
  private _foo !: ElementRef;
  setEvents: string[] = [];

  @ViewChild(TextDirective, {static: true})
  get textDir(): TextDirective { return this._textDir; }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ViewChild('foo', {static: false})
  get foo(): ElementRef { return this._foo; }

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
  @ViewChild('bar', {static: true})
  bar !: ElementRef;

  @ViewChild('baz', {static: false})
  baz !: ElementRef;
}


@Component({selector: 'static-content-query-comp', template: `<ng-content></ng-content>`})
class StaticContentQueryComp {
  private _textDir !: TextDirective;
  private _foo !: ElementRef;
  setEvents: string[] = [];

  @ContentChild(TextDirective, {static: true})
  get textDir(): TextDirective { return this._textDir; }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ContentChild('foo', {static: false})
  get foo(): ElementRef { return this._foo; }

  set foo(value: ElementRef) {
    this.setEvents.push('foo set');
    this._foo = value;
  }
}

@Directive({selector: '[staticContentQueryDir]'})
class StaticContentQueryDir {
  private _textDir !: TextDirective;
  private _foo !: ElementRef;
  setEvents: string[] = [];

  @ContentChild(TextDirective, {static: true})
  get textDir(): TextDirective { return this._textDir; }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ContentChild('foo', {static: false})
  get foo(): ElementRef { return this._foo; }

  set foo(value: ElementRef) {
    this.setEvents.push('foo set');
    this._foo = value;
  }
}

@Component({selector: 'subclass-static-content-query-comp', template: `<ng-content></ng-content>`})
class SubclassStaticContentQueryComp extends StaticContentQueryComp {
  @ContentChild('bar', {static: true})
  bar !: ElementRef;

  @ContentChild('baz', {static: false})
  baz !: ElementRef;
}

@Component({
  selector: 'query-with-changes',
  template: `
    <div *ngIf="showing" #foo></div>
  `
})
export class QueryCompWithChanges {
  @ViewChildren('foo') foos !: QueryList<any>;

  showing = false;
}

@Component({selector: 'query-target', template: '<ng-content></ng-content>'})
class SuperDirectiveQueryTarget {
}

@Directive({selector: '[super-directive]'})
class SuperDirective {
  @ViewChildren(SuperDirectiveQueryTarget) headers !: QueryList<SuperDirectiveQueryTarget>;
}

@Component({
  template: `
    <query-target>One</query-target>
    <query-target>Two</query-target>
  `
})
class SubComponent extends SuperDirective {
}
