import {async, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {MatTableModule} from './index';
import {MatTable} from './table';

describe('MatTable', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTableModule],
      declarations: [MatTableApp, MatTableWithWhenRowApp],
    }).compileComponents();
  }));

  it('should be able to create a table with the right content and without when row', () => {
    let fixture = TestBed.createComponent(MatTableApp);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mat-table');
    const headerRow = tableElement.querySelectorAll('.mat-header-cell');
    expectTextContent(headerRow[0], 'Column A');
    expectTextContent(headerRow[1], 'Column B');
    expectTextContent(headerRow[2], 'Column C');

    const rows = tableElement.querySelectorAll('.mat-row');

    // First three rows use columns ['column_a', 'column_b', 'column_c']
    for (let i = 0; i < 3; i++) {
      const cells = rows[i].querySelectorAll('.mat-cell');
      expectTextContent(cells[0], `a_${i + 1}`);
      expectTextContent(cells[1], `b_${i + 1}`);
      expectTextContent(cells[2], `c_${i + 1}`);
    }

    // Fourth row uses a special when predicate to show a different colummn
    expect(rows[3].textContent.trim()).toBe('fourth_row');
  });

  it('should create a table with special when row', () => {
    let fixture = TestBed.createComponent(MatTableWithWhenRowApp);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mat-table');
    const headerRow = tableElement.querySelectorAll('.mat-header-cell');
    expectTextContent(headerRow[0], 'Column A');

    const rows = tableElement.querySelectorAll('.mat-row');
    expect(rows[0].textContent.trim()).toBe('a_1');
    expect(rows[1].textContent.trim()).toBe('a_2');
    expect(rows[2].textContent.trim()).toBe('a_3');
    expect(rows[3].textContent.trim()).toBe('fourth_row');
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
    for (let i = 0; i < 4; i++) { this.addData(); }
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
    <mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <mat-header-cell *matHeaderCellDef> Column A</mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.a}}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <mat-header-cell *matHeaderCellDef> Column B</mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.b}}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <mat-header-cell *matHeaderCellDef> Column C</mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.c}}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="special_column">
        <mat-cell *matCellDef="let row"> fourth_row </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="columnsToRender"></mat-header-row>
      <mat-row *matRowDef="let row; columns: columnsToRender"></mat-row>
      <mat-row *matRowDef="let row; columns: ['special_column']; when: isFourthRow"></mat-row>
    </mat-table>
  `
})
class MatTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
  isFourthRow = (_rowData: TestData, i: number) => i == 3;

  @ViewChild(MatTable) table: MatTable<TestData>;
}


@Component({
  template: `
    <mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <mat-header-cell *matHeaderCellDef> Column A</mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.a}}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="special_column">
        <mat-cell *matCellDef="let row"> fourth_row </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="['column_a']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['column_a']"></mat-row>
      <mat-row *matRowDef="let row; columns: ['special_column']; when: isFourthRow"></mat-row>
    </mat-table>
  `
})
class MatTableWithWhenRowApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  isFourthRow = (_rowData: TestData, i: number) => i == 3;

  @ViewChild(MatTable) table: MatTable<TestData>;
}
