/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, Directive, EmbeddedViewRef, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {getComponent} from '@angular/core/src/render3';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ivyEnabled} from '@angular/private/testing';

describe('view insertion', () => {
  describe('of a simple template', () => {
    it('should insert into an empty container, at the front, in the middle, and at the end', () => {
      let _counter = 0;

      @Component({
        selector: 'increment-comp',
        template: `<span>Created{{counter}}</span>`,
      })
      class IncrementComp {
        counter = _counter++;
      }

      @Component({
        template: `
              <ng-template #simple><increment-comp></increment-comp></ng-template>
              <ng-template #nested><ng-template [ngIf]="true">Nested</ng-template></ng-template>
              <ng-template #empty></ng-template>
              <div #container></div>
            `
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef, static: true})
        container: ViewContainerRef = null !;

        @ViewChild('simple', {read: TemplateRef, static: true})
        simple: TemplateRef<any> = null !;

        // This case demonstrates when `LView` contains another `LContainer` and requires
        // recursion when we retrieve the insert before `RNode`
        @ViewChild('nested', {read: TemplateRef, static: true})
        nested: TemplateRef<any> = null !;

        // This case demonstrates when `LView` contains no `TNode` and we have to go to the next
        // `LView` in order to get a real `RNode`
        @ViewChild('empty', {read: TemplateRef, static: true})
        empty: TemplateRef<any> = null !;

        view0: EmbeddedViewRef<any> = null !;
        view1: EmbeddedViewRef<any> = null !;
        view2: EmbeddedViewRef<any> = null !;
        view3: EmbeddedViewRef<any> = null !;
        view4: EmbeddedViewRef<any> = null !;

        constructor(public changeDetector: ChangeDetectorRef) {}

        ngAfterViewInit() {
          // insert at the front. Because this is empty and has no `RNode` any insertions in
          // front of it need to fall through to the next `LView` to get insertion node.
          this.view1 = this.container.createEmbeddedView(this.empty);
          expect(fixture.nativeElement.textContent).toBe('');

          this.view2 = this.container.createEmbeddedView(this.nested);  // "nested"
          this.view2.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('Nested');

          // insert at the front again
          this.view0 = this.container.createEmbeddedView(this.simple, {}, 0);  // "Created0"
          this.view0.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('Created0Nested');

          // insert at the end
          this.view4 = this.container.createEmbeddedView(this.simple);  // "Created1"
          this.view4.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('Created0NestedCreated1');

          // insert in the middle
          this.view3 = this.container.createEmbeddedView(this.simple, {}, 3);  // "Created2"
          this.view3.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('Created0NestedCreated2Created1');

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
      expect(app.container.indexOf(app.view4)).toBe(4);
      // The text in each component differs based on *when* it was created.
      expect(fixture.nativeElement.textContent).toBe('Created0NestedCreated2Created1');
    });
  });

  describe('of an empty template', () => {
    it('should insert into an empty container, at the front, in the middle, and at the end', () => {
      @Component({
        template: `
              <ng-template #empty></ng-template>
              <div #container></div>
            `
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef})
        container: ViewContainerRef = null !;

        @ViewChild('empty', {read: TemplateRef})
        empty: TemplateRef<any> = null !;

        view0: EmbeddedViewRef<any> = null !;
        view1: EmbeddedViewRef<any> = null !;
        view2: EmbeddedViewRef<any> = null !;
        view3: EmbeddedViewRef<any> = null !;

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
                `
      })
      class Comp {
        @ViewChild('container', {read: ViewContainerRef})
        container: ViewContainerRef = null !;

        @ViewChild('projection', {read: TemplateRef})
        projection: TemplateRef<any> = null !;

        view0: EmbeddedViewRef<any> = null !;
        view1: EmbeddedViewRef<any> = null !;
        view2: EmbeddedViewRef<any> = null !;
        view3: EmbeddedViewRef<any> = null !;

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
        `
      })
      class App {
      }

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
                `
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef})
        container: ViewContainerRef = null !;

        @ViewChild('subContainer', {read: TemplateRef})
        subContainer: TemplateRef<any> = null !;

        view0: EmbeddedViewRef<any> = null !;
        view1: EmbeddedViewRef<any> = null !;
        view2: EmbeddedViewRef<any> = null !;
        view3: EmbeddedViewRef<any> = null !;

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

  describe('regression', () => {
    it('should allow inserting of all different types', () => {
      @Component({
        selector: 'test-container-insertion',
        template: `
        <ng-template #container></ng-template>

        <ng-template #empty></ng-template>
        <ng-template #basic>(basic)</ng-template>
        <ng-template #nested><ng-template [ngIf]="true">(nested)</ng-template></ng-template>
        <ng-template #projection><ng-content></ng-content></ng-template>
        <ng-template #icu>{count, plural, =0 {(icu)} other {(icu-other)}}</ng-template>
        `
      })
      class TestContainerInsertionComponent {
        count: number = 0;

        @ViewChild('container', {read: ViewContainerRef})
        container: ViewContainerRef = null !;

        @ViewChild('empty', {read: TemplateRef})
        empty: TemplateRef<any> = null !;
        @ViewChild('basic', {read: TemplateRef})
        basic: TemplateRef<any> = null !;
        @ViewChild('projection', {read: TemplateRef})
        projection: TemplateRef<any> = null !;
        @ViewChild('nested', {read: TemplateRef})
        nested: TemplateRef<any> = null !;
        @ViewChild('icu', {read: TemplateRef})
        icu: TemplateRef<any> = null !;
      }

      @Component({
        selector: 'test-component',
        template: `
        <test-container-insertion>(content)</test-container-insertion>
        `
      })
      class TestComponent {
      }

      const fixture = TestBed
                          .configureTestingModule(
                              {declarations: [TestComponent, TestContainerInsertionComponent]})
                          .createComponent(TestComponent);
      fixture.detectChanges();
      const testContainerComponent = getComponent<TestContainerInsertionComponent>(
          (fixture.nativeElement as HTMLElement).querySelector('test-container-insertion') !) !;

      testContainerComponent.container.createEmbeddedView(testContainerComponent.empty, {}, 0);
      expect(fixture.nativeElement.textContent).toBe('');

      testContainerComponent.container.createEmbeddedView(testContainerComponent.basic, {}, 0);
      expect(fixture.nativeElement.textContent).toBe('(basic)');

      const nestedView =
          testContainerComponent.container.createEmbeddedView(testContainerComponent.nested, {}, 0);
      nestedView.detectChanges();  // So that `*ngIf` unrolls
      expect(fixture.nativeElement.textContent).toBe('(nested)(basic)');

      (global as any).debug = true;
      testContainerComponent.container.createEmbeddedView(testContainerComponent.projection, {}, 0);
      expect(fixture.nativeElement.textContent).toBe('(content)(nested)(basic)');

      const icuView =
          testContainerComponent.container.createEmbeddedView(testContainerComponent.icu, {}, 0);
      icuView.detectChanges();  // So that ICU updates
      expect(fixture.nativeElement.textContent).toBe('(icu)(content)(nested)(basic)');
    });

    it('FW-1559: should support inserting in front of nested `LContainers', () => {
      @Component({
        selector: 'repeater',
        template: `
          <ng-template ngFor [ngForOf]="rendered" [ngForTrackBy]="trackByFn" let-item>
            <ng-template [ngTemplateOutlet]="outerTemplate"
                        [ngTemplateOutletContext]="{$implicit: item}">
            </ng-template>
          </ng-template>

          <ng-template #outerTemplate let-item>{{item}}</ng-template>
        `
      })
      class Repeater {
        rendered: string[] = [];

        trackByFn(index: number, item: string) { return item; }
      }

      const fixture =
          TestBed.configureTestingModule({declarations: [Repeater]}).createComponent(Repeater);
      fixture.componentInstance.rendered = ['b'];
      fixture.detectChanges();

      fixture.componentInstance.rendered = ['a', 'b'];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('ab');
    });

    it('FW-1559: should properly render content if vcr.createEmbeddedView is called', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        viewRef: any;

        constructor(public template: TemplateRef<{}>, public viewContainerRef: ViewContainerRef) {}

        show() {
          this.viewRef = this.viewContainerRef.createEmbeddedView(this.template);
          this.viewRef.detectChanges();
        }
      }

      @Component({
        selector: 'edit-form',
        template: `
          <ng-template dir>
            <div *ngIf="myFlag">Text</div>
          </ng-template>
        `,
      })
      class MyComp {
        myFlag: boolean = true;
        @ViewChild(MyDir, {static: true}) dir !: MyDir;
      }

      TestBed.configureTestingModule({
        declarations: [MyComp, MyDir],
        imports: [CommonModule],
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const dirRef = fixture.componentInstance.dir;
      dirRef.show();

      // In VE:  3 nodes - 2 comment nodes + 1 div
      // In Ivy: 2 comment node (anchor)
      const rootNodes = dirRef.viewRef.rootNodes;
      expect(rootNodes.length).toBe(ivyEnabled ? 2 : 3);
      expect((rootNodes[0] as Comment).textContent).toMatch(/"ng-reflect-ng-if": "true"/);
      expect((rootNodes[1] as HTMLElement).outerHTML).toEqual('<div>Text</div>');
    });

  });
});
