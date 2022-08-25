import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTableModule} from '../module';
import {MatTableHarness} from './table-harness';

/** Shared tests to run on both the original and MDC-based table. */
export function runHarnessTests(
  tableModule: typeof MatTableModule,
  tableHarness: typeof MatTableHarness,
) {
  let fixture: ComponentFixture<TableHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [tableModule],
      declarations: [TableHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for a table', async () => {
    const tables = await loader.getAllHarnesses(tableHarness);
    expect(tables.length).toBe(1);
  });

  it('should get the different kinds of rows in the table', async () => {
    const table = await loader.getHarness(tableHarness);
    const headerRows = await table.getHeaderRows();
    const footerRows = await table.getFooterRows();
    const rows = await table.getRows();
    expect(headerRows.length).toBe(1);
    expect(footerRows.length).toBe(1);
    expect(rows.length).toBe(10);
  });

  it('should get cells inside a row', async () => {
    const table = await loader.getHarness(tableHarness);
    const headerRows = await table.getHeaderRows();
    const footerRows = await table.getFooterRows();
    const rows = await table.getRows();
    const headerCells = (await parallel(() => headerRows.map(row => row.getCells()))).map(
      row => row.length,
    );
    const footerCells = (await parallel(() => footerRows.map(row => row.getCells()))).map(
      row => row.length,
    );
    const cells = (await parallel(() => rows.map(row => row.getCells()))).map(row => row.length);

    expect(headerCells).toEqual([4]);
    expect(cells).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(footerCells).toEqual([4]);
  });

  it('should be able to get the text of a cell', async () => {
    const table = await loader.getHarness(tableHarness);
    const secondRow = (await table.getRows())[1];
    const cells = await secondRow.getCells();
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual(['2', 'Helium', '4.0026', 'He']);
  });

  it('should be able to get the column name of a cell', async () => {
    const table = await loader.getHarness(tableHarness);
    const fifthRow = (await table.getRows())[1];
    const cells = await fifthRow.getCells();
    const cellColumnNames = await parallel(() => cells.map(cell => cell.getColumnName()));
    expect(cellColumnNames).toEqual(['position', 'name', 'weight', 'symbol']);
  });

  it('should be able to filter cells by text', async () => {
    const table = await loader.getHarness(tableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({text: '1.0079'});
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual(['1.0079']);
  });

  it('should be able to filter cells by column name', async () => {
    const table = await loader.getHarness(tableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({columnName: 'symbol'});
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual(['H']);
  });

  it('should be able to filter cells by regex', async () => {
    const table = await loader.getHarness(tableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({text: /^H/});
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual(['Hydrogen', 'H']);
  });

  it('should be able to get the table text organized by columns', async () => {
    const table = await loader.getHarness(tableHarness);
    const text = await table.getCellTextByColumnName();

    expect(text).toEqual({
      position: {
        headerText: ['No.'],
        footerText: ['Number of the element'],
        text: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      },
      name: {
        headerText: ['Name'],
        footerText: ['Name of the element'],
        text: [
          'Hydrogen',
          'Helium',
          'Lithium',
          'Beryllium',
          'Boron',
          'Carbon',
          'Nitrogen',
          'Oxygen',
          'Fluorine',
          'Neon',
        ],
      },
      weight: {
        headerText: ['Weight'],
        footerText: ['Weight of the element'],
        text: [
          '1.0079',
          '4.0026',
          '6.941',
          '9.0122',
          '10.811',
          '12.0107',
          '14.0067',
          '15.9994',
          '18.9984',
          '20.1797',
        ],
      },
      symbol: {
        headerText: ['Symbol'],
        footerText: ['Symbol of the element'],
        text: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
      },
    });
  });

  it('should be able to get the table text organized by rows', async () => {
    const table = await loader.getHarness(tableHarness);
    const text = await table.getCellTextByIndex();

    expect(text).toEqual([
      ['1', 'Hydrogen', '1.0079', 'H'],
      ['2', 'Helium', '4.0026', 'He'],
      ['3', 'Lithium', '6.941', 'Li'],
      ['4', 'Beryllium', '9.0122', 'Be'],
      ['5', 'Boron', '10.811', 'B'],
      ['6', 'Carbon', '12.0107', 'C'],
      ['7', 'Nitrogen', '14.0067', 'N'],
      ['8', 'Oxygen', '15.9994', 'O'],
      ['9', 'Fluorine', '18.9984', 'F'],
      ['10', 'Neon', '20.1797', 'Ne'],
    ]);
  });

  it('should be able to get the cell text in a row organized by index', async () => {
    const table = await loader.getHarness(tableHarness);
    const rows = await table.getRows();

    expect(rows.length).toBeGreaterThan(0);
    expect(await rows[0].getCellTextByIndex()).toEqual(['1', 'Hydrogen', '1.0079', 'H']);
  });

  it('should be able to get the cell text in a row organized by columns', async () => {
    const table = await loader.getHarness(tableHarness);
    const rows = await table.getRows();

    expect(rows.length).toBeGreaterThan(0);
    expect(await rows[0].getCellTextByColumnName()).toEqual({
      position: '1',
      name: 'Hydrogen',
      weight: '1.0079',
      symbol: 'H',
    });
  });
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="position">
        <th mat-header-cell *matHeaderCellDef>No.</th>
        <td mat-cell *matCellDef="let element">{{element.position}}</td>
        <td mat-footer-cell *matFooterCellDef>Number of the element</td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let element">{{element.name}}</td>
        <td mat-footer-cell *matFooterCellDef>Name of the element</td>
      </ng-container>

      <ng-container matColumnDef="weight">
        <th mat-header-cell *matHeaderCellDef>Weight</th>
        <td mat-cell *matCellDef="let element">{{element.weight}}</td>
        <td mat-footer-cell *matFooterCellDef>Weight of the element</td>
      </ng-container>

      <ng-container matColumnDef="symbol">
        <th mat-header-cell *matHeaderCellDef>Symbol</th>
        <td mat-cell *matCellDef="let element">{{element.symbol}}</td>
        <td mat-footer-cell *matFooterCellDef>Symbol of the element</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-footer-row *matFooterRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
})
class TableHarnessTest {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];
}
