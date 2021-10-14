import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Component, Type, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {CdkTable, CdkTableModule} from '@angular/cdk/table';
import {Platform} from '@angular/cdk/platform';

import {CdkTableScrollContainerModule} from './index';

describe('CdkTableScrollContainer', () => {
  let fixture: ComponentFixture<any>;
  let component: any;
  let platform: Platform;
  let tableElement: HTMLElement;
  let scrollerElement: HTMLElement;
  let dataRows: HTMLElement[];
  let headerRows: HTMLElement[];
  let footerRows: HTMLElement[];

  function createComponent<T>(
    componentType: Type<T>,
    declarations: any[] = [],
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [CdkTableModule, CdkTableScrollContainerModule],
      declarations: [componentType, ...declarations],
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  function setupTableTestApp(componentType: Type<any>, declarations: any[] = []) {
    fixture = createComponent(componentType, declarations);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tableElement = fixture.nativeElement.querySelector('.cdk-table');
    scrollerElement = fixture.nativeElement.querySelector('.cdk-table-scroll-container');
  }

  beforeEach(() => {
    setupTableTestApp(StickyNativeLayoutCdkTableApp);

    platform = TestBed.inject(Platform);

    headerRows = getHeaderRows(tableElement);
    footerRows = getFooterRows(tableElement);
    dataRows = getRows(tableElement);
  });

  it('sets scrollbar track margin for sticky headers', fakeAsync(() => {
    component.stickyHeaders = ['header-1', 'header-3'];
    fixture.detectChanges();
    flushMicrotasks();

    if (platform.FIREFOX) {
      // ::-webkit-scrollbar-track is not recognized by Firefox.
      return;
    }

    const scrollerStyle = window.getComputedStyle(scrollerElement, '::-webkit-scrollbar-track');
    expect(scrollerStyle.getPropertyValue('margin-top')).toBe(`${headerRows[0].offsetHeight}px`);
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');

    component.stickyHeaders = [];
    fixture.detectChanges();
    flushMicrotasks();

    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');
  }));

  it('sets scrollbar track margin for sticky footers', fakeAsync(() => {
    component.stickyFooters = ['footer-1', 'footer-3'];
    fixture.detectChanges();
    flushMicrotasks();

    if (platform.FIREFOX) {
      // ::-webkit-scrollbar-track is not recognized by Firefox.
      return;
    }

    const scrollerStyle = window.getComputedStyle(scrollerElement, '::-webkit-scrollbar-track');
    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe(`${footerRows[2].offsetHeight}px`);
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');

    component.stickyFooters = [];
    fixture.detectChanges();
    flushMicrotasks();

    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');
  }));

  it('sets scrollbar track margin for sticky start columns', fakeAsync(() => {
    component.stickyStartColumns = ['column-1', 'column-3'];
    fixture.detectChanges();
    flushMicrotasks();

    if (platform.FIREFOX) {
      // ::-webkit-scrollbar-track is not recognized by Firefox.
      return;
    }

    const scrollerStyle = window.getComputedStyle(scrollerElement, '::-webkit-scrollbar-track');
    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe(
      `${getCells(dataRows[0])[0].offsetWidth}px`,
    );

    component.stickyStartColumns = [];
    fixture.detectChanges();
    flushMicrotasks();

    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');
  }));

  it('sets scrollbar track margin for sticky end columns', fakeAsync(() => {
    component.stickyEndColumns = ['column-4', 'column-6'];
    fixture.detectChanges();
    flushMicrotasks();

    if (platform.FIREFOX) {
      // ::-webkit-scrollbar-track is not recognized by Firefox.
      return;
    }

    const scrollerStyle = window.getComputedStyle(scrollerElement, '::-webkit-scrollbar-track');
    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe(
      `${getCells(dataRows[0])[5].offsetWidth}px`,
    );
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');

    component.stickyEndColumns = [];
    fixture.detectChanges();
    flushMicrotasks();

    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');
  }));

  it('sets scrollbar track margin for a combination of sticky rows and columns', fakeAsync(() => {
    component.stickyHeaders = ['header-1'];
    component.stickyFooters = ['footer-3'];
    component.stickyStartColumns = ['column-1'];
    component.stickyEndColumns = ['column-6'];
    fixture.detectChanges();
    flushMicrotasks();

    if (platform.FIREFOX) {
      // ::-webkit-scrollbar-track is not recognized by Firefox.
      return;
    }

    const scrollerStyle = window.getComputedStyle(scrollerElement, '::-webkit-scrollbar-track');
    expect(scrollerStyle.getPropertyValue('margin-top')).toBe(`${headerRows[0].offsetHeight}px`);
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe(
      `${getCells(dataRows[0])[5].offsetWidth}px`,
    );
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe(`${footerRows[2].offsetHeight}px`);
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe(
      `${getCells(dataRows[0])[0].offsetWidth}px`,
    );

    component.stickyHeaders = [];
    component.stickyFooters = [];
    component.stickyStartColumns = [];
    component.stickyEndColumns = [];
    fixture.detectChanges();
    flushMicrotasks();

    expect(scrollerStyle.getPropertyValue('margin-top')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-right')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-bottom')).toBe('0px');
    expect(scrollerStyle.getPropertyValue('margin-left')).toBe('0px');
  }));
});

interface TestData {
  a: string;
  b: string;
  c: string;
}

class FakeDataSource extends DataSource<TestData> {
  isConnected = false;

  get data() {
    return this._dataChange.getValue();
  }
  set data(data: TestData[]) {
    this._dataChange.next(data);
  }
  _dataChange = new BehaviorSubject<TestData[]>([]);

  constructor() {
    super();
    for (let i = 0; i < 3; i++) {
      this.addData();
    }
  }

  connect(collectionViewer: CollectionViewer) {
    this.isConnected = true;
    return combineLatest([this._dataChange, collectionViewer.viewChange]).pipe(
      map(data => data[0]),
    );
  }

  disconnect() {
    this.isConnected = false;
  }

  addData() {
    const nextIndex = this.data.length + 1;

    let copiedData = this.data.slice();
    copiedData.push({
      a: `a_${nextIndex}`,
      b: `b_${nextIndex}`,
      c: `c_${nextIndex}`,
    });

    this.data = copiedData;
  }
}

@Component({
  template: `
    <div cdkTableScrollContainer>
    <table cdk-table [dataSource]="dataSource">
      <ng-container [cdkColumnDef]="column" *ngFor="let column of columns"
                    [sticky]="isStuck(stickyStartColumns, column)"
                    [stickyEnd]="isStuck(stickyEndColumns, column)">
        <th cdk-header-cell *cdkHeaderCellDef> Header {{column}} </th>
        <td cdk-cell *cdkCellDef="let row"> {{column}} </td>
        <td cdk-footer-cell *cdkFooterCellDef> Footer {{column}} </td>
      </ng-container>

      <tr cdk-header-row *cdkHeaderRowDef="columns; sticky: isStuck(stickyHeaders, 'header-1')">
      </tr>
      <tr cdk-header-row *cdkHeaderRowDef="columns; sticky: isStuck(stickyHeaders, 'header-2')">
      </tr>
      <tr cdk-header-row *cdkHeaderRowDef="columns; sticky: isStuck(stickyHeaders, 'header-3')">
      </tr>

      <tr cdk-row *cdkRowDef="let row; columns: columns"></tr>

      <tr cdk-footer-row *cdkFooterRowDef="columns; sticky: isStuck(stickyFooters, 'footer-1')">
      </tr>
      <tr cdk-footer-row *cdkFooterRowDef="columns; sticky: isStuck(stickyFooters, 'footer-2')">
      </tr>
      <tr cdk-footer-row *cdkFooterRowDef="columns; sticky: isStuck(stickyFooters, 'footer-3')">
      </tr>
    </table>
    </div>
  `,
  styles: [
    `
    .cdk-header-cell, .cdk-cell, .cdk-footer-cell {
      display: block;
      width: 20px;
      box-sizing: border-box;
    }
  `,
  ],
})
class StickyNativeLayoutCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columns = ['column-1', 'column-2', 'column-3', 'column-4', 'column-5', 'column-6'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;

  stickyHeaders: string[] = [];
  stickyFooters: string[] = [];
  stickyStartColumns: string[] = [];
  stickyEndColumns: string[] = [];

  isStuck(list: string[], id: string) {
    return list.indexOf(id) != -1;
  }
}

function getElements(element: Element, query: string): HTMLElement[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRows(tableElement: Element): HTMLElement[] {
  return [].slice.call(tableElement.querySelectorAll('.cdk-header-row'));
}

function getFooterRows(tableElement: Element): HTMLElement[] {
  return [].slice.call(tableElement.querySelectorAll('.cdk-footer-row'));
}

function getRows(tableElement: Element): HTMLElement[] {
  return getElements(tableElement, '.cdk-row');
}

function getCells(row: Element): HTMLElement[] {
  if (!row) {
    return [];
  }

  let cells = getElements(row, 'cdk-cell');
  if (!cells.length) {
    cells = getElements(row, 'td.cdk-cell');
  }

  return cells;
}
