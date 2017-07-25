import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {MdTableModule} from './index';
import {MdTable} from './table';

describe('MdTable', () => {
  let fixture: ComponentFixture<SimpleMdTableApp>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTableModule],
      declarations: [SimpleMdTableApp],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMdTableApp);
    fixture.detectChanges();
    fixture.detectChanges();
  });

  it('should create a table with the right content', () => {
    const tableElement = fixture.nativeElement.querySelector('.mat-table');
    const headerRow = tableElement.querySelectorAll('.mat-header-cell');
    expectTextContent(headerRow[0], 'Column A');
    expectTextContent(headerRow[1], 'Column B');
    expectTextContent(headerRow[2], 'Column C');

    const rows = tableElement.querySelectorAll('.mat-row');
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('.mat-cell');
      expectTextContent(cells[0], `a_${i + 1}`);
      expectTextContent(cells[1], `b_${i + 1}`);
      expectTextContent(cells[2], `c_${i + 1}`);
    }
  });
});

function expectTextContent(el, text) {
  if (el && el.textContent) {
    expect(el.textContent.trim()).toBe(text);
  } else {
    fail(`Missing text content of ${text} in element ${el}`);
  }
}

interface TestData {
  a: string;
  b: string;
  c: string;
}

class FakeDataSource extends DataSource<TestData> {
  _dataChange = new BehaviorSubject<TestData[]>([]);
  set data(data: TestData[]) { this._dataChange.next(data); }
  get data() { return this._dataChange.getValue(); }

  constructor() {
    super();
    for (let i = 0; i < 3; i++) { this.addData(); }
  }

  connect(): Observable<TestData[]> {
    return this._dataChange;
  }

  disconnect() {}

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
    <md-table [dataSource]="dataSource">
      <ng-container mdColumnDef="column_a">
        <md-header-cell *mdHeaderCellDef> Column A</md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.a}}</md-cell>
      </ng-container>

      <ng-container mdColumnDef="column_b">
        <md-header-cell *mdHeaderCellDef> Column B</md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.b}}</md-cell>
      </ng-container>

      <ng-container mdColumnDef="column_c">
        <md-header-cell *mdHeaderCellDef> Column C</md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.c}}</md-cell>
      </ng-container>

      <md-header-row *mdHeaderRowDef="columnsToRender"></md-header-row>
      <md-row *mdRowDef="let row; columns: columnsToRender"></md-row>
    </md-table>
  `
})
class SimpleMdTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MdTable) table: MdTable<TestData>;
}

