/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, computed, ElementRef, ViewChild, viewChild, viewChildren, ɵɵdefineComponent, ɵɵelement, ɵɵStandaloneFeature, ɵɵviewQueryCreate} from '@angular/core';
import {TestBed} from '@angular/core/testing';


describe('queries', () => {
  describe('view queries', () => {
    xit('should support child query in a single view', () => {
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

    xit('should support children query in a single view', () => {
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

    it('view child - HAND GENERATED CODE - delete after compiler is done', () => {
      const _c0 = ['el'];
      class AppComponent {
        divEl = viewChild<ElementRef>('el');
        foundEl = computed(() => this.divEl() != null);

        static ɵfac = () => new AppComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: AppComponent,
          selectors: [['test-cmp']],
          viewQuery:
              function App_Query(rf, ctx) {
                // TODO: there should be no update mode for queries any more
                if (rf & 1) {
                  ɵɵviewQueryCreate(ctx.divEl, _c0, 1);
                }
              },
          standalone: true,
          signals: true,
          features: [ɵɵStandaloneFeature],
          decls: 3,
          vars: 0,
          consts: [['el', '']],
          template:
              function App_Template(rf) {
                if ((rf & 1)) {
                  ɵɵelement(0, 'div', null, 0);
                }
              },
          encapsulation: 2
        });
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });

    it('view children - HAND GENERATED CODE - delete after compiler is done', () => {
      const _c0 = ['el'];
      class AppComponent {
        divEls = viewChildren<ElementRef>('el');
        foundElsCount = computed(() => this.divEls().length);

        static ɵfac = () => new AppComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: AppComponent,
          selectors: [['test-cmp']],
          viewQuery:
              function App_Query(rf, ctx) {
                // TODO: there should be no update mode for queries any more
                if (rf & 1) {
                  ɵɵviewQueryCreate(ctx.divEls, _c0, 1);
                }
              },
          standalone: true,
          signals: true,
          features: [ɵɵStandaloneFeature],
          decls: 3,
          vars: 0,
          consts: [['el', '']],
          template:
              function App_Template(rf) {
                if ((rf & 1)) {
                  ɵɵelement(0, 'div', null, 0);
                }
              },
          encapsulation: 2
        });
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundElsCount()).toBe(1);
    });
  });
});
