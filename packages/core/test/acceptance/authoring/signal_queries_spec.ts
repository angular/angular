/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  contentChild,
  contentChildren,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  QueryList,
  viewChild,
  ViewChildren,
  viewChildren,
} from '@angular/core';
import {SIGNAL} from '../../../primitives/signals';
import {TestBed} from '../../../testing';
import {By} from '@angular/platform-browser';

describe('queries as signals', () => {
  describe('view', () => {
    it('should query for an optional element in a template', () => {
      @Component({
        template: `<div #el></div>`,
      })
      class AppComponent {
        divEl = viewChild<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEl() != null);
      }

      const fixture = TestBed.createComponent(AppComponent);
      // with signal based queries we _do_ have query results after the creation mode
      // execution
      // (before the change detection runs) so we can return those early on! In this sense all
      // queries behave as "static" (?)
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });

    it('should return undefined if optional query is read in the constructor', () => {
      let result: {} | undefined = {};

      @Component({
        template: `<div #el></div>`,
      })
      class AppComponent {
        divEl = viewChild<ElementRef<HTMLDivElement>>('el');

        constructor() {
          result = this.divEl();
        }
      }

      TestBed.createComponent(AppComponent);
      expect(result).toBeUndefined();
    });

    it('should query for a required element in a template', () => {
      @Component({
        template: `<div #el></div>`,
      })
      class AppComponent {
        divEl = viewChild.required<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEl() != null);
      }

      const fixture = TestBed.createComponent(AppComponent);
      // with signal based queries we _do_ have query results after the creation mode execution
      // (before the change detection runs) so we can return those early on! In this sense all
      // queries behave as "static" (?)
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });

    it('should query for multiple elements in a template', () => {
      @Component({
        template: `
          <div #el></div>
          @if (show) {
            <div #el></div>
          }
        `,
      })
      class AppComponent {
        show = false;

        divEls = viewChildren<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEls().length);
      }

      const fixture = TestBed.createComponent(AppComponent);
      // with signal based queries we _do_ have query results after the creation mode execution
      // (before the change detection runs) so we can return those early on! In this sense all
      // queries behave as "static" (?)
      expect(fixture.componentInstance.foundEl()).toBe(1);

      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBe(1);

      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBe(2);

      fixture.componentInstance.show = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBe(1);
    });

    it('should return an empty array when reading children query in the constructor', () => {
      let result: readonly ElementRef[] | undefined;

      @Component({
        template: `<div #el></div>`,
      })
      class AppComponent {
        divEls = viewChildren<ElementRef<HTMLDivElement>>('el');

        constructor() {
          result = this.divEls();
        }
      }

      TestBed.createComponent(AppComponent);
      expect(result).toEqual([]);
    });

    it('should return the same array instance when there were no changes in results', () => {
      @Component({
        template: `<div #el></div>`,
      })
      class AppComponent {
        divEls = viewChildren<ElementRef<HTMLDivElement>>('el');
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const result1 = fixture.componentInstance.divEls();
      expect(result1.length).toBe(1);

      // subsequent reads should return the same result instance
      const result2 = fixture.componentInstance.divEls();
      expect(result2.length).toBe(1);
      expect(result2).toBe(result1);
    });

    it('should not mark signal as dirty when a child query result does not change', () => {
      let computeCount = 0;

      @Component({
        template: `
            <div #el></div>
            @if (show) {
              <div #el></div>
            }
          `,
      })
      class AppComponent {
        divEl = viewChild.required<ElementRef<HTMLDivElement>>('el');
        isThere = computed(() => ++computeCount);
        show = false;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.isThere()).toBe(1);
      const divEl = fixture.componentInstance.divEl();

      // subsequent reads should return the same result instance and _not_ trigger downstream
      // computed re-evaluation
      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.divEl()).toBe(divEl);
      expect(fixture.componentInstance.isThere()).toBe(1);
    });

    it('should return the same array instance when there were no changes in results after view manipulation', () => {
      @Component({
        template: `
            <div #el></div>
            @if (show) {
              <div></div>
            }
          `,
      })
      class AppComponent {
        divEls = viewChildren<ElementRef<HTMLDivElement>>('el');

        show = false;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const result1 = fixture.componentInstance.divEls();
      expect(result1.length).toBe(1);

      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      // subsequent reads should return the same result instance since the query results didn't
      // change
      const result2 = fixture.componentInstance.divEls();
      expect(result2.length).toBe(1);
      expect(result2).toBe(result1);
    });

    it('should be empty when no query matches exist', () => {
      @Component({
        template: ``,
      })
      class AppComponent {
        result = viewChild('unknown');
        results = viewChildren('unknown');
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.result()).toBeUndefined();
      expect(fixture.componentInstance.results().length).toBe(0);
    });

    it('should assign a debugName to the underlying signal node when a debugName is provided', () => {
      @Component({
        template: `<div #el></div>`,
      })
      class AppComponent {
        viewChildQuery = viewChild<ElementRef<HTMLDivElement>>('el', {debugName: 'viewChildQuery'});
        viewChildrenQuery = viewChildren<ElementRef<HTMLDivElement>>('el', {
          debugName: 'viewChildrenQuery',
        });
      }

      const fixture = TestBed.createComponent(AppComponent);
      const viewChildNode = fixture.componentInstance.viewChildQuery![SIGNAL] as {
        debugName: string;
      };
      expect(viewChildNode.debugName).toBe('viewChildQuery');
      const viewChildrenNode = fixture.componentInstance.viewChildrenQuery![SIGNAL] as {
        debugName: string;
      };
      expect(viewChildrenNode.debugName).toBe('viewChildrenQuery');
    });

    it('should assign a debugName to the underlying signal node when a debugName is provided to a required viewChild query', () => {
      @Component({
        template: `<div #el></div>`,
      })
      class AppComponent {
        viewChildQuery = viewChild<ElementRef<HTMLDivElement>>('el', {debugName: 'viewChildQuery'});
      }

      const fixture = TestBed.createComponent(AppComponent);
      const node = fixture.componentInstance.viewChildQuery![SIGNAL] as {debugName: string};
      expect(node.debugName).toBe('viewChildQuery');
    });
  });

  describe('content queries', () => {
    it('should run content queries defined on components', () => {
      @Component({
        selector: 'query-cmp',
        template: `{{noOfEls()}}`,
      })
      class QueryComponent {
        elements = contentChildren('el');
        element = contentChild('el');
        elementReq = contentChild.required('el');

        noOfEls = computed(
          () =>
            this.elements().length +
            (this.element() !== undefined ? 1 : 0) +
            (this.elementReq() !== undefined ? 1 : 0),
        );
      }

      @Component({
        imports: [QueryComponent],
        template: `
          <query-cmp>
            <div #el></div >
            @if (show) {
              <div #el></div>
            }
          </query-cmp>
        `,
      })
      class AppComponent {
        show = false;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('3');

      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('4');

      fixture.componentInstance.show = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('3');
    });

    it('should run content queries defined on directives', () => {
      @Directive({
        selector: '[query]',
        host: {'[textContent]': `noOfEls()`},
      })
      class QueryDir {
        elements = contentChildren('el');
        element = contentChild('el');
        elementReq = contentChild.required('el');

        noOfEls = computed(
          () =>
            this.elements().length +
            (this.element() !== undefined ? 1 : 0) +
            (this.elementReq() !== undefined ? 1 : 0),
        );
      }

      @Component({
        imports: [QueryDir],
        template: `
          <div query>
            <div #el></div>
            @if (show) {
              <div #el></div>
            }
          </div>
        `,
      })
      class AppComponent {
        show = false;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('3');

      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('4');

      fixture.componentInstance.show = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('3');
    });

    it('should not return partial results during the first-time view rendering', () => {
      @Directive({selector: '[marker]'})
      class MarkerForResults {}

      @Directive({
        selector: '[declare]',
      })
      class DeclareQuery {
        results = contentChildren(MarkerForResults);
      }

      @Directive({selector: '[inspect]'})
      class InspectsQueryResults {
        constructor(declaration: DeclareQuery) {
          // we should _not_ get partial query results while the view is still creating
          expect(declaration.results().length).toBe(0);
        }
      }

      @Component({
        imports: [MarkerForResults, InspectsQueryResults, DeclareQuery],
        template: `
                <div declare>
                  <div marker></div>
                  <div inspect></div>
                  <div marker></div>
                </div>
             `,
      })
      class AppComponent {}

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const queryDir = fixture.debugElement
        .query(By.directive(DeclareQuery))
        .injector.get(DeclareQuery);

      expect(queryDir.results().length).toBe(2);
    });

    it('should be empty when no query matches exist', () => {
      @Directive({
        selector: '[declare]',
      })
      class DeclareQuery {
        result = contentChild('unknown');
        results = contentChildren('unknown');
      }

      @Component({
        imports: [DeclareQuery],
        template: `<div declare></div>`,
      })
      class AppComponent {}

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const queryDir = fixture.debugElement
        .query(By.directive(DeclareQuery))
        .injector.get(DeclareQuery);

      expect(queryDir.result()).toBeUndefined();
      expect(queryDir.results().length).toBe(0);
    });

    it('should assign a debugName to the underlying signal node when a debugName is provided', () => {
      @Component({
        selector: 'query-cmp',
        template: ``,
      })
      class QueryComponent {
        contentChildrenQuery = contentChildren('el', {debugName: 'contentChildrenQuery'});
        contentChildQuery = contentChild('el', {debugName: 'contentChildQuery'});
        contentChildRequiredQuery = contentChild.required('el', {
          debugName: 'contentChildRequiredQuery',
        });
      }

      @Component({
        imports: [QueryComponent],
        template: `
          <query-cmp>
            <div #el></div>
            <div #el></div>
          </query-cmp>
        `,
      })
      class AppComponent {}

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const queryComponent = fixture.debugElement.query(By.directive(QueryComponent))
        .componentInstance as QueryComponent;
      expect((queryComponent.contentChildrenQuery[SIGNAL] as {debugName: string}).debugName).toBe(
        'contentChildrenQuery',
      );
      expect((queryComponent.contentChildQuery[SIGNAL] as {debugName: string}).debugName).toBe(
        'contentChildQuery',
      );
      expect(
        (queryComponent.contentChildRequiredQuery[SIGNAL] as {debugName: string}).debugName,
      ).toBe('contentChildRequiredQuery');
    });
  });

  describe('reactivity and performance', () => {
    it('should not dirty a children query when a list of matches does not change - a view with matches', () => {
      let recomputeCount = 0;

      @Component({
        template: `
          <div #el></div>
          @if (show) {
            <div #el></div>
          }
        `,
      })
      class AppComponent {
        divEls = viewChildren<ElementRef<HTMLDivElement>>('el');
        foundElCount = computed(() => {
          recomputeCount++;
          return this.divEls().length;
        });
        show = false;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundElCount()).toBe(1);
      expect(recomputeCount).toBe(1);

      // trigger view manipulation that should dirty queries but not change the results
      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      fixture.componentInstance.show = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(fixture.componentInstance.foundElCount()).toBe(1);
      expect(recomputeCount).toBe(1);
    });

    it('should not dirty a children query when a list of matches does not change - a view with another container', () => {
      let recomputeCount = 0;

      @Component({
        template: `
          <div #el></div>
          @if (show) {
            <!-- an empty if to create a container -->
            @if (true) {}
          }
        `,
      })
      class AppComponent {
        divEls = viewChildren<ElementRef<HTMLDivElement>>('el');
        foundElCount = computed(() => {
          recomputeCount++;
          return this.divEls().length;
        });
        show = false;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundElCount()).toBe(1);
      expect(recomputeCount).toBe(1);

      // trigger view manipulation that should dirty queries but not change the results
      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      fixture.componentInstance.show = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(fixture.componentInstance.foundElCount()).toBe(1);
      expect(recomputeCount).toBe(1);
    });
  });

  describe('dynamic component creation', () => {
    it('should return empty results for content queries of dynamically created components', () => {
      // https://github.com/angular/angular/issues/54450
      @Component({
        selector: 'query-cmp',
        template: ``,
      })
      class QueryComponent {
        elements = contentChildren('el');
        element = contentChild('el');
      }

      @Component({
        template: ``,
      })
      class TestComponent {
        constructor(private _envInjector: EnvironmentInjector) {}

        createDynamic() {
          return createComponent(QueryComponent, {environmentInjector: this._envInjector});
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      const cmpRef = fixture.componentInstance.createDynamic();
      cmpRef.changeDetectorRef.detectChanges();

      expect(cmpRef.instance.elements()).toEqual([]);
      expect(cmpRef.instance.element()).toBeUndefined();
    });
  });

  describe('mix of signal and decorator queries', () => {
    it('should allow specifying both types of queries in one component', () => {
      @Component({
        template: `
          <div #el></div>
          @if (show) {
            <div #el></div>
          }
        `,
      })
      class AppComponent {
        show = false;

        divElsSignal = viewChildren<ElementRef<HTMLDivElement>>('el');

        @ViewChildren('el') divElsDecorator!: QueryList<ElementRef<HTMLDivElement>>;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.divElsSignal().length).toBe(1);
      expect(fixture.componentInstance.divElsDecorator.length).toBe(1);

      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.divElsSignal().length).toBe(2);
      expect(fixture.componentInstance.divElsDecorator.length).toBe(2);

      fixture.componentInstance.show = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.divElsSignal().length).toBe(1);
      expect(fixture.componentInstance.divElsDecorator.length).toBe(1);
    });

    it('should allow combination via inheritance of both types of queries in one component', () => {
      @Component({
        template: `
            <div #el></div>
            @if (show) {
              <div #el></div>
            }
          `,
      })
      class BaseComponent {
        show = false;
        divElsSignal = viewChildren<ElementRef<HTMLDivElement>>('el');
      }

      @Component({
        template: `
            <div #el></div>
            @if (show) {
              <div #el></div>
            }
          `,
      })
      class AppComponent extends BaseComponent {
        @ViewChildren('el') divElsDecorator!: QueryList<ElementRef<HTMLDivElement>>;
      }

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.divElsSignal().length).toBe(1);
      expect(fixture.componentInstance.divElsDecorator.length).toBe(1);

      fixture.componentInstance.show = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.divElsSignal().length).toBe(2);
      expect(fixture.componentInstance.divElsDecorator.length).toBe(2);

      fixture.componentInstance.show = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.divElsSignal().length).toBe(1);
      expect(fixture.componentInstance.divElsDecorator.length).toBe(1);
    });
  });
});
