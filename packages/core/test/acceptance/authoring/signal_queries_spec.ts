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
  inject,
  input,
  QueryList,
  viewChild,
  ViewChildren,
  viewChildren,
} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
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
        template: `{{ noOfEls() }}`,
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
            <div #el></div>
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

    it('should not expose query results from embedded views during first update pass', () => {
      @Directive({selector: '[value]'})
      class ChildDirective {
        value = input.required<string>();
      }

      @Component({
        imports: [ChildDirective],
        template: `
          @if (show) {
            <div [value]="'value'"></div>
          }
        `,
      })
      class TestComponent {
        show = true;
        child = viewChild(ChildDirective);
        childValue$ = toObservable(computed(() => this.child()?.value()));
        value: string | undefined;

        constructor() {
          this.childValue$.subscribe((value) => (this.value = value));
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(fixture.componentInstance.value).toBe('value');
    });
  });

  describe('query timing matrix', () => {
    it('should support the original minimal viewChild + computed template repro from the issue', () => {
      @Directive({selector: '[value]'})
      class ChildDirective {
        value = input.required<string>();
      }

      @Component({
        imports: [ChildDirective],
        template: `
          @if (true) {
            <div [value]="'minimal-repro'"></div>
          }
          {{ childValue() }}
        `,
      })
      class TestComponent {
        child = viewChild(ChildDirective);
        childValue = computed(() => this.child()?.value());
      }

      const fixture = TestBed.createComponent(TestComponent);
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(fixture.nativeElement.textContent).toContain('minimal-repro');
    });

    it('should not expose viewChildren results before required inputs are set in embedded views', () => {
      @Directive({selector: '[value]'})
      class DirectiveWithRequiredInput {
        value = input.required<string>();
      }

      @Component({
        imports: [DirectiveWithRequiredInput],
        template: `
          @if (show) {
            <div [value]="'viewChildren-value'"></div>
          }
        `,
      })
      class TestComponent {
        show = true;
        children = viewChildren(DirectiveWithRequiredInput);
        value$ = toObservable(computed(() => this.children()[0]?.value()));
        value: string | undefined;

        constructor() {
          this.value$.subscribe((value) => (this.value = value));
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(fixture.componentInstance.value).toBe('viewChildren-value');
    });

    it('should not expose contentChild results before required inputs are set in embedded views', () => {
      @Directive({selector: '[value]'})
      class DirectiveWithRequiredInput {
        value = input.required<string>();
      }

      @Component({
        selector: 'query-cmp',
        template: `<ng-content />`,
      })
      class QueryComponent {
        result = contentChild(DirectiveWithRequiredInput);
        value$ = toObservable(computed(() => this.result()?.value()));
        value: string | undefined;

        constructor() {
          this.value$.subscribe((value) => (this.value = value));
        }
      }

      @Component({
        imports: [QueryComponent, DirectiveWithRequiredInput],
        template: `
          <query-cmp>
            @if (show) {
              <div [value]="'contentChild-direct'"></div>
            }
          </query-cmp>
        `,
      })
      class TestComponent {
        show = true;
      }

      const fixture = TestBed.createComponent(TestComponent);
      expect(() => fixture.detectChanges()).not.toThrow();
      const queryComponent = fixture.debugElement.query(By.directive(QueryComponent))
        .componentInstance as QueryComponent;
      expect(queryComponent.value).toBe('contentChild-direct');
    });

    it('should not expose contentChildren results before required inputs are set in embedded views', () => {
      @Directive({selector: '[value]'})
      class DirectiveWithRequiredInput {
        value = input.required<string>();
      }

      @Component({
        selector: 'query-cmp',
        template: `<ng-content />`,
      })
      class QueryComponent {
        result = contentChildren(DirectiveWithRequiredInput);
        value$ = toObservable(computed(() => this.result()[0]?.value()));
        value: string | undefined;

        constructor() {
          this.value$.subscribe((value) => (this.value = value));
        }
      }

      @Component({
        imports: [QueryComponent, DirectiveWithRequiredInput],
        template: `
          <query-cmp>
            @if (show) {
              <div [value]="'contentChildren-direct'"></div>
            }
          </query-cmp>
        `,
      })
      class TestComponent {
        show = true;
      }

      const fixture = TestBed.createComponent(TestComponent);
      expect(() => fixture.detectChanges()).not.toThrow();
      const queryComponent = fixture.debugElement.query(By.directive(QueryComponent))
        .componentInstance as QueryComponent;
      expect(queryComponent.value).toBe('contentChildren-direct');
    });

    it('should not expose @for-created contentChildren results before required inputs are set', () => {
      @Component({
        selector: 'child-cmp',
        template: ``,
      })
      class ChildComponent {
        value = input.required<string>();
      }

      @Component({
        selector: 'parent-cmp',
        template: `<ng-content />`,
      })
      class ParentComponent {
        children = contentChildren(ChildComponent);
        firstValue$ = toObservable(computed(() => this.children()[0]?.value()));
        firstValue: string | undefined;

        constructor() {
          this.firstValue$.subscribe((value) => (this.firstValue = value));
        }
      }

      @Component({
        imports: [ParentComponent, ChildComponent],
        template: `
          <parent-cmp>
            @for (value of values; track value) {
              <child-cmp [value]="value" />
            }
          </parent-cmp>
        `,
      })
      class TestComponent {
        values = ['a', 'b', 'c'];
      }

      const fixture = TestBed.createComponent(TestComponent);
      expect(() => fixture.detectChanges()).not.toThrow();
      const parent = fixture.debugElement.query(By.directive(ParentComponent))
        .componentInstance as ParentComponent;
      expect(parent.firstValue).toBe('a');
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
