import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {CdkTableModule} from '@angular/cdk/table';
import {dispatchMouseEvent, wrappedErrorMessage} from '@angular/cdk/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operator/map';
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
    expect(sortables.get('defaultSortHeaderA')).toBe(component.matSortHeaderDefaultA);
    expect(sortables.get('defaultSortHeaderB')).toBe(component.matSortHeaderDefaultB);

    fixture.destroy();
    expect(sortables.size).toBe(0);
  });

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

  it('should reset sort direction when a different column is sorted', () => {
    component.sort('defaultSortHeaderA');
    expect(component.matSort.active).toBe('defaultSortHeaderA');
    expect(component.matSort.direction).toBe('asc');

    component.sort('defaultSortHeaderA');
    expect(component.matSort.active).toBe('defaultSortHeaderA');
    expect(component.matSort.direction).toBe('desc');

    component.sort('defaultSortHeaderB');
    expect(component.matSort.active).toBe('defaultSortHeaderB');
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
    const button = fixture.nativeElement.querySelector('#defaultSortHeaderA button');
    expect(button.getAttribute('aria-label')).toBe('Change sorting for defaultSortHeaderA');
  });

  it('should re-render when the i18n labels have changed',
    inject([MatSortHeaderIntl], (intl: MatSortHeaderIntl) => {
      const header = fixture.debugElement.query(By.directive(MatSortHeader)).nativeElement;
      const button = header.querySelector('.mat-sort-header-button');

      intl.sortButtonLabel = () => 'Sort all of the things';
      intl.changes.next();
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Sort all of the things');
    }));
});

/**
 * Performs a sequence of sorting on a single column to see if the sort directions are
 * consistent with expectations. Detects any changes in the fixture to reflect any changes in
 * the inputs and resets the MatSort to remove any side effects from previous tests.
 */
function testSingleColumnSortDirectionSequence(fixture: ComponentFixture<SimpleMatSortApp>,
                                               expectedSequence: SortDirection[],
                                               id: string = 'defaultSortHeaderA') {
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

@Component({
  template: `
    <div matSort
         [matSortActive]="active"
         [matSortStart]="start"
         [matSortDirection]="direction"
         [matSortDisableClear]="disableClear"
         (matSortChange)="latestSortEvent = $event">
      <div id="defaultSortHeaderA" #defaultSortHeaderA mat-sort-header="defaultSortHeaderA">
        A
      </div>
      <div id="defaultSortHeaderB" #defaultSortHeaderB mat-sort-header="defaultSortHeaderB">
        B
      </div>
      <div id="overrideStart" mat-sort-header="overrideStart" start="desc"> D </div>
      <div id="overrideDisableClear" mat-sort-header="overrideDisableClear" disableClear> E </div>
    </div>
  `
})
class SimpleMatSortApp {
  latestSortEvent: Sort;

  active: string;
  start: SortDirection = 'asc';
  direction: SortDirection = '';
  disableClear: boolean;

  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild('defaultSortHeaderA') matSortHeaderDefaultA: MatSortHeader;
  @ViewChild('defaultSortHeaderB') matSortHeaderDefaultB: MatSortHeader;

  constructor (public elementRef: ElementRef) { }

  sort(id: string) {
    const sortElement = this.elementRef.nativeElement.querySelector(`#${id}`);
    dispatchMouseEvent(sortElement, 'click');
  }
}


class FakeDataSource extends DataSource<any> {
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return map.call(collectionViewer.viewChange, () => []);
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
