import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatTableHarness} from '@angular/material/table/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatTableModule} from '@angular/material/table';
import {TableHarnessExample} from './table-harness-example';

describe('TableHarnessExample', () => {
  let fixture: ComponentFixture<TableHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTableModule],
      declarations: [TableHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(TableHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for a table', async () => {
    const tables = await loader.getAllHarnesses(MatTableHarness);
    expect(tables.length).toBe(1);
  });

  it('should get the different kinds of rows in the table', async () => {
    const table = await loader.getHarness(MatTableHarness);
    const headerRows = await table.getHeaderRows();
    const footerRows = await table.getFooterRows();
    const rows = await table.getRows();
    expect(headerRows.length).toBe(1);
    expect(footerRows.length).toBe(1);
    expect(rows.length).toBe(10);
  });

  it('should get cells inside a row', async () => {
    const table = await loader.getHarness(MatTableHarness);
    const headerRows = await table.getHeaderRows();
    const footerRows = await table.getFooterRows();
    const rows = await table.getRows();
    const headerCells = (await parallel(() => headerRows.map(row => row.getCells())))
      .map(row => row.length);
    const footerCells = (await parallel(() => footerRows.map(row => row.getCells())))
      .map(row => row.length);
    const cells = (await parallel(() => rows.map(row => row.getCells())))
      .map(row => row.length);

    expect(headerCells).toEqual([4]);
    expect(cells).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(footerCells).toEqual([4]);
  });

  it('should be able to get the text of a cell', async () => {
    const table = await loader.getHarness(MatTableHarness);
    const secondRow = (await table.getRows())[1];
    const cells = await secondRow.getCells();
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual(['2', 'Helium', '4.0026', 'He']);
  });

  it('should be able to get the column name of a cell', async () => {
    const table = await loader.getHarness(MatTableHarness);
    const fifthRow = (await table.getRows())[1];
    const cells = await fifthRow.getCells();
    const cellColumnNames = await parallel(() => cells.map(cell => cell.getColumnName()));
    expect(cellColumnNames).toEqual(['position', 'name', 'weight', 'symbol']);
  });

  it('should be able to filter cells by text', async () => {
    const table = await loader.getHarness(MatTableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({text: '1.0079'});
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual(['1.0079']);
  });

  it('should be able to filter cells by column name', async () => {
    const table = await loader.getHarness(MatTableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({columnName: 'symbol'});
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual(['H']);
  });
});
