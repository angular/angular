import {Component, DebugElement, Type, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatTable, MatTableModule} from './index';
import {CdkTable} from '@angular/cdk/table';

describe('MDC-based MatTable', () => {
  function createComponent<T>(component: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MatTableModule],
      declarations: [component],
    }).compileComponents();

    return TestBed.createComponent<T>(component);
  }

  describe('basic rendering', () => {
    let fixture: ComponentFixture<BasicTableExample>;
    let debugElement: DebugElement;
    let tableInstance: MatTable<any>;

    beforeEach(() => {
      fixture = createComponent(BasicTableExample);
      fixture.detectChanges();

      debugElement = fixture.debugElement.query(By.directive(CdkTable));
      tableInstance = debugElement.componentInstance;
    });

    it('should render', () => {
      expect(tableInstance).toBeTruthy();
    });
  });
});

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef> Column A</th>
        <td mat-cell *matCellDef="let row"> {{row.a}}</td>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <th mat-header-cell *matHeaderCellDef> Column B</th>
        <td mat-cell *matCellDef="let row"> {{row.b}}</td>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <th mat-header-cell *matHeaderCellDef> Column C</th>
        <td mat-cell *matCellDef="let row"> {{row.c}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
    </table>
  `,
})
class BasicTableExample {
  @ViewChild(MatTable) table: MatTable<any>;

  columnsToRender = ['column_a', 'column_b', 'column_c'];
  dataSource = [];
}
