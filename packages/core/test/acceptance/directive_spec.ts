/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  Output,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('directives', () => {
  describe('matching', () => {
    @Directive({
      selector: 'ng-template[test]',
      standalone: false,
    })
    class TestDirective {
      constructor(public templateRef: TemplateRef<any>) {}
    }

    @Directive({
      selector: '[title]',
      standalone: false,
    })
    class TitleDirective {}

    @Component({
      selector: 'test-cmpt',
      template: '',
      standalone: false,
    })
    class TestComponent {}

    it('should match directives with attribute selectors on bindings', () => {
      @Directive({
        selector: '[test]',
        standalone: false,
      })
      class TestDir {
        testValue: boolean | undefined;

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

    it('should not accidentally set inputs from attributes extracted from bindings / outputs', () => {
      @Directive({
        selector: '[test]',
        standalone: false,
      })
      class TestDir {
        @Input() prop1: boolean | undefined;
        @Input() prop2: boolean | undefined;
        testValue: boolean | undefined;

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
        `<span class="fade" [prop1]="true" [test]="false" [prop2]="true"></span>`,
      );

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
      expect(
        nodesWithDirective[0].injector.get(TestDirective).templateRef instanceof TemplateRef,
      ).toBe(true);
    });

    it('should match directives on ng-template created by * syntax', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TestDirective]});
      TestBed.overrideTemplate(TestComponent, `<div *test></div>`);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TestDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match directives on <ng-container>', () => {
      @Directive({
        selector: 'ng-container[directiveA]',
        standalone: false,
      })
      class DirectiveA {
        constructor(public viewContainerRef: ViewContainerRef) {}
      }

      @Component({
        selector: 'my-component',
        template: `
          <ng-container *ngIf="visible" directiveA>
            <span>Some content</span>
          </ng-container>`,
        standalone: false,
      })
      class MyComponent {
        visible = true;
      }

      TestBed.configureTestingModule({
        declarations: [MyComponent, DirectiveA],
        imports: [CommonModule],
      });
      const fixture = TestBed.createComponent(MyComponent);
      fixture.detectChanges();
      const directiveA = fixture.debugElement.query(By.css('span')).injector.get(DirectiveA);

      expect(directiveA.viewContainerRef).toBeTruthy();
    });

    it('should match directives on i18n-annotated attributes', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(
        TestComponent,
        `
        <div title="My title" i18n-title="Title translation description"></div>
      `,
      );

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match a mix of bound directives and classes', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(
        TestComponent,
        `
        <div class="one two" [id]="someId" [title]="title"></div>
      `,
      );

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match classes to directive selectors without case sensitivity', () => {
      @Directive({
        selector: '.Titledir',
        standalone: false,
      })
      class TitleClassDirective {}

      TestBed.configureTestingModule({declarations: [TestComponent, TitleClassDirective]});
      TestBed.overrideTemplate(
        TestComponent,
        `
        <div class="titleDir" [id]="someId"></div>
      `,
      );

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(
        By.directive(TitleClassDirective),
      );

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match class selectors on ng-template', () => {
      @Directive({
        selector: '.titleDir',
        standalone: false,
      })
      class TitleClassDirective {}

      TestBed.configureTestingModule({declarations: [TestComponent, TitleClassDirective]});
      TestBed.overrideTemplate(
        TestComponent,
        `
        <ng-template class="titleDir"></ng-template>
      `,
      );

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(
        By.directive(TitleClassDirective),
      );

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should NOT match class selectors on ng-template created by * syntax', () => {
      @Directive({
        selector: '.titleDir',
        standalone: false,
      })
      class TitleClassDirective {}

      @Component({
        selector: 'test-cmp',
        template: `<div *ngIf="condition" class="titleDir"></div>`,
        standalone: false,
      })
      class TestCmp {
        condition = false;
      }

      TestBed.configureTestingModule({declarations: [TestCmp, TitleClassDirective]});

      const fixture = TestBed.createComponent(TestCmp);

      const initialNodesWithDirective = fixture.debugElement.queryAllNodes(
        By.directive(TitleClassDirective),
      );
      expect(initialNodesWithDirective.length).toBe(0);

      fixture.componentInstance.condition = true;
      fixture.detectChanges();

      const changedNodesWithDirective = fixture.debugElement.queryAllNodes(
        By.directive(TitleClassDirective),
      );
      expect(changedNodesWithDirective.length).toBe(1);
    });

    it('should NOT match classes to directive selectors', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(
        TestComponent,
        `
        <div class="title" [id]="someId"></div>
      `,
      );

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(0);
    });

    it('should match attributes to directive selectors without case sensitivity', () => {
      @Directive({
        selector: '[title=Titledir]',
        standalone: false,
      })
      class TitleAttributeDirective {}

      TestBed.configureTestingModule({declarations: [TestComponent, TitleAttributeDirective]});
      TestBed.overrideTemplate(
        TestComponent,
        `
        <div title="titleDir" [id]="someId"></div>
      `,
      );

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(
        By.directive(TitleAttributeDirective),
      );

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match directives with attribute selectors on outputs', () => {
      @Directive({
        selector: '[out]',
        standalone: false,
      })
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

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class MyDir {
        ngOnInit() {
          calls.push('MyDir.ngOnInit');
        }
      }

      @Component({
        selector: `my-comp`,
        template: `<p [attr.dir]="direction"></p><p dir="rtl"></p>`,
        standalone: false,
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

    it('should match directives on elements with namespace', () => {
      const calls: string[] = [];

      @Directive({
        selector: 'svg[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(private el: ElementRef) {}
        ngOnInit() {
          calls.push(`MyDir.ngOnInit: ${this.el.nativeElement.tagName}`);
        }
      }

      @Component({
        selector: `my-comp`,
        template: `<svg dir><text dir></text></svg>`,
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(calls).toEqual(['MyDir.ngOnInit: svg']);
    });

    it('should match directives on descendant elements with namespace', () => {
      const calls: string[] = [];

      @Directive({
        selector: 'text[dir]',
        standalone: false,
      })
      class MyDir {
        constructor(private el: ElementRef) {}
        ngOnInit() {
          calls.push(`MyDir.ngOnInit: ${this.el.nativeElement.tagName}`);
        }
      }

      @Component({
        selector: `my-comp`,
        template: `<svg dir><text dir></text></svg>`,
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(calls).toEqual(['MyDir.ngOnInit: text']);
    });

    it('should match directives when the node has "class", "style" and a binding', () => {
      const logs: string[] = [];

      @Directive({
        selector: '[test]',
        standalone: false,
      })
      class MyDir {
        constructor() {
          logs.push('MyDir.constructor');
        }

        @Input('test') myInput = '';

        @Input('disabled') myInput2 = '';
      }

      @Component({
        // Note that below we're checking the case where the `test` attribute is after
        // one `class`, one `attribute` and one other binding.
        template: `
          <div class="a" style="font-size: 10px;" [disabled]="true" [test]="test"></div>
        `,
        standalone: false,
      })
      class MyComp {
        test = '';
      }

      TestBed.configureTestingModule({declarations: [MyComp, MyDir]});

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(logs).toEqual(['MyDir.constructor']);
    });
  });

  describe('inputs', () => {
    it('should allow directive inputs (as a prop binding) on <ng-template>', () => {
      let dirInstance: WithInput;
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class WithInput {
        constructor() {
          dirInstance = this;
        }
        @Input() dir: string = '';
      }

      @Component({
        selector: 'my-app',
        template: '<ng-template [dir]="message"></ng-template>',
        standalone: false,
      })
      class TestComp {
        message = 'Hello';
      }

      TestBed.configureTestingModule({declarations: [TestComp, WithInput]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(dirInstance!.dir).toBe('Hello');
    });

    it('should allow directive inputs (as an interpolated prop) on <ng-template>', () => {
      let dirInstance: WithInput;
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class WithInput {
        constructor() {
          dirInstance = this;
        }
        @Input() dir: string = '';
      }

      @Component({
        selector: 'my-app',
        template: '<ng-template dir="{{ message }}"></ng-template>',
        standalone: false,
      })
      class TestComp {
        message = 'Hello';
      }

      TestBed.configureTestingModule({declarations: [TestComp, WithInput]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(dirInstance!.dir).toBe('Hello');
    });

    it('should allow directive inputs (as an interpolated prop) on <ng-template> with structural directives', () => {
      let dirInstance: WithInput;
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class WithInput {
        constructor() {
          dirInstance = this;
        }
        @Input() dir: string = '';
      }

      @Component({
        selector: 'my-app',
        template: '<ng-template *ngIf="true" dir="{{ message }}"></ng-template>',
        standalone: false,
      })
      class TestComp {
        message = 'Hello';
      }

      TestBed.configureTestingModule({declarations: [TestComp, WithInput]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(dirInstance!.dir).toBe('Hello');
    });

    it('should not set structural directive inputs from static element attrs', () => {
      const dirInstances: StructuralDir[] = [];

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class StructuralDir {
        constructor() {
          dirInstances.push(this);
        }
        @Input() dirOf!: number[];
        @Input() dirUnboundInput: any;
      }

      @Component({
        template: `
          <!-- Regular form of structural directive -->
          <div *dir="let item of items" dirUnboundInput>Some content</div>

          <!-- De-sugared version of the same structural directive -->
          <ng-template dir let-item [dirOf]="items" dirUnboundInput>
            <div>Some content</div>
          </ng-template>
        `,
        standalone: false,
      })
      class App {
        items: number[] = [1, 2, 3];
      }

      TestBed.configureTestingModule({
        declarations: [App, StructuralDir],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const [regularDir, desugaredDir] = dirInstances;

      // When directive is used as a structural one, the `dirUnboundInput` should not be treated as
      // an input.
      expect(regularDir.dirUnboundInput).toBe(undefined);

      // In de-sugared version the `dirUnboundInput` acts as a regular input, so it should be set
      // to an empty string.
      expect(desugaredDir.dirUnboundInput).toBe('');
    });

    it('should not set structural directive inputs from element bindings', () => {
      const dirInstances: StructuralDir[] = [];

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class StructuralDir {
        constructor() {
          dirInstances.push(this);
        }
        @Input() dirOf!: number[];
        @Input() title: any;
      }

      @Component({
        template: `
          <!-- Regular form of structural directive -->
          <div *dir="let item of items" [title]="title">Some content</div>

          <!-- De-sugared version of the same structural directive -->
          <ng-template dir let-item [dirOf]="items" [title]="title">
            <div>Some content</div>
          </ng-template>
        `,
        standalone: false,
      })
      class App {
        items: number[] = [1, 2, 3];
        title: string = 'element title';
      }

      TestBed.configureTestingModule({
        declarations: [App, StructuralDir],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const [regularDir, desugaredDir] = dirInstances;

      // When directive is used as a structural one, the `title` should not be treated as an input.
      expect(regularDir.title).toBe(undefined);

      // In de-sugared version the `title` acts as a regular input, so it should be set.
      expect(desugaredDir.title).toBe('element title');
    });

    it('should allow directive inputs specified using the object literal syntax in @Input', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        @Input() plainInput: number | undefined;
        @Input({alias: 'alias'}) aliasedInput: number | undefined;
      }

      @Component({
        template: '<div dir [plainInput]="plainValue" [alias]="aliasedValue"></div>',
        standalone: false,
      })
      class App {
        @ViewChild(Dir) dirInstance!: Dir;
        plainValue = 123;
        aliasedValue = 321;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {dirInstance, plainValue, aliasedValue} = fixture.componentInstance;

      expect(dirInstance.plainInput).toBe(plainValue);
      expect(dirInstance.aliasedInput).toBe(aliasedValue);
    });

    it('should allow directive inputs specified using the object literal syntax in the `inputs` array', () => {
      @Directive({
        selector: '[dir]',
        inputs: [{name: 'plainInput'}, {name: 'aliasedInput', alias: 'alias'}],
        standalone: false,
      })
      class Dir {
        plainInput: number | undefined;
        aliasedInput: number | undefined;
      }

      @Component({
        template: '<div dir [plainInput]="plainValue" [alias]="aliasedValue"></div>',
        standalone: false,
      })
      class App {
        @ViewChild(Dir) dirInstance!: Dir;
        plainValue = 123;
        aliasedValue = 321;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {dirInstance, plainValue, aliasedValue} = fixture.componentInstance;

      expect(dirInstance.plainInput).toBe(plainValue);
      expect(dirInstance.aliasedInput).toBe(aliasedValue);
    });

    it('should transform incoming input values', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        @Input({transform: (value: string) => (value ? 1 : 0)}) value = -1;
      }

      @Component({
        template: '<div dir [value]="assignedValue"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(Dir) dir!: Dir;
        assignedValue = '';
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(0);

      fixture.componentInstance.assignedValue = 'hello';
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(1);
    });

    it('should transform incoming input values when declared through the `inputs` array', () => {
      @Directive({
        selector: '[dir]',
        inputs: [{name: 'value', transform: (value: string) => (value ? 1 : 0)}],
        standalone: false,
      })
      class Dir {
        value = -1;
      }

      @Component({
        template: '<div dir [value]="assignedValue"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(Dir) dir!: Dir;
        assignedValue = '';
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(0);

      fixture.componentInstance.assignedValue = 'hello';
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(1);
    });

    it('should transform incoming static input values', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        @Input({transform: (value: string) => (value ? 1 : 0)}) value = -1;
      }

      @Component({
        template: '<div dir value="staticValue"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(Dir) dir!: Dir;
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(1);
    });

    it('should transform incoming values for aliased inputs', () => {
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        @Input({alias: 'valueAlias', transform: (value: string) => (value ? 1 : 0)}) value = -1;
      }

      @Component({
        template: '<div dir [valueAlias]="assignedValue"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(Dir) dir!: Dir;
        assignedValue = '';
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(0);

      fixture.componentInstance.assignedValue = 'hello';
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(1);
    });

    it('should transform incoming inherited input values', () => {
      @Directive()
      class Parent {
        @Input({transform: (value: string) => (value ? 1 : 0)}) value = -1;
      }

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir extends Parent {}

      @Component({
        template: '<div dir [value]="assignedValue"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(Dir) dir!: Dir;
        assignedValue = '';
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(0);

      fixture.componentInstance.assignedValue = 'hello';
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe(1);
    });

    it('should transform aliased inputs coming from host directives', () => {
      @Directive({standalone: true})
      class HostDir {
        @Input({transform: (value: string) => (value ? 1 : 0)}) value = -1;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['value: valueAlias']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir [valueAlias]="assignedValue"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(HostDir) hostDir!: HostDir;
        assignedValue = '';
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.hostDir.value).toBe(0);

      fixture.componentInstance.assignedValue = 'hello';
      fixture.detectChanges();

      expect(fixture.componentInstance.hostDir.value).toBe(1);
    });

    it('should use the transformed input values in ngOnChanges', () => {
      const trackedChanges: SimpleChange[] = [];

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir implements OnChanges {
        @Input({transform: (value: string) => (value ? 1 : 0)}) value = -1;

        ngOnChanges(changes: SimpleChanges): void {
          if (changes['value']) {
            trackedChanges.push(changes['value']);
          }
        }
      }

      @Component({
        template: '<div dir [value]="assignedValue"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(Dir) dir!: Dir;
        assignedValue = '';
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(trackedChanges).toEqual([
        jasmine.objectContaining({previousValue: undefined, currentValue: 0}),
      ]);

      fixture.componentInstance.assignedValue = 'hello';
      fixture.detectChanges();

      expect(trackedChanges).toEqual([
        jasmine.objectContaining({previousValue: undefined, currentValue: 0}),
        jasmine.objectContaining({previousValue: 0, currentValue: 1}),
      ]);
    });

    it('should invoke the transform function with the directive instance as the context', () => {
      let instance: Dir | undefined;

      function transform(this: Dir, _value: string) {
        instance = this;
        return 0;
      }

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        @Input({transform}) value: any;
      }

      @Component({
        template: '<div dir value="foo"></div>',
        standalone: false,
      })
      class TestComp {
        @ViewChild(Dir) dir!: Dir;
      }

      TestBed.configureTestingModule({declarations: [TestComp, Dir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(instance).toBe(fixture.componentInstance.dir);
    });

    it('should transform value assigned using setInput', () => {
      @Component({
        selector: 'comp',
        template: '',
        standalone: false,
      })
      class Comp {
        @Input({transform: (value: string) => (value ? 1 : 0)}) value = -1;
      }

      @Component({
        template: '<ng-container #location/>',
        standalone: false,
      })
      class TestComp {
        @ViewChild('location', {read: ViewContainerRef}) vcr!: ViewContainerRef;
      }

      TestBed.configureTestingModule({declarations: [TestComp, Comp]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      const ref = fixture.componentInstance.vcr.createComponent(Comp);

      ref.setInput('value', '');
      expect(ref.instance.value).toBe(0);

      ref.setInput('value', 'hello');
      expect(ref.instance.value).toBe(1);
    });
  });

  describe('outputs', () => {
    @Directive({
      selector: '[out]',
      standalone: false,
    })
    class TestDir {
      @Output() out = new EventEmitter();
    }

    it('should allow outputs of directive on ng-template', () => {
      @Component({
        template: `<ng-template (out)="value = true"></ng-template>`,
        standalone: false,
      })
      class TestComp {
        @ViewChild(TestDir, {static: true}) testDir: TestDir | undefined;
        value = false;
      }

      TestBed.configureTestingModule({declarations: [TestComp, TestDir]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.testDir).toBeTruthy();
      expect(fixture.componentInstance.value).toBe(false);

      fixture.componentInstance.testDir!.out.emit();
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe(true);
    });

    it('should allow outputs of directive on ng-container', () => {
      @Component({
        template: `
          <ng-container (out)="value = true">
            <span>Hello</span>
          </ng-container>`,
        standalone: false,
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
      standalone: false,
    })
    class DirWithTitle {
      @Input() title = '';
    }

    it('should set both the div attribute and the directive input for `title="value"`', () => {
      @Component({
        template: `<div dir-with-title title="a"></div>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('title')).toBe('a');
    });

    it('should set the directive input only, shadowing the title property of the div, for `[title]="value"`', () => {
      @Component({
        template: `<div dir-with-title [title]="value"></div>`,
        standalone: false,
      })
      class App {
        value = 'a';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      // We are checking the property here, not the attribute, because in the case of
      // [key]="value" we are always setting the property of the instance, and actually setting
      // the attribute is just a side-effect of the DOM implementation.
      expect(dirWithTitle.title).toBe('a');
      expect(div.title).toBe('');
    });

    it('should allow setting directive `title` input with `[title]="value"` and a "attr.title" attribute with `attr.title="test"`', () => {
      @Component({
        template: `<div dir-with-title [title]="value" attr.title="test"></div>`,
        standalone: false,
      })
      class App {
        value = 'a';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('attr.title')).toBe('test');
      expect(div.title).toBe('');
    });

    it('should allow setting directive `title` input with `[title]="value1"` and attribute with `[attr.title]="value2"`', () => {
      @Component({
        template: `<div dir-with-title [title]="value1" [attr.title]="value2"></div>`,
        standalone: false,
      })
      class App {
        value1 = 'a';
        value2 = 'b';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('title')).toBe('b');
    });

    it('should allow setting directive `title` input with `[title]="value1"` and attribute with `attr.title="{{value2}}"`', () => {
      @Component({
        template: `<div dir-with-title [title]="value1" attr.title="{{value2}}"></div>`,
        standalone: false,
      })
      class App {
        value1 = 'a';
        value2 = 'b';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('title')).toBe('b');
    });

    it('should allow setting directive `title` input with `title="{{value}}"` and a "attr.title" attribute with `attr.title="test"`', () => {
      @Component({
        template: `<div dir-with-title title="{{value}}" attr.title="test"></div>`,
        standalone: false,
      })
      class App {
        value = 'a';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('attr.title')).toBe('test');
      expect(div.title).toBe('');
    });

    it('should allow setting directive `title` input with `title="{{value1}}"` and attribute with `[attr.title]="value2"`', () => {
      @Component({
        template: `<div dir-with-title title="{{value1}}" [attr.title]="value2"></div>`,
        standalone: false,
      })
      class App {
        value1 = 'a';
        value2 = 'b';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('title')).toBe('b');
    });

    it('should allow setting directive `title` input with `title="{{value1}}"` and attribute with `attr.title="{{value2}}"`', () => {
      @Component({
        template: `<div dir-with-title title="{{value1}}" attr.title="{{value2}}"></div>`,
        standalone: false,
      })
      class App {
        value1 = 'a';
        value2 = 'b';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.getAttribute('title')).toBe('b');
    });

    it('should set the directive input only, shadowing the title property on the div, for `title="{{value}}"`', () => {
      @Component({
        template: `<div dir-with-title title="{{value}}"></div>`,
        standalone: false,
      })
      class App {
        value = 'a';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('a');
      expect(div.title).toBe('');
    });

    it('should set the title attribute only, not directive input, for `attr.title="{{value}}"`', () => {
      @Component({
        template: `<div dir-with-title attr.title="{{value}}"></div>`,
        standalone: false,
      })
      class App {
        value = 'a';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('');
      expect(div.getAttribute('title')).toBe('a');
    });

    it('should set the title attribute only, not directive input, for `[attr.title]="value"`', () => {
      @Component({
        template: `<div dir-with-title [attr.title]="value"></div>`,
        standalone: false,
      })
      class App {
        value = 'a';
      }

      TestBed.configureTestingModule({
        declarations: [App, DirWithTitle],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirWithTitle = fixture.debugElement
        .query(By.directive(DirWithTitle))
        .injector.get(DirWithTitle);
      const div = fixture.nativeElement.querySelector('div');
      expect(dirWithTitle.title).toBe('');
      expect(div.getAttribute('title')).toBe('a');
    });
  });

  describe('directives with the same selector', () => {
    it('should process Directives from `declarations` list after imported ones', () => {
      const log: string[] = [];
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class DirectiveA {
        constructor() {
          log.push('DirectiveA.constructor');
        }
        ngOnInit() {
          log.push('DirectiveA.ngOnInit');
        }
      }

      @NgModule({
        declarations: [DirectiveA],
        exports: [DirectiveA],
      })
      class ModuleA {}

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class DirectiveB {
        constructor() {
          log.push('DirectiveB.constructor');
        }
        ngOnInit() {
          log.push('DirectiveB.ngOnInit');
        }
      }

      @Component({
        selector: 'app',
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({
        imports: [ModuleA],
        declarations: [DirectiveB, App],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual([
        'DirectiveA.constructor',
        'DirectiveB.constructor',
        'DirectiveA.ngOnInit',
        'DirectiveB.ngOnInit',
      ]);
    });

    it('should respect imported module order', () => {
      const log: string[] = [];
      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class DirectiveA {
        constructor() {
          log.push('DirectiveA.constructor');
        }
        ngOnInit() {
          log.push('DirectiveA.ngOnInit');
        }
      }

      @NgModule({
        declarations: [DirectiveA],
        exports: [DirectiveA],
      })
      class ModuleA {}

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class DirectiveB {
        constructor() {
          log.push('DirectiveB.constructor');
        }
        ngOnInit() {
          log.push('DirectiveB.ngOnInit');
        }
      }

      @NgModule({
        declarations: [DirectiveB],
        exports: [DirectiveB],
      })
      class ModuleB {}

      @Component({
        selector: 'app',
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({
        imports: [ModuleA, ModuleB],
        declarations: [App],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual([
        'DirectiveA.constructor',
        'DirectiveB.constructor',
        'DirectiveA.ngOnInit',
        'DirectiveB.ngOnInit',
      ]);
    });
  });
});
