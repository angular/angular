/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO: update imports
import {computed, ElementRef, ɵɵdefineComponent, ɵɵelement, ɵɵStandaloneFeature} from '@angular/core';
import {viewChild, viewChildren} from '@angular/core/src/authoring/queries';
import {ɵɵviewQuerySignal} from '@angular/core/src/render3/instructions/queries_signals';
import {TestBed} from '@angular/core/testing';

describe('queries as signals', () => {
  describe('view', () => {
    it('view child - HAND GENERATED CODE - delete after compiler is done', () => {
      const _c0 = ['el'];
      class AppComponent {
        divEl = viewChild<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEl() != null);

        static ɵfac = () => new AppComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: AppComponent,
          selectors: [['test-cmp']],
          viewQuery:
              function App_Query(rf, ctx) {
                if (rf & 1) {
                  ɵɵviewQuerySignal(ctx.divEl, _c0, 1);
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
      // with signal based queries we _do_ have query results after the creation mode execution
      // (before the change detection runs) so we can return those early on! In this sense all
      // queries behave as "static" (?)
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      // non-required query results are undefined before we run creation mode on the view queries
      const appCmpt = new AppComponent();
      expect(appCmpt.divEl()).toBeUndefined();
    });

    it('required view child - HAND GENERATED CODE - delete after compiler is done', () => {
      const _c0 = ['el'];
      class AppComponent {
        divEl = viewChild.required<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEl() != null);

        static ɵfac = () => new AppComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: AppComponent,
          selectors: [['test-cmp']],
          viewQuery:
              function App_Query(rf, ctx) {
                if (rf & 1) {
                  ɵɵviewQuerySignal(ctx.divEl, _c0, 1);
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
      // with signal based queries we _do_ have query results after the creation mode execution
      // (before the change detection runs) so we can return those early on! In this sense all
      // queries behave as "static" (?)
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      // non-required query results are undefined before we run creation mode on the view queries
      const appCmpt = new AppComponent();
      expect(() => {
        appCmpt.divEl();
      }).toThrowError('NG00: no query results yet!');
    });

    it('view children - HAND GENERATED CODE - delete after compiler is done', () => {
      const _c0 = ['el'];
      class AppComponent {
        divEls = viewChildren<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEls().length);

        static ɵfac = () => new AppComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: AppComponent,
          selectors: [['test-cmp']],
          viewQuery:
              function App_Query(rf, ctx) {
                if (rf & 1) {
                  ɵɵviewQuerySignal(ctx.divEls, _c0, 1);
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
      // with signal based queries we _do_ have query results after the creation mode execution
      // (before the change detection runs) so we can return those early on! In this sense all
      // queries behave as "static" (?)
      expect(fixture.componentInstance.foundEl()).toBe(1);

      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBe(1);

      // non-required query results are undefined before we run creation mode on the view queries
      const appCmpt = new AppComponent();
      expect(appCmpt.divEls().length).toBe(0);
    });
  });
});
