import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {CdkTableModule} from '@angular/cdk/table';
import {
  createFakeEvent,
  createMouseEvent,
  dispatchMouseEvent,
  wrappedErrorMessage
} from '@angular/cdk/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {async, ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MatTableModule} from '../table/index';
import {
  MatSort,
  MatSortHeader,
  MatSortHeaderIntl,
  MatSortModule,
  Sort,
  SortDirection
} from './index';
import {
  getSortDuplicateSortableIdError,
  getSortHeaderMissingIdError,
  getSortHeaderNotContainedWithinSortError,
  getSortInvalidDirectionError,
} from './sort-errors';


describe('MatSort', () => {
  let fixture: ComponentFixture<SimpleMatSortApp>;
  let component: SimpleMatSortApp;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSortModule, MatTableModule, CdkTableModule, NoopAnimationsModule],
      declarations: [
        SimpleMatSortApp,
        CdkTableMatSortApp,
        MatTableMatSortApp,
        MatSortHeaderMissingMatSortApp,
        MatSortDuplicateMatSortableIdsApp,
        MatSortableMissingIdApp,
        MatSortableInvalidDirection
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMatSortApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have the sort headers register and deregister themselves', () => {
    const sortables = component.matSort.sortables;
    expect(sortables.size).toBe(4);
    expect(sortables.get('defaultA')).toBe(component.defaultA);
    expect(sortables.get('defaultB')).toBe(component.defaultB);

    fixture.destroy();
    expect(sortables.size).toBe(0);
  });

  it('should mark itself as initialized', fakeAsync(() => {
    let isMarkedInitialized = false;
    component.matSort.initialized.subscribe(() => isMarkedInitialized = true);

    tick();
    expect(isMarkedInitialized).toBeTruthy();
  }));

  it('should use the column definition if used within a cdk table', () => {
    let cdkTableMatSortAppFixture = TestBed.createComponent(CdkTableMatSortApp);
    let cdkTableMatSortAppComponent = cdkTableMatSortAppFixture.componentInstance;

    cdkTableMatSortAppFixture.detectChanges();
    cdkTableMatSortAppFixture.detectChanges();

    const sortables = cdkTableMatSortAppComponent.matSort.sortables;
    expect(sortables.size).toBe(3);
    expect(sortables.has('column_a')).toBe(true);
    expect(sortables.has('column_b')).toBe(true);
    expect(sortables.has('column_c')).toBe(true);
  });

  it('should use the column definition if used within an mat table', () => {
    let matTableMatSortAppFixture = TestBed.createComponent(MatTableMatSortApp);
    let matTableMatSortAppComponent = matTableMatSortAppFixture.componentInstance;

    matTableMatSortAppFixture.detectChanges();
    matTableMatSortAppFixture.detectChanges();

    const sortables = matTableMatSortAppComponent.matSort.sortables;
    expect(sortables.size).toBe(3);
    expect(sortables.has('column_a')).toBe(true);
    expect(sortables.has('column_b')).toBe(true);
    expect(sortables.has('column_c')).toBe(true);
  });

  describe('checking correct arrow direction and view state for its various states', () => {
    let expectedStates: Map<string, {viewState: string, arrowDirection: string}>;

    beforeEach(() => {
      // Starting state for the view and directions - note that overrideStart is reversed to be desc
      expectedStates = new Map<string, {viewState: string, arrowDirection: string}>([
        ['defaultA', {viewState: 'asc', arrowDirection: 'asc'}],
        ['defaultB', {viewState: 'asc', arrowDirection: 'asc'}],
        ['overrideStart', {viewState: 'desc', arrowDirection: 'desc'}],
        ['overrideDisableClear', {viewState: 'asc', arrowDirection: 'asc'}],
      ]);
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when mousing over headers and leaving on mouseleave', () => {
      // Mousing over the first sort should set the view state to hint (asc)
      component.dispatchMouseEvent('defaultA', 'mouseenter');
      expectedStates.set('defaultA', {viewState: 'asc-to-hint', arrowDirection: 'asc'});
      component.expectViewAndDirectionStates(expectedStates);

      // Mousing away from the first sort should hide the arrow
      component.dispatchMouseEvent('defaultA', 'mouseleave');
      expectedStates.set('defaultA', {viewState: 'hint-to-asc', arrowDirection: 'asc'});
      component.expectViewAndDirectionStates(expectedStates);

      // Mousing over another sort should set the view state to hint (desc)
      component.dispatchMouseEvent('overrideStart', 'mouseenter');
      expectedStates.set('overrideStart', {viewState: 'desc-to-hint', arrowDirection: 'desc'});
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when mousing over header and then sorting', () => {
      // Mousing over the first sort should set the view state to hint
      component.dispatchMouseEvent('defaultA', 'mouseenter');
      expectedStates.set('defaultA', {viewState: 'asc-to-hint', arrowDirection: 'asc'});
      component.expectViewAndDirectionStates(expectedStates);

      // Clicking sort on the header should set it to be active immediately
      // (since it was already hinted)
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-asc'});
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when cycling through a default sort header', () => {
      // Sort the header to set it to the active start state
      component.sort('defaultA');
      expectedStates.set('defaultA', {viewState: 'asc-to-active', arrowDirection: 'active-asc'});
      component.expectViewAndDirectionStates(expectedStates);

      // Sorting again will reverse its direction
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
      component.expectViewAndDirectionStates(expectedStates);

      // Sorting again will remove the sort and animate away the view
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {viewState: 'active-to-desc', arrowDirection: 'desc'});
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should not enter sort with animations if an animations is disabled', () => {
      // Sort the header to set it to the active start state
      component.defaultA._disableViewStateAnimation = true;
      component.sort('defaultA');
      expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-asc'});
      component.expectViewAndDirectionStates(expectedStates);

      // Sorting again will reverse its direction
      component.defaultA._disableViewStateAnimation = true;
      component.dispatchMouseEvent('defaultA', 'click');
      expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when sort has changed while a header is active', () => {
      // Sort the first header to set up
      component.sort('defaultA');
      expectedStates.set('defaultA', {viewState: 'asc-to-active', arrowDirection: 'active-asc'});
      component.expectViewAndDirectionStates(expectedStates);

      // Sort the second header and verify that the first header animated away
      component.dispatchMouseEvent('defaultB', 'click');
      expectedStates.set('defaultA', {viewState: 'active-to-asc', arrowDirection: 'asc'});
      expectedStates.set('defaultB', {viewState: 'asc-to-active', arrowDirection: 'active-asc'});
      component.expectViewAndDirectionStates(expectedStates);
    });

    it('should be correct when sort has been disabled', () => {
      // Mousing over the first sort should set the view state to hint
      component.disabledColumnSort = true;
      fixture.detectChanges();

      component.dispatchMouseEvent('defaultA', 'mouseenter');
      component.expectViewAndDirectionStates(expectedStates);
    });
  });

  it('should be able to cycle from asc -> desc from either start point', () => {
    component.disableClear = true;

    component.start = 'asc';
    testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc']);

    // Reverse directions
    component.start = 'desc';
    testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc']);
  });

  it('should be able to cycle asc -> desc -> [none]', () => {
    component.start = 'asc';
    testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc', '']);
  });

  it('should be able to cycle desc -> asc -> [none]', () => {
    component.start = 'desc';
    testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc', '']);
  });

  it('should allow for the cycling the sort direction to be disabled per column', () => {
    const button = fixture.nativeElement.querySelector('#defaultA button');

    component.sort('defaultA');
    expect(component.matSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBeFalsy();

    component.disabledColumnSort = true;
    fixture.detectChanges();

    component.sort('defaultA');
    expect(component.matSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBe('true');
  });

  it('should allow for the cycling the sort direction to be disabled for all columns', () => {
    const button = fixture.nativeElement.querySelector('#defaultA button');

    component.sort('defaultA');
    expect(component.matSort.active).toBe('defaultA');
    expect(component.matSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBeFalsy();

    component.disableAllSort = true;
    fixture.detectChanges();

    component.sort('defaultA');
    expect(component.matSort.active).toBe('defaultA');
    expect(component.matSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBe('true');

    component.sort('defaultB');
    expect(component.matSort.active).toBe('defaultA');
    expect(component.matSort.direction).toBe('asc');
    expect(button.getAttribute('disabled')).toBe('true');
  });

  it('should reset sort direction when a different column is sorted', () => {
    component.sort('defaultA');
    expect(component.matSort.active).toBe('defaultA');
    expect(component.matSort.direction).toBe('asc');

    component.sort('defaultA');
    expect(component.matSort.active).toBe('defaultA');
    expect(component.matSort.direction).toBe('desc');

    component.sort('defaultB');
    expect(component.matSort.active).toBe('defaultB');
    expect(component.matSort.direction).toBe('asc');
  });

  it('should throw an error if an MatSortable is not contained within an MatSort directive', () => {
    expect(() => TestBed.createComponent(MatSortHeaderMissingMatSortApp).detectChanges())
        .toThrowError(wrappedErrorMessage(getSortHeaderNotContainedWithinSortError()));
  });

  it('should throw an error if two MatSortables have the same id', () => {
    expect(() => TestBed.createComponent(MatSortDuplicateMatSortableIdsApp).detectChanges())
        .toThrowError(wrappedErrorMessage(getSortDuplicateSortableIdError('duplicateId')));
  });

  it('should throw an error if an MatSortable is missing an id', () => {
    expect(() => TestBed.createComponent(MatSortableMissingIdApp).detectChanges())
        .toThrowError(wrappedErrorMessage(getSortHeaderMissingIdError()));
  });

  it('should throw an error if the provided direction is invalid', () => {
    expect(() => TestBed.createComponent(MatSortableInvalidDirection).detectChanges())
        .toThrowError(wrappedErrorMessage(getSortInvalidDirectionError('ascending')));
  });

  it('should allow let MatSortable override the default sort parameters', () => {
    testSingleColumnSortDirectionSequence(
        fixture, ['asc', 'desc', '']);

    testSingleColumnSortDirectionSequence(
        fixture, ['desc', 'asc', ''], 'overrideStart');

    testSingleColumnSortDirectionSequence(
        fixture, ['asc', 'desc'], 'overrideDisableClear');
  });

  it('should apply the aria-labels to the button', () => {
    const button = fixture.nativeElement.querySelector('#defaultA button');
    expect(button.getAttribute('aria-label')).toBe('Change sorting for defaultA');
  });

  it('should toggle indicator hint on button focus/blur and hide on click', () => {
    const header = fixture.componentInstance.defaultA;
    const button = fixture.nativeElement.querySelector('#defaultA button');
    const focusEvent = createFakeEvent('focus');
    const blurEvent = createFakeEvent('blur');

    // Should start without a displayed hint
    expect(header._showIndicatorHint).toBeFalsy();

    // Focusing the button should show the hint, blurring should hide it
    button.dispatchEvent(focusEvent);
    expect(header._showIndicatorHint).toBeTruthy();

    button.dispatchEvent(blurEvent);
    expect(header._showIndicatorHint).toBeFalsy();

    // Show the indicator hint. On click the hint should be hidden
    button.dispatchEvent(focusEvent);
    expect(header._showIndicatorHint).toBeTruthy();

    header._handleClick();
    expect(header._showIndicatorHint).toBeFalsy();
  });

  it('should toggle indicator hint on mouseenter/mouseleave and hide on click', () => {
    const header = fixture.componentInstance.defaultA;
    const headerElement = fixture.nativeElement.querySelector('#defaultA');
    const mouseenterEvent = createMouseEvent('mouseenter');
    const mouseleaveEvent = createMouseEvent('mouseleave');

    // Should start without a displayed hint
    expect(header._showIndicatorHint).toBeFalsy();

    // Mouse enter should show the hint, blurring should hide it
    headerElement.dispatchEvent(mouseenterEvent);
    expect(header._showIndicatorHint).toBeTruthy();

    headerElement.dispatchEvent(mouseleaveEvent);
    expect(header._showIndicatorHint).toBeFalsy();

    // Show the indicator hint. On click the hint should be hidden
    headerElement.dispatchEvent(mouseenterEvent);
    expect(header._showIndicatorHint).toBeTruthy();

    header._handleClick();
    expect(header._showIndicatorHint).toBeFalsy();
  });

  it('should apply the aria-sort label to the header when sorted', () => {
    const sortHeaderElement = fixture.nativeElement.querySelector('#defaultA');
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe(null);

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe('ascending');

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe('descending');

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe(null);
  });

  it('should re-render when the i18n labels have changed',
    inject([MatSortHeaderIntl], (intl: MatSortHeaderIntl) => {
      const header = fixture.debugElement.query(By.directive(MatSortHeader)).nativeElement;
      const button = header.querySelector('.mat-sort-header-button');

      intl.sortButtonLabel = () => 'Sort all of the things';
      intl.changes.next();
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Sort all of the things');
    })
  );

  it('should not render the arrow if sorting is disabled for that column', fakeAsync(() => {
    const sortHeaderElement = fixture.nativeElement.querySelector('#defaultA');

    // Switch sorting to a different column before asserting.
    component.sort('defaultB');
    fixture.componentInstance.disabledColumnSort = true;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(sortHeaderElement.querySelector('.mat-sort-header-arrow')).toBeFalsy();
  }));

  it('should render the arrow if a disabled column is being sorted by', fakeAsync(() => {
    const sortHeaderElement = fixture.nativeElement.querySelector('#defaultA');

    component.sort('defaultA');
    fixture.componentInstance.disabledColumnSort = true;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(sortHeaderElement.querySelector('.mat-sort-header-arrow')).toBeTruthy();
  }));

});

/**
 * Performs a sequence of sorting on a single column to see if the sort directions are
 * consistent with expectations. Detects any changes in the fixture to reflect any changes in
 * the inputs and resets the MatSort to remove any side effects from previous tests.
 */
function testSingleColumnSortDirectionSequence(fixture: ComponentFixture<SimpleMatSortApp>,
                                               expectedSequence: SortDirection[],
                                               id: SimpleMatSortAppColumnIds = 'defaultA') {
  // Detect any changes that were made in preparation for this sort sequence
  fixture.detectChanges();

  // Reset the sort to make sure there are no side affects from previous tests
  const component = fixture.componentInstance;
  component.matSort.active = '';
  component.matSort.direction = '';

  // Run through the sequence to confirm the order
  let actualSequence = expectedSequence.map(() => {
    component.sort(id);

    // Check that the sort event's active sort is consistent with the MatSort
    expect(component.matSort.active).toBe(id);
    expect(component.latestSortEvent.active).toBe(id);

    // Check that the sort event's direction is consistent with the MatSort
    expect(component.matSort.direction).toBe(component.latestSortEvent.direction);
    return component.matSort.direction;
  });
  expect(actualSequence).toEqual(expectedSequence);

  // Expect that performing one more sort will loop it back to the beginning.
  component.sort(id);
  expect(component.matSort.direction).toBe(expectedSequence[0]);
}

/** Column IDs of the SimpleMatSortApp for typing of function params in the component (e.g. sort) */
type SimpleMatSortAppColumnIds = 'defaultA' | 'defaultB' | 'overrideStart' | 'overrideDisableClear';

@Component({
  template: `
    <div matSort
         [matSortActive]="active"
         [matSortDisabled]="disableAllSort"
         [matSortStart]="start"
         [matSortDirection]="direction"
         [matSortDisableClear]="disableClear"
         (matSortChange)="latestSortEvent = $event">
      <div id="defaultA"
           #defaultA
           mat-sort-header="defaultA"
           [disabled]="disabledColumnSort">
        A
      </div>
      <div id="defaultB"
           #defaultB
           mat-sort-header="defaultB">
        B
      </div>
      <div id="overrideStart"
           #overrideStart
           mat-sort-header="overrideStart" start="desc">
        D
      </div>
      <div id="overrideDisableClear"
           #overrideDisableClear
           mat-sort-header="overrideDisableClear"
           disableClear>
        E
      </div>
    </div>
  `
})
class SimpleMatSortApp {
  latestSortEvent: Sort;

  active: string;
  start: SortDirection = 'asc';
  direction: SortDirection = '';
  disableClear: boolean;
  disabledColumnSort = false;
  disableAllSort = false;

  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild('defaultA') defaultA: MatSortHeader;
  @ViewChild('defaultB') defaultB: MatSortHeader;
  @ViewChild('overrideStart') overrideStart: MatSortHeader;
  @ViewChild('overrideDisableClear') overrideDisableClear: MatSortHeader;

  constructor (public elementRef: ElementRef<HTMLElement>) { }

  sort(id: SimpleMatSortAppColumnIds) {
    this.dispatchMouseEvent(id, 'click');
  }

  dispatchMouseEvent(id: SimpleMatSortAppColumnIds, event: string) {
    const sortElement = this.elementRef.nativeElement.querySelector(`#${id}`)!;
    dispatchMouseEvent(sortElement, event);
  }

  /**
   * Checks expectations for each sort header's view state and arrow direction states. Receives a
   * map that is keyed by each sort header's ID and contains the expectation for that header's
   * states.
   */
  expectViewAndDirectionStates(
      viewStates: Map<string, {viewState: string, arrowDirection: string}>) {
    const sortHeaders = new Map([
      ['defaultA', this.defaultA],
      ['defaultB', this.defaultB],
      ['overrideStart', this.overrideStart],
      ['overrideDisableClear', this.overrideDisableClear]
    ]);

    viewStates.forEach((viewState, id) => {
      expect(sortHeaders.get(id)!._getArrowViewState()).toEqual(viewState.viewState);
      expect(sortHeaders.get(id)!._getArrowDirectionState()).toEqual(viewState.arrowDirection);
    });
  }
}


class FakeDataSource extends DataSource<any> {
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return collectionViewer.viewChange.pipe(map(() => []));
  }
  disconnect() {}
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" matSort>
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderA mat-sort-header> Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderB mat-sort-header> Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderC mat-sort-header> Column C </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}} </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CdkTableMatSortApp {
  @ViewChild(MatSort) matSort: MatSort;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}

@Component({
  template: `
    <mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="column_a">
        <mat-header-cell *matHeaderCellDef #sortHeaderA mat-sort-header> Column A </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.a}} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <mat-header-cell *matHeaderCellDef #sortHeaderB mat-sort-header> Column B </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.b}} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <mat-header-cell *matHeaderCellDef #sortHeaderC mat-sort-header> Column C </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.c}} </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="columnsToRender"></mat-header-row>
      <mat-row *matRowDef="let row; columns: columnsToRender"></mat-row>
    </mat-table>
  `
})
class MatTableMatSortApp {
  @ViewChild(MatSort) matSort: MatSort;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}


@Component({
  template: `<div mat-sort-header="a"> A </div>`
})
class MatSortHeaderMissingMatSortApp { }


@Component({
  template: `
    <div matSort>
      <div mat-sort-header="duplicateId"> A </div>
      <div mat-sort-header="duplicateId"> A </div>
    </div>
  `
})
class MatSortDuplicateMatSortableIdsApp { }


@Component({
  template: `
    <div matSort>
      <div mat-sort-header> A </div>
    </div>
  `
})
class MatSortableMissingIdApp { }


@Component({
  template: `
    <div matSort matSortDirection="ascending">
      <div mat-sort-header="a"> A </div>
    </div>
  `
})
class MatSortableInvalidDirection { }
