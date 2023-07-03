/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, computed, ContentChild, contentChild, ContentChildren, contentChildren, ElementRef, ViewChild, viewChild, viewChildren, ɵɵcontentQueryCreate, ɵɵdefineComponent, ɵɵStandaloneFeature, ɵɵtext, ɵɵtextInterpolate} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('queries', () => {
  describe('view queries', () => {
    it('should support child query in a single view', () => {
      @Component({
        signals: true,
        standalone: true,
        template: `<div #el></div>`,
      })
      class App {
        // Q1: similar to input, do we allow people to "observe" moment before assigning by throwing
        // if it is not set? Or return null / undefined? Do static queries make sense in this
        // context?
        // Q2: similar to input, do we need both the viewChild function _and_ @ViewChild annotation?
        @ViewChild('el') divEl = viewChild<ElementRef>('el');
        foundEl = computed(() => this.divEl() != null);
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });

    it('should support children query in a single view', () => {
      @Component({
        signals: true,
        standalone: true,
        template: `<div #el1><div><div #el2><div>`,
      })
      class App {
        @ViewChild('el1,el2') divEls = viewChildren<ElementRef>('el');
        foundEl = computed(() => this.divEls().length === 2);
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });
  });

  describe('content queries', () => {
    xit('should support child query in a single view ', () => {
      @Component({
        selector: 'with-content',
        signals: true,
        standalone: true,
        template: `{{divEl != null}}`,
      })
      class WithContent {
        // Q1: similar to input, do we allow people to "observe" moment before assigning by throwing
        // if it is not set? Or return null / undefined? Do static queries make sense in this
        // context?
        // Q2: similar to input, do we need both the contentChild function _and_ @ContentChild
        // annotation?
        @ContentChild('el') divEl = contentChild<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEl() != null);
      }

      @Component({
        signals: true,
        standalone: true,
        imports: [WithContent],
        template: `<with-content><div #el></div></with-content>`,
      })
      class App {
      }

      const fixture = TestBed.createComponent(WithContent);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });

    it('should support child query in a single view ', () => {
      const _c0 = ['el'];
      class WithContent {
        // Q1: similar to input, do we allow people to "observe" moment before assigning by throwing
        // if it is not set? Or return null / undefined? Do static queries make sense in this
        // context?
        // Q2: similar to input, do we need both the contentChild function _and_ @ContentChild
        // annotation?
        @ContentChild('el') divEl = contentChild<ElementRef<HTMLDivElement>>('el');
        foundEls = computed(() => this.divEl() != null);

        static ɵfac = () => new WithContent();
        static ɵcmp = ɵɵdefineComponent({
          type: WithContent,
          selectors: [['with-content']],
          contentQueries:
              function WithContent_ContentQueries(rf, ctx, dirIndex) {
                if (rf & 1) {
                  ɵɵcontentQueryCreate(ctx.divEl, dirIndex, _c0, 1);
                }
              },
          standalone: true,
          signals: true,
          features: [ɵɵStandaloneFeature],
          decls: 1,
          vars: 1,
          template:
              function WithContent_Template(rf, ctx: WithContent) {
                if ((rf & 1)) {
                  ɵɵtext(0);
                }
                if ((rf & 2)) {
                  ɵɵtextInterpolate((ctx.foundEls()));
                }
              },
          encapsulation: 2
        });
      }

      @Component({
        signals: true,
        standalone: true,
        imports: [WithContent],
        template: `<with-content><div #el></div></with-content>`,
      })
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('true');
    });

    it('should support children query in a single view ', () => {
      const _c0 = ['el'];
      class WithContent {
        // Q1: similar to input, do we allow people to "observe" moment before assigning by throwing
        // if it is not set? Or return null / undefined? Do static queries make sense in this
        // context?
        // Q2: similar to input, do we need both the contentChild function _and_ @ContentChild
        // annotation?
        @ContentChildren('el') divEls = contentChildren<ElementRef<HTMLDivElement>[]>('el');
        foundEls = computed(() => this.divEls().length);

        static ɵfac = () => new WithContent();
        static ɵcmp = ɵɵdefineComponent({
          type: WithContent,
          selectors: [['with-content']],
          contentQueries:
              function WithContent_ContentQueries(rf, ctx, dirIndex) {
                if (rf & 1) {
                  ɵɵcontentQueryCreate(ctx.divEls, dirIndex, _c0, 1);
                }
              },
          standalone: true,
          signals: true,
          features: [ɵɵStandaloneFeature],
          decls: 1,
          vars: 1,
          template:
              function WithContent_Template(rf, ctx: WithContent) {
                if ((rf & 1)) {
                  ɵɵtext(0);
                }
                if ((rf & 2)) {
                  ɵɵtextInterpolate((ctx.foundEls()));
                }
              },
          encapsulation: 2
        });
      }

      @Component({
        signals: true,
        standalone: true,
        imports: [WithContent],
        template: `<with-content><div #el></div></with-content>`,
      })
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1');
    });
  });
});
