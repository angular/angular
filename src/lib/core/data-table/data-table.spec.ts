import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {CdkTable} from './data-table';
import {CollectionViewer, DataSource} from './data-source';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {customMatchers} from '../testing/jasmine-matchers';
import {CdkDataTableModule} from './index';

describe('CdkTable', () => {
  let fixture: ComponentFixture<SimpleCdkTableApp>;

  let component: SimpleCdkTableApp;
  let dataSource: FakeDataSource;
  let table: CdkTable<any>;
  let tableElement: HTMLElement;

  beforeEach(async(() => {
    jasmine.addMatchers(customMatchers);
    jasmine.addMatchers(tableCustomMatchers);

    TestBed.configureTestingModule({
      imports: [CdkDataTableModule],
      declarations: [SimpleCdkTableApp],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleCdkTableApp);

    component = fixture.componentInstance;
    dataSource = component.dataSource as FakeDataSource;
    table = component.table;
    tableElement = fixture.nativeElement.querySelector('cdk-table');

    fixture.detectChanges();  // Let the component and table create embedded views
    fixture.detectChanges();  // Let the cells render
  }));

  describe('should initialize', () => {
    it('with a connected data source', () => {
      expect(table.dataSource).toBe(dataSource);
      expect(dataSource.isConnected).toBe(true);
    });

    it('with a rendered header with the right number of header cells', () => {
      const header = getHeaderRow(tableElement);

      expect(header).not.toBe(undefined);
      expect(header.classList).toContain('customHeaderRowClass');
      expect(getHeaderCells(tableElement).length).toBe(component.columnsToRender.length);
    });

    it('with rendered rows with right number of row cells', () => {
      const rows = getRows(tableElement);

      expect(rows.length).toBe(dataSource.data.length);
      rows.forEach(row => {
        expect(row.classList).toContain('customRowClass');
        expect(getCells(row).length).toBe(component.columnsToRender.length);
      });
    });

    it('with column class names provided to header and data row cells', () => {
      getHeaderCells(tableElement).forEach((headerCell, index) => {
        expect(headerCell.classList).toContain(`cdk-column-${component.columnsToRender[index]}`);
      });

      getRows(tableElement).forEach(row => {
        getCells(row).forEach((cell, index) => {
          expect(cell.classList).toContain(`cdk-column-${component.columnsToRender[index]}`);
        });
      });
    });

    it('with the right accessibility roles', () => {
      expect(tableElement).toBeRole('grid');

      expect(getHeaderRow(tableElement)).toBeRole('row');
      getHeaderCells(tableElement).forEach(cell => expect(cell).toBeRole('columnheader'));

      getRows(tableElement).forEach(row => {
        expect(row).toBeRole('row');
        getCells(row).forEach(cell => expect(cell).toBeRole('gridcell'));
      });
    });
  });

  it('should re-render the rows when the data changes', () => {
    dataSource.addData();
    fixture.detectChanges();

    expect(getRows(tableElement).length).toBe(dataSource.data.length);

    // Check that the number of cells is correct
    getRows(tableElement).forEach(row => {
      expect(getCells(row).length).toBe(component.columnsToRender.length);
    });
  });

  it('should use differ to add/remove/move rows', () => {
    // Each row receives an attribute 'initialIndex' the element's original place
    getRows(tableElement).forEach((row: Element, index: number) => {
      row.setAttribute('initialIndex', index.toString());
    });

    // Prove that the attributes match their indicies
    const initialRows = getRows(tableElement);
    expect(initialRows[0].getAttribute('initialIndex')).toBe('0');
    expect(initialRows[1].getAttribute('initialIndex')).toBe('1');
    expect(initialRows[2].getAttribute('initialIndex')).toBe('2');

    // Swap first and second data in data array
    const copiedData = component.dataSource.data.slice();
    const temp = copiedData[0];
    copiedData[0] = copiedData[1];
    copiedData[1] = temp;

    // Remove the third element
    copiedData.splice(2, 1);

    // Add new data
    component.dataSource.data = copiedData;
    component.dataSource.addData();

    // Expect that the first and second rows were swapped and that the last row is new
    const changedRows = getRows(tableElement);
    expect(changedRows.length).toBe(3);
    expect(changedRows[0].getAttribute('initialIndex')).toBe('1');
    expect(changedRows[1].getAttribute('initialIndex')).toBe('0');
    expect(changedRows[2].getAttribute('initialIndex')).toBe(null);
  });

  // TODO(andrewseguin): Add test for dynamic classes on header/rows

  it('should match the right table content with dynamic data', () => {
    const initialDataLength = dataSource.data.length;
    expect(dataSource.data.length).toBe(3);
    const headerContent = ['Column A', 'Column B', 'Column C'];

    const initialTableContent = [headerContent];
    dataSource.data.forEach(rowData => initialTableContent.push([rowData.a, rowData.b, rowData.c]));
    expect(tableElement).toMatchTableContent(initialTableContent);

    // Add data to the table and recreate what the rendered output should be.
    dataSource.addData();
    expect(dataSource.data.length).toBe(initialDataLength + 1); // Make sure data was added
    fixture.detectChanges();
    fixture.detectChanges();

    const changedTableContent = [headerContent];
    dataSource.data.forEach(rowData => changedTableContent.push([rowData.a, rowData.b, rowData.c]));
    expect(tableElement).toMatchTableContent(changedTableContent);
  });
});

interface TestData {
  a: string;
  b: string;
  c: string;
}

class FakeDataSource extends DataSource<TestData> {
  isConnected = false;

  _dataChange = new BehaviorSubject<TestData[]>([]);
  set data(data: TestData[]) { this._dataChange.next(data); }
  get data() { return this._dataChange.getValue(); }

  constructor() {
    super();
    for (let i = 0; i < 3; i++) { this.addData(); }
  }

  connect(collectionViewer: CollectionViewer): Observable<TestData[]> {
    this.isConnected = true;
    const streams = [collectionViewer.viewChanged, this._dataChange];
    return Observable.combineLatest(streams).map((results: any[]) => {
      const [view, data] = results;
      return data;
    });
  }

  addData() {
    const nextIndex = this.data.length + 1;

    let copiedData = this.data.slice();
    copiedData.push({
      a: `a_${nextIndex}`,
      b: `b_${nextIndex}`,
      c: `c_${nextIndex}`
    });

    this.data = copiedData;
  }
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column B</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}}</cdk-cell>
      </ng-container>

      <cdk-header-row class="customHeaderRowClass"
                      *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row class="customRowClass"
               *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class SimpleCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRow(tableElement: Element): Element {
  return tableElement.querySelector('.cdk-header-row');
}

function getRows(tableElement: Element): Element[] {
  return getElements(tableElement, '.cdk-row');
}
function getCells(row: Element): Element[] {
  return row ? getElements(row, '.cdk-cell') : [];
}

function getHeaderCells(tableElement: Element): Element[] {
  return getElements(getHeaderRow(tableElement), '.cdk-header-cell');
}

const tableCustomMatchers: jasmine.CustomMatcherFactories = {
  toMatchTableContent: function(util, customEqualityTesters) {
    return {
      compare: function (tableElement: Element, expectedTableContent: any[]) {
        const missedExpectations = [];
        function checkCellContent(cell: Element, expectedTextContent: string) {
          const actualTextContent = cell.textContent.trim();
          if (actualTextContent !== expectedTextContent) {
            missedExpectations.push(
                `Expected cell contents to be ${expectedTextContent} but was ${actualTextContent}`);
          }
        }

        // Check header cells
        const expectedHeaderContent = expectedTableContent.shift();
        getHeaderCells(tableElement).forEach((cell, index) => {
          return checkCellContent(cell, expectedHeaderContent[index]);
        });

        // Check data row cells
        getRows(tableElement).forEach((row, rowIndex) => {
          getCells(row).forEach((cell, cellIndex) => {
            checkCellContent(cell, expectedTableContent[rowIndex][cellIndex]);
          });
        });

        if (missedExpectations.length) {
          return {
            pass: false,
            message: missedExpectations.join('\n')
          };
        }

        return {
          pass: true,
          message: 'Table contained the right content'
        };
      }
    };
  }
};
