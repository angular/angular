/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Directive,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Input,
  provideZoneChangeDetection,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewRef,
} from '../../src/core';
import {TestBed} from '../../testing';
import {By} from '@angular/platform-browser';

describe('view insertion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  describe('of a simple template', () => {
    it('should insert into an empty container, at the front, in the middle, and at the end', () => {
      let _counter = 0;

      @Component({
        selector: 'increment-comp',
        template: `<span>created{{counter}}</span>`,
        standalone: false,
      })
      class IncrementComp {
        counter = _counter++;
      }

      @Component({
        template: `
              <ng-template #simple><increment-comp></increment-comp></ng-template>
              <div #container></div>
            `,
        standalone: false,
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef, static: true})
        container: ViewContainerRef = null!;

        @ViewChild('simple', {read: TemplateRef, static: true}) simple: TemplateRef<any> = null!;

        view0: EmbeddedViewRef<any> = null!;
        view1: EmbeddedViewRef<any> = null!;
        view2: EmbeddedViewRef<any> = null!;
        view3: EmbeddedViewRef<any> = null!;

        constructor(public changeDetector: ChangeDetectorRef) {}

        ngAfterViewInit() {
          // insert at the front
          this.view1 = this.container.createEmbeddedView(this.simple); // "created0"

          // insert at the front again
          this.view0 = this.container.createEmbeddedView(this.simple, {}, 0); // "created1"

          // insert at the end
          this.view3 = this.container.createEmbeddedView(this.simple); // "created2"

          // insert in the middle
          this.view2 = this.container.createEmbeddedView(this.simple, {}, 2); // "created3"

          // We need to run change detection here to avoid
          // ExpressionChangedAfterItHasBeenCheckedError because of the value updating in
          // increment-comp
          this.changeDetector.detectChanges();
        }
      }

      TestBed.configureTestingModule({
        declarations: [App, IncrementComp],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const app = fixture.componentInstance;

      expect(app.container.indexOf(app.view0)).toBe(0);
      expect(app.container.indexOf(app.view1)).toBe(1);
      expect(app.container.indexOf(app.view2)).toBe(2);
      expect(app.container.indexOf(app.view3)).toBe(3);
      // The text in each component differs based on *when* it was created.
      expect(fixture.nativeElement.textContent).toBe('created1created0created3created2');
    });
  });

  describe('of an empty template', () => {
    it('should insert into an empty container, at the front, in the middle, and at the end', () => {
      @Component({
        template: `
              <ng-template #empty></ng-template>
              <div #container></div>
            `,
        standalone: false,
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef = null!;

        @ViewChild('empty', {read: TemplateRef}) empty: TemplateRef<any> = null!;

        view0: EmbeddedViewRef<any> = null!;
        view1: EmbeddedViewRef<any> = null!;
        view2: EmbeddedViewRef<any> = null!;
        view3: EmbeddedViewRef<any> = null!;

        ngAfterViewInit() {
          // insert at the front
          this.view1 = this.container.createEmbeddedView(this.empty);

          // insert at the front again
          this.view0 = this.container.createEmbeddedView(this.empty, {}, 0);

          // insert at the end
          this.view3 = this.container.createEmbeddedView(this.empty);

          // insert in the middle
          this.view2 = this.container.createEmbeddedView(this.empty, {}, 2);
        }
      }

      TestBed.configureTestingModule({
        declarations: [App],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const app = fixture.componentInstance;

      expect(app.container.indexOf(app.view0)).toBe(0);
      expect(app.container.indexOf(app.view1)).toBe(1);
      expect(app.container.indexOf(app.view2)).toBe(2);
      expect(app.container.indexOf(app.view3)).toBe(3);
    });
  });

  describe('of an ng-content projection', () => {
    it('should insert into an empty container, at the front, in the middle, and at the end', () => {
      @Component({
        selector: 'comp',
        template: `
                  <ng-template #projection><ng-content></ng-content></ng-template>
                  <div #container></div>
                `,
        standalone: false,
      })
      class Comp {
        @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef = null!;

        @ViewChild('projection', {read: TemplateRef}) projection: TemplateRef<any> = null!;

        view0: EmbeddedViewRef<any> = null!;
        view1: EmbeddedViewRef<any> = null!;
        view2: EmbeddedViewRef<any> = null!;
        view3: EmbeddedViewRef<any> = null!;

        ngAfterViewInit() {
          // insert at the front
          this.view1 = this.container.createEmbeddedView(this.projection);

          // insert at the front again
          this.view0 = this.container.createEmbeddedView(this.projection, {}, 0);

          // insert at the end
          this.view3 = this.container.createEmbeddedView(this.projection);

          // insert in the middle
          this.view2 = this.container.createEmbeddedView(this.projection, {}, 2);
        }
      }

      @Component({
        template: `
          <comp>test</comp>
        `,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({
        declarations: [App, Comp],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const comp = fixture.debugElement.query(By.directive(Comp)).injector.get(Comp);

      expect(comp.container.indexOf(comp.view0)).toBe(0);
      expect(comp.container.indexOf(comp.view1)).toBe(1);
      expect(comp.container.indexOf(comp.view2)).toBe(2);
      expect(comp.container.indexOf(comp.view3)).toBe(3);

      // Both ViewEngine and Ivy only honor one of the inserted ng-content components, even though
      // all are inserted.
      expect(fixture.nativeElement.textContent).toBe('test');
    });
  });

  describe('of another container like ngIf', () => {
    it('should insert into an empty container, at the front, in the middle, and at the end', () => {
      @Component({
        template: `
                  <ng-template #subContainer><div class="dynamic" *ngIf="true">test</div></ng-template>
                  <div #container></div>
                `,
        standalone: false,
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef = null!;

        @ViewChild('subContainer', {read: TemplateRef}) subContainer: TemplateRef<any> = null!;

        view0: EmbeddedViewRef<any> = null!;
        view1: EmbeddedViewRef<any> = null!;
        view2: EmbeddedViewRef<any> = null!;
        view3: EmbeddedViewRef<any> = null!;

        constructor(public changeDetectorRef: ChangeDetectorRef) {}

        ngAfterViewInit() {
          // insert at the front
          this.view1 = this.container.createEmbeddedView(this.subContainer, null, 0);

          // insert at the front again
          this.view0 = this.container.createEmbeddedView(this.subContainer, null, 0);

          // insert at the end
          this.view3 = this.container.createEmbeddedView(this.subContainer, null, 2);

          // insert in the middle
          this.view2 = this.container.createEmbeddedView(this.subContainer, null, 2);

          // We need to run change detection here to avoid
          // ExpressionChangedAfterItHasBeenCheckedError because of the value getting passed to ngIf
          // in the template.
          this.changeDetectorRef.detectChanges();
        }
      }

      TestBed.configureTestingModule({
        declarations: [App],
        imports: [CommonModule],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const app = fixture.componentInstance;

      expect(app.container.indexOf(app.view0)).toBe(0);
      expect(app.container.indexOf(app.view1)).toBe(1);
      expect(app.container.indexOf(app.view2)).toBe(2);
      expect(app.container.indexOf(app.view3)).toBe(3);

      expect(fixture.debugElement.queryAll(By.css('div.dynamic')).length).toBe(4);
    });
  });

  describe('before another view', () => {
    @Directive({
      selector: '[viewInserting]',
      exportAs: 'vi',
      standalone: false,
    })
    class ViewInsertingDir {
      constructor(private _vcRef: ViewContainerRef) {}

      insert(beforeView: ViewRef, insertTpl: TemplateRef<{}>) {
        this._vcRef.insert(beforeView, 0);
        this._vcRef.createEmbeddedView(insertTpl, {}, 0);
      }
    }

    describe('before embedded view', () => {
      @Component({
        selector: 'test-cmpt',
        template: '',
        standalone: false,
      })
      class TestCmpt {
        @ViewChild('before', {static: true}) beforeTpl!: TemplateRef<{}>;
        @ViewChild('insert', {static: true}) insertTpl!: TemplateRef<{}>;
        @ViewChild('vi', {static: true}) viewInsertingDir!: ViewInsertingDir;

        minutes = 10;

        insert() {
          const beforeView = this.beforeTpl.createEmbeddedView({});
          // change-detect the "before view" to create all child views
          beforeView.detectChanges();
          this.viewInsertingDir.insert(beforeView, this.insertTpl);
        }
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [TestCmpt, ViewInsertingDir],
          imports: [CommonModule],
        });
      });

      function createAndInsertViews(beforeTpl: string): any {
        TestBed.overrideTemplate(
          TestCmpt,
          `
          <ng-template #insert>insert</ng-template>
          <ng-template #before>${beforeTpl}</ng-template>

          <div><ng-template #vi="vi" viewInserting></ng-template></div>
        `,
        );
        const fixture = TestBed.createComponent(TestCmpt);
        fixture.detectChanges();

        fixture.componentInstance.insert();
        fixture.detectChanges();

        return fixture.nativeElement;
      }

      it('should insert before a view with the text node as the first root node', () => {
        expect(createAndInsertViews('|before').textContent).toBe('insert|before');
      });

      it('should insert before a view with the element as the first root node', () => {
        expect(createAndInsertViews('<span>|before</span>').textContent).toBe('insert|before');
      });

      it('should insert before a view with the ng-container as the first root node', () => {
        expect(
          createAndInsertViews(`
          <ng-container>
            <ng-container>|before</ng-container>
          </ng-container>
        `).textContent,
        ).toBe('insert|before');
      });

      it('should insert before a view with the empty ng-container as the first root node', () => {
        expect(createAndInsertViews(`<ng-container></ng-container>|before`).textContent).toBe(
          'insert|before',
        );
      });

      it('should insert before a view with ICU container inside a ng-container as the first root node', () => {
        expect(
          createAndInsertViews(
            `<ng-container i18n>{minutes, plural, =0 {just now} =1 {one minute ago} other {|before}}</ng-container>`,
          ).textContent,
        ).toBe('insert|before');
      });

      it('should insert before a view with a container as the first root node', () => {
        expect(
          createAndInsertViews(`<ng-template [ngIf]="true">|before</ng-template>`).textContent,
        ).toBe('insert|before');
      });

      it('should insert before a view with an empty container as the first root node', () => {
        expect(
          createAndInsertViews(`<ng-template [ngIf]="true"></ng-template>|before`).textContent,
        ).toBe('insert|before');
      });

      it('should insert before a view with a ng-container where ViewContainerRef is injected', () => {
        expect(
          createAndInsertViews(`
          <ng-container [ngTemplateOutlet]="after">|before</ng-container>
          <ng-template #after>|after</ng-template>
        `).textContent,
        ).toBe('insert|before|after');
      });

      it('should insert before a view with an element where ViewContainerRef is injected', () => {
        expect(
          createAndInsertViews(`
          <div [ngTemplateOutlet]="after">|before</div>
          <ng-template #after>|after</ng-template>
        `).textContent,
        ).toBe('insert|before|after');
      });

      it('should insert before a view with an empty projection as the first root node', () => {
        expect(createAndInsertViews(`<ng-content></ng-content>|before`).textContent).toBe(
          'insert|before',
        );
      });

      it('should insert before a view with complex node structure', () => {
        expect(
          createAndInsertViews(`
          <ng-template [ngIf]="true">
            <ng-container>
              <ng-container>
                <ng-template [ngIf]="true">|before</ng-template>
              </ng-container>
            </ng-container>
          </ng-template>
        `).textContent,
        ).toBe('insert|before');
      });

      it('should insert before a ng-container with a ViewContainerRef on it', () => {
        @Component({
          selector: 'app-root',
          template: `
            <div>start|</div>
            <ng-container [ngTemplateOutlet]="insertTpl ? tpl : null"></ng-container>
            <ng-container [ngTemplateOutlet]="tpl"></ng-container>
            <div>|end</div>

            <ng-template #tpl>test</ng-template>
          `,
          standalone: false,
        })
        class AppComponent {
          insertTpl = false;
        }

        TestBed.configureTestingModule({
          declarations: [AppComponent],
          imports: [CommonModule],
        });

        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('start|test|end');

        fixture.componentInstance.insertTpl = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('start|testtest|end');
      });
    });

    describe('before embedded view with projection', () => {
      @Component({
        selector: 'with-content',
        template: `
          <ng-template #insert>insert</ng-template>
          <ng-template #before><ng-content></ng-content></ng-template>
          <div><ng-template #vi="vi" viewInserting></ng-template></div>
        `,
        standalone: false,
      })
      class WithContentCmpt {
        @ViewChild('insert', {static: true}) insertTpl!: TemplateRef<{}>;
        @ViewChild('before', {static: true}) beforeTpl!: TemplateRef<{}>;
        @ViewChild('vi', {static: true}) viewInsertingDir!: ViewInsertingDir;

        insert() {
          const beforeView = this.beforeTpl.createEmbeddedView({});
          // change-detect the "before view" to create all child views
          beforeView.detectChanges();
          this.viewInsertingDir.insert(beforeView, this.insertTpl);
        }
      }

      @Component({
        selector: 'test-cmpt',
        template: '',
        standalone: false,
      })
      class TestCmpt {
        @ViewChild('wc', {static: true}) withContentCmpt!: WithContentCmpt;
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [ViewInsertingDir, WithContentCmpt, TestCmpt],
          imports: [CommonModule],
        });
      });

      it('should insert before a view with projected text nodes', () => {
        TestBed.overrideTemplate(TestCmpt, `<with-content #wc>|before</with-content>`);
        const fixture = TestBed.createComponent(TestCmpt);
        fixture.detectChanges();

        fixture.componentInstance.withContentCmpt.insert();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('insert|before');
      });

      it('should insert before a view with projected container', () => {
        TestBed.overrideTemplate(
          TestCmpt,
          `<with-content #wc><ng-template [ngIf]="true">|before</ng-template></with-content>`,
        );

        const fixture = TestBed.createComponent(TestCmpt);
        fixture.detectChanges();

        fixture.componentInstance.withContentCmpt.insert();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('insert|before');
      });
    });

    describe('before component view', () => {
      @Directive({
        selector: '[viewInserting]',
        exportAs: 'vi',
        standalone: false,
      })
      class ViewInsertingDir {
        constructor(private _vcRef: ViewContainerRef) {}

        insert(beforeView: ViewRef, insertTpl: TemplateRef<{}>) {
          this._vcRef.insert(beforeView, 0);
          this._vcRef.createEmbeddedView(insertTpl, {}, 0);
        }
      }

      @Component({
        selector: 'dynamic-cmpt',
        template: '|before',
        standalone: false,
      })
      class DynamicComponent {}

      it('should insert in front a dynamic component view', () => {
        @Component({
          selector: 'test-cmpt',
          template: `
                <ng-template #insert>insert</ng-template>
                <div><ng-template #vi="vi" viewInserting></ng-template></div>
              `,
          standalone: false,
        })
        class TestCmpt {
          @ViewChild('insert', {static: true}) insertTpl!: TemplateRef<{}>;
          @ViewChild('vi', {static: true}) viewInsertingDir!: ViewInsertingDir;

          constructor(
            private _vcr: ViewContainerRef,
            private _injector: Injector,
          ) {}

          insert() {
            // create a dynamic component view to act as an "insert before" view
            const beforeView = this._vcr.createComponent(DynamicComponent, {
              injector: this._injector,
            }).hostView;
            // change-detect the "before view" to create all child views
            beforeView.detectChanges();
            this.viewInsertingDir.insert(beforeView, this.insertTpl);
          }
        }

        TestBed.configureTestingModule({
          declarations: [TestCmpt, ViewInsertingDir, DynamicComponent],
        });

        const fixture = TestBed.createComponent(TestCmpt);
        fixture.detectChanges();

        fixture.componentInstance.insert();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('insert|before');
      });
    });
  });

  describe('non-regression', () => {
    // https://github.com/angular/angular/issues/31971
    it('should insert component views into ViewContainerRef injected by querying <ng-container>', () => {
      @Component({
        selector: 'dynamic-cmpt',
        template: 'dynamic',
        standalone: false,
      })
      class DynamicComponent {}

      @Component({
        selector: 'app-root',
        template: `
            <div>start|</div>
            <ng-container #container></ng-container>
            <div>|end</div>

            <div (click)="click()" >|click</div>
        `,
        standalone: false,
      })
      class AppComponent {
        @ViewChild('container', {read: ViewContainerRef, static: true}) vcr!: ViewContainerRef;

        click() {
          this.vcr.createComponent(DynamicComponent);
        }
      }

      TestBed.configureTestingModule({
        declarations: [AppComponent, DynamicComponent],
      });
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('start||end|click');

      fixture.componentInstance.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('start|dynamic|end|click');
    });

    // https://github.com/angular/angular/issues/33679
    it('should insert embedded views into ViewContainerRef injected by querying <ng-container>', () => {
      @Component({
        selector: 'app-root',
        template: `
        <div>container start|</div>
        <ng-container #container></ng-container>
        <div>|container end</div>

        <ng-template #template >test</ng-template>
        <div (click)="click()" >|click</div>
        `,
        standalone: false,
      })
      class AppComponent {
        @ViewChild('container', {read: ViewContainerRef, static: true}) vcr!: ViewContainerRef;

        @ViewChild('template', {read: TemplateRef, static: true}) template!: TemplateRef<any>;

        click() {
          this.vcr.createEmbeddedView(this.template, undefined, 0);
        }
      }

      TestBed.configureTestingModule({
        declarations: [AppComponent],
      });
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('container start||container end|click');

      fixture.componentInstance.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('container start|test|container end|click');
    });

    it('should properly insert before views in a ViewContainerRef injected on ng-container', () => {
      @Component({
        selector: 'app-root',
        template: `
          <ng-template #parameterListItem let-parameter="parameter">
            {{parameter}}
          </ng-template>
          <ng-container *ngFor="let parameter of items;"
            [ngTemplateOutlet]="parameterListItem"
            [ngTemplateOutletContext]="{parameter:parameter}">
          </ng-container>
        `,
        standalone: false,
      })
      class AppComponent {
        items = [1];
      }

      TestBed.configureTestingModule({
        declarations: [AppComponent],
        imports: [CommonModule],
      });

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toContain('1');

      fixture.componentInstance.items = [2, 1];
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toContain('2  1');
    });
  });

  describe('create mode error handling', () => {
    it('should consistently report errors raised a directive constructor', () => {
      @Directive({
        selector: '[failInConstructorAlways]',
        standalone: false,
      })
      class FailInConstructorAlways {
        constructor() {
          throw new Error('Error in a constructor');
        }
      }

      @Component({
        template: `<div failInConstructorAlways></div>`,
        standalone: false,
      })
      class TestCmpt {}

      TestBed.configureTestingModule({
        declarations: [TestCmpt, FailInConstructorAlways],
      });

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in a constructor');

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in a constructor');
    });

    it('should render even if a directive constructor throws in the first create pass', () => {
      let firstRun = true;

      @Directive({
        selector: '[failInConstructorOnce]',
        standalone: false,
      })
      class FailInConstructorOnce {
        constructor() {
          if (firstRun) {
            firstRun = false;
            throw new Error('Error in a constructor');
          }
        }
      }

      @Component({
        template: `<div failInConstructorOnce>OK</div>`,
        standalone: false,
      })
      class TestCmpt {}

      TestBed.configureTestingModule({
        declarations: [TestCmpt, FailInConstructorOnce],
      });

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in a constructor');

      const fixture = TestBed.createComponent(TestCmpt);
      expect(fixture.nativeElement.textContent).toContain('OK');
    });

    it('should consistently report errors raised a directive input setter', () => {
      @Directive({
        selector: '[failInInputAlways]',
        standalone: false,
      })
      class FailInInputAlways {
        @Input()
        set failInInputAlways(_: string) {
          throw new Error('Error in an input');
        }
      }

      @Component({
        template: `<div failInInputAlways="static"></div>`,
        standalone: false,
      })
      class TestCmpt {}

      TestBed.configureTestingModule({
        declarations: [TestCmpt, FailInInputAlways],
      });

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in an input');

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in an input');
    });

    it('should consistently report errors raised a static query setter', () => {
      @Directive({
        selector: '[someDir]',
        standalone: false,
      })
      class SomeDirective {}

      @Component({
        template: `<div someDir></div>`,
        standalone: false,
      })
      class TestCmpt {
        @ViewChild(SomeDirective, {static: true})
        set directive(_: SomeDirective) {
          throw new Error('Error in static query setter');
        }
      }

      TestBed.configureTestingModule({
        declarations: [TestCmpt, SomeDirective],
      });

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in static query setter');

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in static query setter');
    });

    it('should match a static query, even if its setter throws in the first create pass', () => {
      let hasThrown = false;

      @Directive({
        selector: '[someDir]',
        standalone: false,
      })
      class SomeDirective {}

      @Component({
        template: `<div someDir></div>`,
        standalone: false,
      })
      class TestCmpt {
        @ViewChild(SomeDirective, {static: true})
        get directive() {
          return this._directive;
        }
        set directive(directiveInstance: SomeDirective) {
          if (!hasThrown) {
            hasThrown = true;
            throw new Error('Error in static query setter');
          }

          this._directive = directiveInstance;
        }

        private _directive!: SomeDirective;
      }

      TestBed.configureTestingModule({
        declarations: [TestCmpt, SomeDirective],
      });

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in static query setter');

      const fixture = TestBed.createComponent(TestCmpt);

      expect(fixture.componentInstance.directive).toBeInstanceOf(SomeDirective);
    });

    it('should render a recursive component if it throws during the first creation pass', () => {
      let hasThrown = false;

      @Component({
        selector: 'test',
        template: `<ng-content></ng-content>OK`,
        standalone: false,
      })
      class TestCmpt {
        constructor() {
          if (!hasThrown) {
            hasThrown = true;
            throw new Error('Error in a constructor');
          }
        }
      }

      @Component({
        template: `<test><test><test></test></test></test>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({
        declarations: [App, TestCmpt],
      });

      expect(() => {
        TestBed.createComponent(App);
      }).toThrowError('Error in a constructor');

      const fixture = TestBed.createComponent(App);
      expect(fixture.nativeElement.textContent).toContain('OKOKOK');
    });

    it('should continue detecting changes if a directive throws in its constructor', () => {
      let firstRun = true;

      @Directive({
        selector: '[failInConstructorOnce]',
        standalone: false,
      })
      class FailInConstructorOnce {
        constructor() {
          if (firstRun) {
            firstRun = false;
            throw new Error('Error in a constructor');
          }
        }
      }

      @Component({
        template: `<div failInConstructorOnce>{{value}}</div>`,
        standalone: false,
      })
      class TestCmpt {
        value = 0;
      }

      TestBed.configureTestingModule({
        declarations: [TestCmpt, FailInConstructorOnce],
      });

      expect(() => {
        TestBed.createComponent(TestCmpt);
      }).toThrowError('Error in a constructor');

      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('0');

      fixture.componentInstance.value = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('1');

      fixture.componentInstance.value = 2;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('2');
    });

    it('should consistently report errors raised by createEmbeddedView', () => {
      // Intentionally hasn't been added to `providers` so that it throws a DI error.
      @Injectable()
      class DoesNotExist {}

      @Directive({
        selector: 'dir',
        standalone: false,
      })
      class Dir {
        constructor(willCauseError: DoesNotExist) {}
      }

      @Component({
        template: `
          <ng-template #broken>
            <dir></dir>
          </ng-template>
        `,
        standalone: false,
      })
      class App {
        @ViewChild('broken') template!: TemplateRef<unknown>;

        constructor(private _viewContainerRef: ViewContainerRef) {}

        insertTemplate() {
          this._viewContainerRef.createEmbeddedView(this.template);
        }
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      const tryRender = () => {
        fixture.componentInstance.insertTemplate();
        fixture.detectChanges();
      };
      fixture.detectChanges();

      // We try to render the same template twice to ensure that we get consistent error messages.
      expect(tryRender).toThrowError(/NG0201\: No provider found for `DoesNotExist`/);
      expect(tryRender).toThrowError(/NG0201\: No provider found for `DoesNotExist`/);
    });
  });
});
