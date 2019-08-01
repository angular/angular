/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, Directive, EventEmitter, Output, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {Input} from '@angular/core/src/metadata';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('directives', () => {

  describe('matching', () => {

    @Directive({selector: 'ng-template[test]'})
    class TestDirective {
      constructor(public templateRef: TemplateRef<any>) {}
    }

    @Directive({selector: '[title]'})
    class TitleDirective {
    }

    @Component({selector: 'test-cmpt', template: ''})
    class TestComponent {
    }

    it('should match directives with attribute selectors on bindings', () => {
      @Directive({selector: '[test]'})
      class TestDir {
        testValue: boolean|undefined;

        /** Setter to assert that a binding is not invoked with stringified attribute value */
        @Input()
        set test(value: any) {
          // Assert that the binding is processed correctly. The property should be set
          // to a "false" boolean and never to the "false" string literal.
          this.testValue = value;
          if (value !== false) {
            fail('Should only be called with a false Boolean value, got a non-falsy value');
          }
        }
      }

      TestBed.configureTestingModule({declarations: [TestComponent, TestDir]});
      TestBed.overrideTemplate(TestComponent, `<span class="fade" [test]="false"></span>`);

      const fixture = TestBed.createComponent(TestComponent);
      const testDir = fixture.debugElement.query(By.directive(TestDir)).injector.get(TestDir);
      const spanEl = fixture.nativeElement.children[0];
      fixture.detectChanges();

      // the "test" attribute should not be reflected in the DOM as it is here only
      // for directive matching purposes
      expect(spanEl.hasAttribute('test')).toBe(false);
      expect(spanEl.getAttribute('class')).toBe('fade');
      expect(testDir.testValue).toBe(false);
    });

    it('should not accidentally set inputs from attributes extracted from bindings / outputs',
       () => {
         @Directive({selector: '[test]'})
         class TestDir {
           @Input() prop1: boolean|undefined;
           @Input() prop2: boolean|undefined;
           testValue: boolean|undefined;

           /** Setter to assert that a binding is not invoked with stringified attribute value */
           @Input()
           set test(value: any) {
             // Assert that the binding is processed correctly. The property should be set
             // to a "false" boolean and never to the "false" string literal.
             this.testValue = value;
             if (value !== false) {
               fail('Should only be called with a false Boolean value, got a non-falsy value');
             }
           }
         }

         TestBed.configureTestingModule({declarations: [TestComponent, TestDir]});
         TestBed.overrideTemplate(
             TestComponent,
             `<span class="fade" [prop1]="true" [test]="false" [prop2]="true"></span>`);

         const fixture = TestBed.createComponent(TestComponent);
         const testDir = fixture.debugElement.query(By.directive(TestDir)).injector.get(TestDir);
         const spanEl = fixture.nativeElement.children[0];
         fixture.detectChanges();

         // the "test" attribute should not be reflected in the DOM as it is here only
         // for directive matching purposes
         expect(spanEl.hasAttribute('test')).toBe(false);
         expect(spanEl.hasAttribute('prop1')).toBe(false);
         expect(spanEl.hasAttribute('prop2')).toBe(false);
         expect(spanEl.getAttribute('class')).toBe('fade');
         expect(testDir.testValue).toBe(false);
       });

    it('should match directives on ng-template', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TestDirective]});
      TestBed.overrideTemplate(TestComponent, `<ng-template test></ng-template>`);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TestDirective));

      expect(nodesWithDirective.length).toBe(1);
      expect(nodesWithDirective[0].injector.get(TestDirective).templateRef instanceof TemplateRef)
          .toBe(true);
    });

    it('should match directives on ng-template created by * syntax', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TestDirective]});
      TestBed.overrideTemplate(TestComponent, `<div *test></div>`);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TestDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match directives on <ng-container>', () => {
      @Directive({selector: 'ng-container[directiveA]'})
      class DirectiveA {
        constructor(public viewContainerRef: ViewContainerRef) {}
      }

      @Component({
        selector: 'my-component',
        template: `
          <ng-container *ngIf="visible" directiveA>
            <span>Some content</span>
          </ng-container>`
      })
      class MyComponent {
        visible = true;
      }

      TestBed.configureTestingModule(
          {declarations: [MyComponent, DirectiveA], imports: [CommonModule]});
      const fixture = TestBed.createComponent(MyComponent);
      fixture.detectChanges();
      const directiveA = fixture.debugElement.query(By.css('span')).injector.get(DirectiveA);

      expect(directiveA.viewContainerRef).toBeTruthy();
    });

    it('should match directives on i18n-annotated attributes', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(TestComponent, `
        <div title="My title" i18n-title="Title translation description"></div>
      `);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match a mix of bound directives and classes', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(TestComponent, `
        <div class="one two" [id]="someId" [title]="title"></div>
      `);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should NOT match classes to directive selectors', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(TestComponent, `
        <div class="title" [id]="someId"></div>
      `);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(0);
    });

    it('should match directives with attribute selectors on outputs', () => {
      @Directive({selector: '[out]'})
      class TestDir {
        @Output() out = new EventEmitter();
      }

      TestBed.configureTestingModule({declarations: [TestComponent, TestDir]});
      TestBed.overrideTemplate(TestComponent, `<span class="span" (out)="someVar = true"></span>`);

      const fixture = TestBed.createComponent(TestComponent);
      const spanEl = fixture.nativeElement.children[0];

      // "out" should not be part of reflected attributes
      expect(spanEl.hasAttribute('out')).toBe(false);
      expect(spanEl.getAttribute('class')).toBe('span');
      expect(fixture.debugElement.query(By.directive(TestDir))).toBeTruthy();
    });

    it('should not match directives based on attribute bindings', () => {
      const calls: string[] = [];

      @Directive({selector: '[dir]'})
      class MyDir {
        ngOnInit() { calls.push('MyDir.ngOnInit'); }
      }

      @Component({
        selector: `my-comp`,
        template: `<p [attr.dir]="direction"></p><p dir="rtl"></p>`,
      })
      class MyComp {
        direction = 'auto';
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      // Expect only one directive to be instantiated.
      expect(calls).toEqual(['MyDir.ngOnInit']);
    });

    it('should match directives when the node has "class", "style" and a binding', () => {
      const logs: string[] = [];

      @Directive({selector: '[test]'})
      class MyDir {
        constructor() { logs.push('MyDir.contructor'); }

        @Input('test')
        myInput = '';

        @Input('disabled')
        myInput2 = '';
      }

      @Component({
        // Note that below we're checking the case where the `test` attribute is after
        // one `class`, one `attribute` and one other binding.
        template: `
          <div class="a" style="font-size: 10px;" [disabled]="true" [test]="test"></div>
        `
      })
      class MyComp {
        test = '';
      }

      TestBed.configureTestingModule({declarations: [MyComp, MyDir]});

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(logs).toEqual(['MyDir.contructor']);
    });

  });

  describe('outputs', () => {
    @Directive({selector: '[out]'})
    class TestDir {
      @Output() out = new EventEmitter();
    }

    it('should allow outputs of directive on ng-template', () => {
      @Component({template: `<ng-template (out)="value = true"></ng-template>`})
      class TestComp {
        @ViewChild(TestDir, {static: true}) testDir: TestDir|undefined;
        value = false;
      }

      TestBed.configureTestingModule({declarations: [TestComp, TestDir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.testDir).toBeTruthy();
      expect(fixture.componentInstance.value).toBe(false);

      fixture.componentInstance.testDir !.out.emit();
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe(true);
    });

    it('should allow outputs of directive on ng-container', () => {
      @Component({
        template: `
          <ng-container (out)="value = true">
            <span>Hello</span>
          </ng-container>`
      })
      class TestComp {
        value = false;
      }

      TestBed.configureTestingModule({declarations: [TestComp, TestDir]});
      const fixture = TestBed.createComponent(TestComp);
      const testDir = fixture.debugElement.query(By.css('span')).injector.get(TestDir);

      expect(fixture.componentInstance.value).toBe(false);

      testDir.out.emit();
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBeTruthy();
    });

  });

  describe('attribute shadowing behaviors', () => {
    /**
     * To match ViewEngine, we need to ensure the following behaviors
     */

    @Directive({
      selector: '[dir-with-title]',
    })
    class DirWithTitle {
      @Input()
      title = '';
    }

    it('should set both the div attribute and the directive input for `title="value"`', () => {
      @Component({template: `<div dir-with-title title="a"></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle =
          fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('title')).toBe('a');
    });

    it('should set the directive input only, shadowing the title property of the div, for `[title]="value"`',
       () => {
         @Component({template: `<div dir-with-title [title]="value"></div>`})
         class App {
           value = 'a';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         // We are checking the property here, not the attribute, because in the case of
         // [key]="value" we are always setting the property of the instance, and actually setting
         // the attribute is just a side-effect of the DOM implementation.
         expect(dirWithTitle.title).toBe('a');
         expect(div.title).toBe('');
       });

    it('should allow setting directive `title` input with `[title]="value"` and a "attr.title" attribute with `attr.title="test"`',
       () => {
         @Component({template: `<div dir-with-title [title]="value" attr.title="test"></div>`})
         class App {
           value = 'a';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('a');
         expect(div.getAttribute('attr.title')).toBe('test');
         expect(div.title).toBe('');
       });

    it('should allow setting directive `title` input with `[title]="value1"` and attribute with `[attr.title]="value2"`',
       () => {
         @Component({template: `<div dir-with-title [title]="value1" [attr.title]="value2"></div>`})
         class App {
           value1 = 'a';
           value2 = 'b';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('a');
         expect(div.getAttribute('title')).toBe('b');
       });

    it('should allow setting directive `title` input with `[title]="value1"` and attribute with `attr.title="{{value2}}"`',
       () => {
         @Component(
             {template: `<div dir-with-title [title]="value1" attr.title="{{value2}}"></div>`})
         class App {
           value1 = 'a';
           value2 = 'b';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('a');
         expect(div.getAttribute('title')).toBe('b');
       });

    it('should allow setting directive `title` input with `title="{{value}}"` and a "attr.title" attribute with `attr.title="test"`',
       () => {
         @Component({template: `<div dir-with-title title="{{value}}" attr.title="test"></div>`})
         class App {
           value = 'a';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('a');
         expect(div.getAttribute('attr.title')).toBe('test');
         expect(div.title).toBe('');
       });

    it('should allow setting directive `title` input with `title="{{value1}}"` and attribute with `[attr.title]="value2"`',
       () => {
         @Component(
             {template: `<div dir-with-title title="{{value1}}" [attr.title]="value2"></div>`})
         class App {
           value1 = 'a';
           value2 = 'b';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('a');
         expect(div.getAttribute('title')).toBe('b');
       });

    it('should allow setting directive `title` input with `title="{{value1}}"` and attribute with `attr.title="{{value2}}"`',
       () => {
         @Component(
             {template: `<div dir-with-title title="{{value1}}" attr.title="{{value2}}"></div>`})
         class App {
           value1 = 'a';
           value2 = 'b';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('a');
         expect(div.getAttribute('title')).toBe('b');
       });

    it('should set the directive input only, shadowing the title property on the div, for `title="{{value}}"`',
       () => {
         @Component({template: `<div dir-with-title title="{{value}}"></div>`})
         class App {
           value = 'a';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('a');
         expect(div.title).toBe('');
       });

    it('should set the title attribute only, not directive input, for `attr.title="{{value}}"`',
       () => {
         @Component({template: `<div dir-with-title attr.title="{{value}}"></div>`})
         class App {
           value = 'a';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('');
         expect(div.getAttribute('title')).toBe('a');
       });

    it('should set the title attribute only, not directive input, for `[attr.title]="value"`',
       () => {
         @Component({template: `<div dir-with-title [attr.title]="value"></div>`})
         class App {
           value = 'a';
         }

         TestBed.configureTestingModule({
           declarations: [App, DirWithTitle],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirWithTitle =
             fixture.debugElement.query(By.directive(DirWithTitle)).injector.get(DirWithTitle);
         const div = fixture.nativeElement.querySelector('div');
         expect(dirWithTitle.title).toBe('');
         expect(div.getAttribute('title')).toBe('a');
       });
  });
});
