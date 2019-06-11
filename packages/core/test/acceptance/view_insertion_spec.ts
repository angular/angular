/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, EmbeddedViewRef, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('view insertion', () => {
  describe('of a simple template', () => {
    it('should insert into an empty container, at the front, in the middle, and at the end', () => {
      let _counter = 0;

      @Component({
        selector: 'increment-comp',
        template: `<span>created{{counter}}</span>`,
      })
      class IncrementComp {
        counter = _counter++;
      }

      @Component({
        template: `
              <ng-template #simple><increment-comp></increment-comp></ng-template>
              <div #container></div>
            `
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef, static: true})
        container: ViewContainerRef = null !;

        @ViewChild('simple', {read: TemplateRef, static: true})
        simple: TemplateRef<any> = null !;

        view0: EmbeddedViewRef<any> = null !;
        view1: EmbeddedViewRef<any> = null !;
        view2: EmbeddedViewRef<any> = null !;
        view3: EmbeddedViewRef<any> = null !;

        constructor(public changeDetector: ChangeDetectorRef) {}

        ngAfterViewInit() {
          // insert at the front
          this.view1 = this.container.createEmbeddedView(this.simple);  // "created0"

          // insert at the front again
          this.view0 = this.container.createEmbeddedView(this.simple, {}, 0);  // "created1"

          // insert at the end
          this.view3 = this.container.createEmbeddedView(this.simple);  // "created2"

          // insert in the middle
          this.view2 = this.container.createEmbeddedView(this.simple, {}, 2);  // "created3"

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
            `
      })
      class App {
        @ViewChild('container', {read: ViewContainerRef, static: false})
        container: ViewContainerRef = null !;

        @ViewChild('empty', {read: TemplateRef, static: false})
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
        @ViewChild('container', {read: ViewContainerRef, static: false})
        container: ViewContainerRef = null !;

        @ViewChild('projection', {read: TemplateRef, static: false})
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
        @ViewChild('container', {read: ViewContainerRef, static: false})
        container: ViewContainerRef = null !;

        @ViewChild('subContainer', {read: TemplateRef, static: false})
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
});
