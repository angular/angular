import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MdSort, MdSortHeader, Sort, SortDirection, MdSortModule, MdSortHeaderIntl} from './index';
import {DataSource, CollectionViewer} from '@angular/cdk/collections';
import {CdkTableModule} from '@angular/cdk/table';
import {Observable} from 'rxjs/Observable';
import {
  getMdSortDuplicateMdSortableIdError,
  getMdSortHeaderMissingIdError,
  getMdSortHeaderNotContainedWithinMdSortError
} from './sort-errors';
import {wrappedErrorMessage, dispatchMouseEvent} from '@angular/cdk/testing';
import {map} from '../core/rxjs/index';
import {MdTableModule} from '../table/index';

describe('MdSort', () => {
  let fixture: ComponentFixture<SimpleMdSortApp>;

  let component: SimpleMdSortApp;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSortModule, MdTableModule, CdkTableModule, NoopAnimationsModule],
      declarations: [
        SimpleMdSortApp,
        CdkTableMdSortApp,
        MdTableMdSortApp,
        MdSortHeaderMissingMdSortApp,
        MdSortDuplicateMdSortableIdsApp,
        MdSortableMissingIdApp
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMdSortApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have the sort headers register and deregister themselves', () => {
    const sortables = component.mdSort.sortables;
    expect(sortables.size).toBe(4);
    expect(sortables.get('defaultSortHeaderA')).toBe(component.mdSortHeaderDefaultA);
    expect(sortables.get('defaultSortHeaderB')).toBe(component.mdSortHeaderDefaultB);

    fixture.destroy();
    expect(sortables.size).toBe(0);
  });

  it('should use the column definition if used within a cdk table', () => {
    let cdkTableMdSortAppFixture = TestBed.createComponent(CdkTableMdSortApp);
    let cdkTableMdSortAppComponent = cdkTableMdSortAppFixture.componentInstance;

    cdkTableMdSortAppFixture.detectChanges();
    cdkTableMdSortAppFixture.detectChanges();

    const sortables = cdkTableMdSortAppComponent.mdSort.sortables;
    expect(sortables.size).toBe(3);
    expect(sortables.has('column_a')).toBe(true);
    expect(sortables.has('column_b')).toBe(true);
    expect(sortables.has('column_c')).toBe(true);
  });

  it('should use the column definition if used within an md table', () => {
    let mdTableMdSortAppFixture = TestBed.createComponent(MdTableMdSortApp);
    let mdTableMdSortAppComponent = mdTableMdSortAppFixture.componentInstance;

    mdTableMdSortAppFixture.detectChanges();
    mdTableMdSortAppFixture.detectChanges();

    const sortables = mdTableMdSortAppComponent.mdSort.sortables;
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
    expect(component.mdSort.active).toBe('defaultSortHeaderA');
    expect(component.mdSort.direction).toBe('asc');

    component.sort('defaultSortHeaderA');
    expect(component.mdSort.active).toBe('defaultSortHeaderA');
    expect(component.mdSort.direction).toBe('desc');

    component.sort('defaultSortHeaderB');
    expect(component.mdSort.active).toBe('defaultSortHeaderB');
    expect(component.mdSort.direction).toBe('asc');
  });

  it('should throw an error if an MdSortable is not contained within an MdSort directive', () => {
    expect(() => TestBed.createComponent(MdSortHeaderMissingMdSortApp).detectChanges())
        .toThrowError(wrappedErrorMessage(getMdSortHeaderNotContainedWithinMdSortError()));
  });

  it('should throw an error if two MdSortables have the same id', () => {
    expect(() => TestBed.createComponent(MdSortDuplicateMdSortableIdsApp).detectChanges())
        .toThrowError(wrappedErrorMessage(getMdSortDuplicateMdSortableIdError('duplicateId')));
  });

  it('should throw an error if an MdSortable is missing an id', () => {
    expect(() => TestBed.createComponent(MdSortableMissingIdApp).detectChanges())
        .toThrowError(wrappedErrorMessage(getMdSortHeaderMissingIdError()));
  });

  it('should allow let MdSortable override the default sort parameters', () => {
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
    inject([MdSortHeaderIntl], (intl: MdSortHeaderIntl) => {
      const header = fixture.debugElement.query(By.directive(MdSortHeader)).nativeElement;
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
 * the inputs and resets the MdSort to remove any side effects from previous tests.
 */
function testSingleColumnSortDirectionSequence(fixture: ComponentFixture<SimpleMdSortApp>,
                                               expectedSequence: SortDirection[],
                                               id: string = 'defaultSortHeaderA') {
  // Detect any changes that were made in preparation for this sort sequence
  fixture.detectChanges();

  // Reset the md sort to make sure there are no side affects from previous tests
  const component = fixture.componentInstance;
  component.mdSort.active = '';
  component.mdSort.direction = '';

  // Run through the sequence to confirm the order
  let actualSequence = expectedSequence.map(() => {
    component.sort(id);

    // Check that the sort event's active sort is consistent with the MdSort
    expect(component.mdSort.active).toBe(id);
    expect(component.latestSortEvent.active).toBe(id);

    // Check that the sort event's direction is consistent with the MdSort
    expect(component.mdSort.direction).toBe(component.latestSortEvent.direction);
    return component.mdSort.direction;
  });
  expect(actualSequence).toEqual(expectedSequence);

  // Expect that performing one more sort will loop it back to the beginning.
  component.sort(id);
  expect(component.mdSort.direction).toBe(expectedSequence[0]);
}

@Component({
  template: `
    <div mdSort
         [mdSortActive]="active"
         [mdSortStart]="start"
         [mdSortDirection]="direction"
         [mdSortDisableClear]="disableClear"
         (mdSortChange)="latestSortEvent = $event">
      <div id="defaultSortHeaderA" #defaultSortHeaderA md-sort-header="defaultSortHeaderA"> A </div>
      <div id="defaultSortHeaderB" #defaultSortHeaderB md-sort-header="defaultSortHeaderB"> B </div>
      <div id="overrideStart" md-sort-header="overrideStart" start="desc"> D </div>
      <div id="overrideDisableClear" md-sort-header="overrideDisableClear" disableClear> E </div>
    </div>
  `
})
class SimpleMdSortApp {
  latestSortEvent: Sort;

  active: string;
  start: SortDirection = 'asc';
  direction: SortDirection = '';
  disableClear: boolean;

  @ViewChild(MdSort) mdSort: MdSort;
  @ViewChild('defaultSortHeaderA') mdSortHeaderDefaultA: MdSortHeader;
  @ViewChild('defaultSortHeaderB') mdSortHeaderDefaultB: MdSortHeader;

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
    <cdk-table [dataSource]="dataSource" mdSort>
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderA md-sort-header> Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderB md-sort-header> Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderC md-sort-header> Column C </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}} </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CdkTableMdSortApp {
  @ViewChild(MdSort) mdSort: MdSort;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}

@Component({
  template: `
    <md-table [dataSource]="dataSource" mdSort>
      <ng-container mdColumnDef="column_a">
        <md-header-cell *mdHeaderCellDef #sortHeaderA md-sort-header> Column A </md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.a}} </md-cell>
      </ng-container>

      <ng-container mdColumnDef="column_b">
        <md-header-cell *mdHeaderCellDef #sortHeaderB md-sort-header> Column B </md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.b}} </md-cell>
      </ng-container>

      <ng-container mdColumnDef="column_c">
        <md-header-cell *mdHeaderCellDef #sortHeaderC md-sort-header> Column C </md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.c}} </md-cell>
      </ng-container>

      <md-header-row *mdHeaderRowDef="columnsToRender"></md-header-row>
      <md-row *mdRowDef="let row; columns: columnsToRender"></md-row>
    </md-table>
  `
})
class MdTableMdSortApp {
  @ViewChild(MdSort) mdSort: MdSort;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}


@Component({
  template: `<div md-sort-header="a"> A </div>`
})
class MdSortHeaderMissingMdSortApp { }


@Component({
  template: `
    <div mdSort>
      <div md-sort-header="duplicateId"> A </div>
      <div md-sort-header="duplicateId"> A </div>
    </div>
  `
})
class MdSortDuplicateMdSortableIdsApp { }


@Component({
  template: `
    <div mdSort>
      <div md-sort-header> A </div>
    </div>
  `
})
class MdSortableMissingIdApp { }
