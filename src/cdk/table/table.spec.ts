import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  QueryList,
  Type,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {BehaviorSubject, combineLatest, Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';
import {CdkColumnDef} from './cell';
import {CdkTableModule} from './index';
import {CdkHeaderRowDef, CdkRowDef, CdkCellOutlet} from './row';
import {CdkTable} from './table';
import {
  getTableDuplicateColumnNameError,
  getTableMissingMatchingRowDefError,
  getTableMissingRowDefsError,
  getTableMultipleDefaultRowDefsError,
  getTableUnknownColumnError,
  getTableUnknownDataSourceError
} from './table-errors';
import {BidiModule} from '@angular/cdk/bidi';

describe('CdkTable', () => {
  let fixture: ComponentFixture<any>;
  let component: any;
  let tableElement: HTMLElement;

  function createComponent<T>(
      componentType: Type<T>, declarations: any[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [CdkTableModule, BidiModule],
      declarations: [componentType, ...declarations],
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  function setupTableTestApp(componentType: Type<any>, declarations: any[] = []) {
    fixture = createComponent(componentType, declarations);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tableElement = fixture.nativeElement.querySelector('.cdk-table');
  }

  describe('in a typical simple use case', () => {
    let dataSource: FakeDataSource;
    let table: CdkTable<TestData>;

    beforeEach(() => {
      setupTableTestApp(SimpleCdkTableApp);

      component = fixture.componentInstance as SimpleCdkTableApp;
      dataSource = component.dataSource;
      table = component.table;

      fixture.detectChanges();
    });

    describe('should initialize', () => {
      it('with a connected data source', () => {
        expect(table.dataSource).toBe(dataSource);
        expect(dataSource.isConnected).toBe(true);
      });

      it('with a rendered header with the right number of header cells', () => {
        const header = getHeaderRows(tableElement)[0];

        expect(header).toBeTruthy();
        expect(header.classList).toContain('customHeaderRowClass');
        expect(getHeaderCells(header).length).toBe(component.columnsToRender.length);
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
        const header = getHeaderRows(tableElement)[0];
        getHeaderCells(header).forEach((headerCell, index) => {
          expect(headerCell.classList).toContain(`cdk-column-${component.columnsToRender[index]}`);
        });

        getRows(tableElement).forEach(row => {
          getCells(row).forEach((cell, index) => {
            expect(cell.classList).toContain(`cdk-column-${component.columnsToRender[index]}`);
          });
        });
      });

      it('with the right accessibility roles', () => {
        expect(tableElement.getAttribute('role')).toBe('grid');

        expect(getHeaderRows(tableElement)[0].getAttribute('role')).toBe('row');
        const header = getHeaderRows(tableElement)[0];
        getHeaderCells(header).forEach(cell => {
          expect(cell.getAttribute('role')).toBe('columnheader');
        });

        getRows(tableElement).forEach(row => {
          expect(row.getAttribute('role')).toBe('row');
          getCells(row).forEach(cell => {
            expect(cell.getAttribute('role')).toBe('gridcell');
          });
        });
      });
    });

    it('should disconnect the data source when table is destroyed', () => {
      expect(dataSource.isConnected).toBe(true);

      fixture.destroy();
      expect(dataSource.isConnected).toBe(false);
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

    it('should clear the `mostRecentCellOutlet` on destroy', () => {
      // Note: we cast the assertions here to booleans, because they may
      // contain circular objects which will throw Jasmine into an infinite
      // when its tries to stringify them to show a test failure.
      expect(!!CdkCellOutlet.mostRecentCellOutlet).toBe(true);

      fixture.destroy();

      expect(!!CdkCellOutlet.mostRecentCellOutlet).toBe(false);
    });

    describe('should correctly use the differ to add/remove/move rows', () => {
      function addInitialIndexAttribute() {
        // Each row receives an attribute 'initialIndex' the element's original place
        getRows(tableElement).forEach((row: Element, index: number) => {
          row.setAttribute('initialIndex', index.toString());
        });

        // Prove that the attributes match their indicies
        const initialRows = getRows(tableElement);
        expect(initialRows[0].getAttribute('initialIndex')).toBe('0');
        expect(initialRows[1].getAttribute('initialIndex')).toBe('1');
        expect(initialRows[2].getAttribute('initialIndex')).toBe('2');
      }

      it('when the data is heterogeneous', () => {
        addInitialIndexAttribute();

        // Swap first and second data in data array
        const copiedData = component.dataSource!.data.slice();
        const temp = copiedData[0];
        copiedData[0] = copiedData[1];
        copiedData[1] = temp;

        // Remove the third element
        copiedData.splice(2, 1);

        // Add new data
        component.dataSource!.data = copiedData;
        component.dataSource!.addData();

        // Expect that the first and second rows were swapped and that the last row is new
        const changedRows = getRows(tableElement);
        expect(changedRows.length).toBe(3);
        expect(changedRows[0].getAttribute('initialIndex')).toBe('1');
        expect(changedRows[1].getAttribute('initialIndex')).toBe('0');
        expect(changedRows[2].getAttribute('initialIndex')).toBe(null);
      });

      it('when the data contains multiple occurrences of the same object instance', () => {
        const obj = {value: true};
        component.dataSource!.data = [obj, obj, obj];
        addInitialIndexAttribute();

        const copiedData = component.dataSource!.data.slice();

        // Remove the third element and add a new different obj in the beginning.
        copiedData.splice(2, 1);
        copiedData.unshift({value: false});

        // Add new data
        component.dataSource!.data = copiedData;

        // Expect that two of the three rows still have an initial index. Not as concerned about
        // the order they are in, but more important that there was no unnecessary removes/inserts.
        const changedRows = getRows(tableElement);
        expect(changedRows.length).toBe(3);
        let numInitialRows = 0;
        changedRows.forEach(row => {
          if (row.getAttribute('initialIndex') !== null) {
            numInitialRows++;
          }
        });
        expect(numInitialRows).toBe(2);
      });
    });

    it('should clear the row view containers on destroy', () => {
      const rowOutlet = fixture.componentInstance.table._rowOutlet.viewContainer;
      const headerPlaceholder = fixture.componentInstance.table._headerRowOutlet.viewContainer;

      spyOn(rowOutlet, 'clear').and.callThrough();
      spyOn(headerPlaceholder, 'clear').and.callThrough();

      fixture.destroy();

      expect(rowOutlet.clear).toHaveBeenCalled();
      expect(headerPlaceholder.clear).toHaveBeenCalled();
    });

    it('should match the right table content with dynamic data', () => {
      const initialDataLength = dataSource.data.length;
      expect(dataSource.data.length).toBe(3);

      let data = dataSource.data;
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [data[0].a, data[0].b, data[0].c],
        [data[1].a, data[1].b, data[1].c],
        [data[2].a, data[2].b, data[2].c],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Add data to the table and recreate what the rendered output should be.
      dataSource.addData();
      expect(dataSource.data.length).toBe(initialDataLength + 1); // Make sure data was added
      fixture.detectChanges();

      data = dataSource.data;
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [data[0].a, data[0].b, data[0].c],
        [data[1].a, data[1].b, data[1].c],
        [data[2].a, data[2].b, data[2].c],
        [data[3].a, data[3].b, data[3].c],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should be able to dynamically change the columns for header and rows', () => {
      expect(dataSource.data.length).toBe(3);

      let data = dataSource.data;
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [data[0].a, data[0].b, data[0].c],
        [data[1].a, data[1].b, data[1].c],
        [data[2].a, data[2].b, data[2].c],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Remove column_a and swap column_b/column_c.
      component.columnsToRender = ['column_c', 'column_b'];
      fixture.detectChanges();

      let changedTableContent = [['Column C', 'Column B']];
      dataSource.data.forEach(rowData => changedTableContent.push([rowData.c, rowData.b]));

      data = dataSource.data;
      expectTableToMatchContent(tableElement, [
        ['Column C', 'Column B'],
        [data[0].c, data[0].b],
        [data[1].c, data[1].b],
        [data[2].c, data[2].b],
        ['Footer C', 'Footer B'],
      ]);
    });
  });

  it('should render no rows when the data is null', fakeAsync(() => {
    setupTableTestApp(NullDataCdkTableApp);
    fixture.detectChanges();

    expect(getRows(tableElement).length).toBe(0);
  }));

  it('should be able to render multiple header and footer rows', () => {
    setupTableTestApp(MultipleHeaderFooterRowsCdkTableApp);
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['first-header'],
      ['second-header'],
      ['first-footer'],
      ['second-footer'],
    ]);
  });

  it('should be able to project a caption', fakeAsync(() => {
    setupTableTestApp(NativeHtmlTableWithCaptionApp);
    fixture.detectChanges();

    const caption = tableElement.querySelector('caption');

    expect(caption).toBeTruthy();
    expect(tableElement.firstElementChild).toBe(caption);
  }));

  describe('with different data inputs other than data source', () => {
    let baseData: TestData[] = [
      {a: 'a_1', b: 'b_1', c: 'c_1'},
      {a: 'a_2', b: 'b_2', c: 'c_2'},
      {a: 'a_3', b: 'b_3', c: 'c_3'},
    ];

    beforeEach(() => {
      setupTableTestApp(CdkTableWithDifferentDataInputsApp);
    });

    it('should render with data array input', () => {
      const data = baseData.slice();
      component.dataSource = data;
      fixture.detectChanges();

      const expectedRender = [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
      ];
      expectTableToMatchContent(tableElement, expectedRender);

      // Push data to the array but neglect to tell the table, should be no change
      data.push({a: 'a_4', b: 'b_4', c: 'c_4'});

      expectTableToMatchContent(tableElement, expectedRender);

      // Notify table of the change, expect another row
      component.table.renderRows();
      fixture.detectChanges();

      expectedRender.push(['a_4', 'b_4', 'c_4']);
      expectTableToMatchContent(tableElement, expectedRender);

      // Remove a row and expect the change in rows
      data.pop();
      component.table.renderRows();

      expectedRender.pop();
      expectTableToMatchContent(tableElement, expectedRender);

      // Remove the data input entirely and expect no rows - just header.
      component.dataSource = null;
      fixture.detectChanges();

      expectTableToMatchContent(tableElement, [expectedRender[0]]);

      // Add back the data to verify that it renders rows
      component.dataSource = data;
      fixture.detectChanges();

      expectTableToMatchContent(tableElement, expectedRender);
    });

    it('should render with data stream input', () => {
      const data = baseData.slice();
      const stream = new BehaviorSubject<TestData[]>(data);
      component.dataSource = stream;
      fixture.detectChanges();

      const expectedRender = [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
      ];
      expectTableToMatchContent(tableElement, expectedRender);

      // Push data to the array and emit the data array on the stream
      data.push({a: 'a_4', b: 'b_4', c: 'c_4'});
      stream.next(data);
      fixture.detectChanges();

      expectedRender.push(['a_4', 'b_4', 'c_4']);
      expectTableToMatchContent(tableElement, expectedRender);

      // Push data to the array but rather than emitting, call renderRows.
      data.push({a: 'a_5', b: 'b_5', c: 'c_5'});
      component.table.renderRows();
      fixture.detectChanges();

      expectedRender.push(['a_5', 'b_5', 'c_5']);
      expectTableToMatchContent(tableElement, expectedRender);

      // Remove a row and expect the change in rows
      data.pop();
      expectedRender.pop();
      stream.next(data);

      expectTableToMatchContent(tableElement, expectedRender);

      // Remove the data input entirely and expect no rows - just header.
      component.dataSource = null;
      fixture.detectChanges();

      expectTableToMatchContent(tableElement, [expectedRender[0]]);

      // Add back the data to verify that it renders rows
      component.dataSource = stream;
      fixture.detectChanges();

      expectTableToMatchContent(tableElement, expectedRender);
    });

    it('should throw an error if the data source is not valid', () => {
      component.dataSource = {invalid: 'dataSource'};

      expect(() => fixture.detectChanges()).toThrowError(getTableUnknownDataSourceError().message);
    });

    it('should throw an error if the data source is not valid', () => {
      component.dataSource = undefined;
      fixture.detectChanges();

      // Expect the table to render just the header, no rows
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C']
      ]);
    });
  });

  describe('missing row defs', () => {
    it('should be able to render without a header row def', () => {
      setupTableTestApp(MissingHeaderRowDefCdkTableApp);
      expectTableToMatchContent(tableElement, [
        ['a_1'],  // Data rows
        ['a_2'],
        ['a_3'],
        ['Footer A'],  // Footer row
      ]);
    });

    it('should be able to render without a data row def', () => {
      setupTableTestApp(MissingRowDefCdkTableApp);
      expectTableToMatchContent(tableElement, [
        ['Column A'],  // Header row
        ['Footer A'],  // Footer row
      ]);
    });

    it('should be able to render without a footer row def', () => {
      setupTableTestApp(MissingFooterRowDefCdkTableApp);
      expectTableToMatchContent(tableElement, [
        ['Column A'],  // Header row
        ['a_1'],  // Data rows
        ['a_2'],
        ['a_3'],
      ]);
    });
  });

  it('should render correctly when using native HTML tags', () => {
    const thisFixture = createComponent(NativeHtmlTableApp);
    const thisTableElement = thisFixture.nativeElement.querySelector('table');
    thisFixture.detectChanges();

    expectTableToMatchContent(thisTableElement, [
      ['Column A', 'Column B', 'Column C'],
      ['a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
      ['a_3', 'b_3', 'c_3'],
    ]);
  });

  it('should apply correct roles for native table elements', () => {
    const thisFixture = createComponent(NativeHtmlTableApp);
    const thisTableElement: HTMLTableElement = thisFixture.nativeElement.querySelector('table');
    thisFixture.detectChanges();

    const rowGroups = Array.from(thisTableElement.querySelectorAll('thead, tbody, tfoot'));
    expect(rowGroups.length).toBe(3, 'Expected table to have a thead, tbody, and tfoot');
    for (const group of rowGroups) {
      expect(group.getAttribute('role'))
          .toBe('rowgroup', 'Expected thead, tbody, and tfoot to have role="rowgroup"');
    }
  });

  it('should hide thead/tfoot when there are no header/footer rows', () => {
    const thisFixture = createComponent(NativeTableWithNoHeaderOrFooterRows);
    const thisTableElement: HTMLTableElement = thisFixture.nativeElement.querySelector('table');
    thisFixture.detectChanges();

    const rowGroups: HTMLElement[] = Array.from(thisTableElement.querySelectorAll('thead, tfoot'));
    expect(rowGroups.length).toBe(2, 'Expected table to have a thead and tfoot');
    for (const group of rowGroups) {
      expect(group.style.display).toBe('none', 'Expected thead and tfoot to be `display: none`');
    }
  });

  it('should render cells even if row data is falsy', () => {
    setupTableTestApp(BooleanRowCdkTableApp);
    expectTableToMatchContent(tableElement, [
      [''], // Header row
      ['false'], // Data rows
      ['true'],
      ['false'],
      ['true'],
    ]);
  });

  it('should be able to apply class-friendly css class names for the column cells', () => {
    setupTableTestApp(CrazyColumnNameCdkTableApp);
    // Column was named 'crazy-column-NAME-1!@#$%^-_&*()2'
    const header = getHeaderRows(tableElement)[0];
    expect(getHeaderCells(header)[0].classList)
        .toContain('cdk-column-crazy-column-NAME-1-------_----2');
  });

  it('should not clobber an existing table role', () => {
    setupTableTestApp(CustomRoleCdkTableApp);
    expect(tableElement.getAttribute('role')).toBe('treegrid');
  });

  it('should throw an error if two column definitions have the same name', () => {
    expect(() => createComponent(DuplicateColumnDefNameCdkTableApp).detectChanges())
        .toThrowError(getTableDuplicateColumnNameError('column_a').message);
  });

  it('should throw an error if a column definition is requested but not defined', () => {
    expect(() => createComponent(MissingColumnDefCdkTableApp).detectChanges())
        .toThrowError(getTableUnknownColumnError('column_a').message);
  });

  it('should throw an error if a column definition is requested but not defined after render',
     fakeAsync(() => {
       const columnDefinitionMissingAfterRenderFixture =
           createComponent(MissingColumnDefAfterRenderCdkTableApp);
       expect(() => {
         columnDefinitionMissingAfterRenderFixture.detectChanges();
         flush();
         columnDefinitionMissingAfterRenderFixture.detectChanges();
       }).toThrowError(getTableUnknownColumnError('column_a').message);
     }));

  it('should throw an error if the row definitions are missing', () => {
    expect(() => createComponent(MissingAllRowDefsCdkTableApp).detectChanges())
        .toThrowError(getTableMissingRowDefsError().message);
  });

  it('should not throw an error if columns are undefined on initialization', () => {
    setupTableTestApp(UndefinedColumnsCdkTableApp);

    // Header should be empty since there are no columns to display.
    const headerRow = getHeaderRows(tableElement)[0];
    expect(headerRow.textContent).toBe('');

    // Rows should be empty since there are no columns to display.
    const rows = getRows(tableElement);
    expect(rows[0].textContent).toBe('');
    expect(rows[1].textContent).toBe('');
    expect(rows[2].textContent).toBe('');
  });

  it('should be able to dynamically add/remove column definitions', () => {
    setupTableTestApp(DynamicColumnDefinitionsCdkTableApp);

    // Add a new column and expect it to show up in the table
    let columnA = 'columnA';
    component.dynamicColumns.push(columnA);
    fixture.detectChanges();
    expectTableToMatchContent(tableElement, [
      [columnA], // Header row
      [columnA], // Data rows
      [columnA],
      [columnA],
    ]);

    // Add another new column and expect it to show up in the table
    let columnB = 'columnB';
    component.dynamicColumns.push(columnB);
    fixture.detectChanges();
    expectTableToMatchContent(tableElement, [
      [columnA, columnB], // Header row
      [columnA, columnB], // Data rows
      [columnA, columnB],
      [columnA, columnB],
    ]);

    // Remove column A expect only column B to be rendered
    component.dynamicColumns.shift();
    fixture.detectChanges();
    expectTableToMatchContent(tableElement, [
      [columnB], // Header row
      [columnB], // Data rows
      [columnB],
      [columnB],
    ]);
  });

  it('should be able to register column, row, and header row definitions outside content', () => {
    setupTableTestApp(OuterTableApp, [WrapperCdkTableApp]);

    // The first two columns were defined in the wrapped table component as content children,
    // while the injected columns were provided to the wrapped table from the outer component.
    // A special row was provided with a when predicate that shows the single column with text.
    // The header row was defined by the outer component.
    expectTableToMatchContent(tableElement, [
      ['Content Column A', 'Content Column B', 'Injected Column A', 'Injected Column B'],
      ['injected row with when predicate'],
      ['a_2', 'b_2', 'a_2', 'b_2'],
      ['a_3', 'b_3', 'a_3', 'b_3']
    ]);
  });

  describe('using when predicate', () => {
    it('should be able to display different row templates based on the row data', () => {
      setupTableTestApp(WhenRowCdkTableApp);
      let data = component.dataSource.data;
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [data[0].a, data[0].b, data[0].c],
        ['index_1_special_row'],
        ['c3_special_row'],
        [data[3].a, data[3].b, data[3].c],
      ]);
    });

    it('should error if there is row data that does not have a matching row template',
       fakeAsync(() => {
         const whenRowWithoutDefaultFixture = createComponent(WhenRowWithoutDefaultCdkTableApp);
         const data = whenRowWithoutDefaultFixture.componentInstance.dataSource.data;
         expect(() => {
           try {
             whenRowWithoutDefaultFixture.detectChanges();
             flush();
           } catch {
             flush();
           }
         }).toThrowError(getTableMissingMatchingRowDefError(data[0]).message);
       }));

    it('should fail when multiple rows match data without multiTemplateDataRows', fakeAsync(() => {
      let whenFixture = createComponent(WhenRowMultipleDefaultsCdkTableApp);
      expect(() => {
        whenFixture.detectChanges();
        flush();
      }).toThrowError(getTableMultipleDefaultRowDefsError().message);
    }));

    describe('with multiTemplateDataRows', () => {
      it('should be able to render multiple rows per data object', () => {
        setupTableTestApp(WhenRowCdkTableApp);
        component.multiTemplateDataRows = true;
        fixture.detectChanges();

        const data = component.dataSource.data;
        expectTableToMatchContent(tableElement, [
          ['Column A', 'Column B', 'Column C'],
          [data[0].a, data[0].b, data[0].c],
          [data[1].a, data[1].b, data[1].c],
          ['index_1_special_row'],
          [data[2].a, data[2].b, data[2].c],
          ['c3_special_row'],
          [data[3].a, data[3].b, data[3].c],
        ]);
      });

      it('should have the correct data and row indicies', () => {
        setupTableTestApp(WhenRowCdkTableApp);
        component.multiTemplateDataRows = true;
        component.showIndexColumns();
        fixture.detectChanges();

        expectTableToMatchContent(tableElement, [
          ['Index', 'Data Index', 'Render Index'],
          ['', '0', '0'],
          ['', '1', '1'],
          ['', '1', '2'],
          ['', '2', '3'],
          ['', '2', '4'],
          ['', '3', '5'],
        ]);
      });

      it('should have the correct data and row indicies when data contains multiple instances of ' +
             'the same object instance',
         () => {
           setupTableTestApp(WhenRowCdkTableApp);
           component.multiTemplateDataRows = true;
           component.showIndexColumns();

           const obj = {value: true};
           component.dataSource.data = [obj, obj, obj, obj];
           fixture.detectChanges();

           expectTableToMatchContent(tableElement, [
             ['Index', 'Data Index', 'Render Index'],
             ['', '0', '0'],
             ['', '1', '1'],
             ['', '1', '2'],
             ['', '2', '3'],
             ['', '3', '4'],
           ]);

           // Push unique data on the front and add another obj to the array
           component.dataSource.data = [{value: false}, obj, obj, obj, obj, obj];
           fixture.detectChanges();

           expectTableToMatchContent(tableElement, [
             ['Index', 'Data Index', 'Render Index'],
             ['', '0', '0'],
             ['', '1', '1'],
             ['', '1', '2'],
             ['', '2', '3'],
             ['', '3', '4'],
             ['', '4', '5'],
             ['', '5', '6'],
           ]);
         });
    });
  });

  describe('with sticky positioning', () => {
    interface PositionDirections {
      [key: string]: string | undefined;
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    }

    function expectNoStickyStyles(elements: any[]) {
      elements.forEach(element => {
        expect(element.classList.contains('cdk-table-sticky'));
        expect(element.style.position).toBe('');
        expect(element.style.zIndex || '0').toBe('0');
        ['top', 'bottom', 'left', 'right'].forEach(d => {
          expect(element.style[d] || 'unset').toBe('unset', `Expected ${d} to be unset`);
        });
      });
    }

    function expectStickyStyles(element: any, zIndex: string, directions: PositionDirections = {}) {
      expect(element.style.position).toContain('sticky');
      expect(element.style.zIndex).toBe(zIndex, `Expected zIndex to be ${zIndex}`);

      ['top', 'bottom', 'left', 'right'].forEach(d => {
        const directionValue = directions[d];

        if (!directionValue) {
          // If no expected position for this direction, must either be unset or empty string
          expect(element.style[d] || 'unset').toBe('unset', `Expected ${d} to be unset`);
          return;
        }

        const expectationMessage = `Expected direction ${d} to be ${directionValue}`;

        // If the direction contains `px`, we parse the number to be able to avoid deviations
        // caused by individual browsers.
        if (directionValue.includes('px')) {
          expect(Math.round(parseInt(element.style[d])))
            .toBe(Math.round(parseInt(directionValue)), expectationMessage);
        } else {
          expect(element.style[d]).toBe(directionValue, expectationMessage);
        }
      });
    }

    describe('on "display: flex" table style', () => {
      let dataRows: Element[];
      let headerRows: Element[];
      let footerRows: Element[];

      beforeEach(() => {
        setupTableTestApp(StickyFlexLayoutCdkTableApp);

        headerRows = getHeaderRows(tableElement);
        footerRows = getFooterRows(tableElement);
        dataRows = getRows(tableElement);
      });

      it('should stick and unstick headers', () => {
        component.stickyHeaders = ['header-1', 'header-3'];
        fixture.detectChanges();

        expectStickyStyles(headerRows[0], '100', {top: '0px'});
        expectNoStickyStyles([headerRows[1]]);
        expectStickyStyles(
            headerRows[2], '100', {top: headerRows[0].getBoundingClientRect().height + 'px'});

        component.stickyHeaders = [];
        fixture.detectChanges();
        expectNoStickyStyles(headerRows);
      });

      it('should stick and unstick footers', () => {
        component.stickyFooters = ['footer-1', 'footer-3'];
        fixture.detectChanges();

        expectStickyStyles(
            footerRows[0], '10', {bottom: footerRows[1].getBoundingClientRect().height + 'px'});
        expectNoStickyStyles([footerRows[1]]);
        expectStickyStyles(footerRows[2], '10', {bottom: '0px'});

        component.stickyFooters = [];
        fixture.detectChanges();
        expectNoStickyStyles(footerRows);
      });

      it('should stick and unstick left columns', () => {
        component.stickyStartColumns = ['column-1', 'column-3'];
        fixture.detectChanges();

        headerRows.forEach(row => {
          let cells = getHeaderCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[2], '1', {left: '20px'});
          expectNoStickyStyles([cells[1], cells[3], cells[4], cells[5]]);
        });
        dataRows.forEach(row => {
          let cells = getCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[2], '1', {left: '20px'});
          expectNoStickyStyles([cells[1], cells[3], cells[4], cells[5]]);
        });
        footerRows.forEach(row => {
          let cells = getFooterCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[2], '1', {left: '20px'});
          expectNoStickyStyles([cells[1], cells[3], cells[4], cells[5]]);
        });

        component.stickyStartColumns = [];
        fixture.detectChanges();
        headerRows.forEach(row => expectNoStickyStyles(getHeaderCells(row)));
        dataRows.forEach(row => expectNoStickyStyles(getCells(row)));
        footerRows.forEach(row => expectNoStickyStyles(getFooterCells(row)));
      });

      it('should stick and unstick right columns', () => {
        component.stickyEndColumns = ['column-4', 'column-6'];
        fixture.detectChanges();

        headerRows.forEach(row => {
          let cells = getHeaderCells(row);
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectStickyStyles(cells[3], '1', {right: '20px'});
          expectNoStickyStyles([cells[0], cells[1], cells[2], cells[4]]);
        });
        dataRows.forEach(row => {
          let cells = getCells(row);
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectStickyStyles(cells[3], '1', {right: '20px'});
          expectNoStickyStyles([cells[0], cells[1], cells[2], cells[4]]);
        });
        footerRows.forEach(row => {
          let cells = getFooterCells(row);
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectStickyStyles(cells[3], '1', {right: '20px'});
          expectNoStickyStyles([cells[0], cells[1], cells[2], cells[4]]);
        });

        component.stickyEndColumns = [];
        fixture.detectChanges();
        headerRows.forEach(row => expectNoStickyStyles(getHeaderCells(row)));
        dataRows.forEach(row => expectNoStickyStyles(getCells(row)));
        footerRows.forEach(row => expectNoStickyStyles(getFooterCells(row)));
      });

      it('should reverse directions for sticky columns in rtl', () => {
        component.dir = 'rtl';
        component.stickyStartColumns = ['column-1', 'column-2'];
        component.stickyEndColumns = ['column-5', 'column-6'];
        fixture.detectChanges();

        const firstColumnWidth = getHeaderCells(headerRows[0])[0].getBoundingClientRect().width;
        const lastColumnWidth = getHeaderCells(headerRows[0])[5].getBoundingClientRect().width;

        let headerCells = getHeaderCells(headerRows[0]);
        expectStickyStyles(headerCells[0], '1', {right: '0px'});
        expectStickyStyles(headerCells[1], '1', {right: `${firstColumnWidth}px`});
        expectStickyStyles(headerCells[4], '1', {left: `${lastColumnWidth}px`});
        expectStickyStyles(headerCells[5], '1', {left: '0px'});

        dataRows.forEach(row => {
          let cells = getCells(row);
          expectStickyStyles(cells[0], '1', {right: '0px'});
          expectStickyStyles(cells[1], '1', {right: `${firstColumnWidth}px`});
          expectStickyStyles(cells[4], '1', {left: `${lastColumnWidth}px`});
          expectStickyStyles(cells[5], '1', {left: '0px'});
        });

        let footerCells = getFooterCells(footerRows[0]);
        expectStickyStyles(footerCells[0], '1', {right: '0px'});
        expectStickyStyles(footerCells[1], '1', {right: `${firstColumnWidth}px`});
        expectStickyStyles(footerCells[4], '1', {left: `${lastColumnWidth}px`});
        expectStickyStyles(footerCells[5], '1', {left: '0px'});
      });

      it('should stick and unstick combination of sticky header, footer, and columns', () => {
        component.stickyHeaders = ['header-1'];
        component.stickyFooters = ['footer-3'];
        component.stickyStartColumns = ['column-1'];
        component.stickyEndColumns = ['column-6'];
        fixture.detectChanges();

        let headerCells = getHeaderCells(headerRows[0]);
        expectStickyStyles(headerRows[0], '100', {top: '0px'});
        expectStickyStyles(headerCells[0], '1', {left: '0px'});
        expectStickyStyles(headerCells[5], '1', {right: '0px'});
        expectNoStickyStyles([headerCells[1], headerCells[2], headerCells[3], headerCells[4]]);
        expectNoStickyStyles([headerRows[1], headerRows[2]]);

        dataRows.forEach(row => {
          let cells = getCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectNoStickyStyles([cells[1], cells[2], cells[3], cells[4]]);
        });

        let footerCells = getFooterCells(footerRows[0]);
        expectStickyStyles(footerRows[0], '10', {bottom: '0px'});
        expectStickyStyles(footerCells[0], '1', {left: '0px'});
        expectStickyStyles(footerCells[5], '1', {right: '0px'});
        expectNoStickyStyles([footerCells[1], footerCells[2], footerCells[3], footerCells[4]]);
        expectNoStickyStyles([footerRows[1], footerRows[2]]);

        component.stickyHeaders = [];
        component.stickyFooters = [];
        component.stickyStartColumns = [];
        component.stickyEndColumns = [];
        fixture.detectChanges();

        headerRows.forEach(row => expectNoStickyStyles([row, ...getHeaderCells(row)]));
        dataRows.forEach(row => expectNoStickyStyles([row, ...getCells(row)]));
        footerRows.forEach(row => expectNoStickyStyles([row, ...getFooterCells(row)]));
      });
    });

    describe('on native table layout', () => {
      let dataRows: Element[];
      let headerRows: Element[];
      let footerRows: Element[];

      beforeEach(() => {
        setupTableTestApp(StickyNativeLayoutCdkTableApp);

        headerRows = getHeaderRows(tableElement);
        footerRows = getFooterRows(tableElement);
        dataRows = getRows(tableElement);
      });

      it('should stick and unstick headers', () => {
        component.stickyHeaders = ['header-1', 'header-3'];
        fixture.detectChanges();

        getHeaderCells(headerRows[0]).forEach(cell => {
          expectStickyStyles(cell, '100', {top: '0px'});
        });
        const firstHeaderHeight = headerRows[0].getBoundingClientRect().height;
        getHeaderCells(headerRows[2]).forEach(cell => {
          expectStickyStyles(cell, '100', {top: firstHeaderHeight + 'px'});
        });
        expectNoStickyStyles(getHeaderCells(headerRows[1]));
        expectNoStickyStyles(headerRows);  // No sticky styles on rows for native table

        component.stickyHeaders = [];
        fixture.detectChanges();
        expectNoStickyStyles(headerRows);  // No sticky styles on rows for native table
        headerRows.forEach(row => expectNoStickyStyles(getHeaderCells(row)));
      });

      it('should stick and unstick footers', () => {
        component.stickyFooters = ['footer-1', 'footer-3'];
        fixture.detectChanges();

        getFooterCells(footerRows[2]).forEach(cell => {
          expectStickyStyles(cell, '10', {bottom: '0px'});
        });
        const thirdFooterHeight = footerRows[2].getBoundingClientRect().height;
        getFooterCells(footerRows[0]).forEach(cell => {
          expectStickyStyles(cell, '10', {bottom: thirdFooterHeight + 'px'});
        });
        expectNoStickyStyles(getFooterCells(footerRows[1]));
        expectNoStickyStyles(footerRows);  // No sticky styles on rows for native table

        component.stickyFooters = [];
        fixture.detectChanges();
        expectNoStickyStyles(footerRows);  // No sticky styles on rows for native table
        footerRows.forEach(row => expectNoStickyStyles(getFooterCells(row)));
      });

      it('should stick tfoot when all rows are stuck', () => {
        const tfoot = tableElement.querySelector('tfoot');
        component.stickyFooters = ['footer-1'];
        fixture.detectChanges();
        expectNoStickyStyles([tfoot]);

        component.stickyFooters = ['footer-1', 'footer-2', 'footer-3'];
        fixture.detectChanges();
        expectStickyStyles(tfoot, '10', {bottom: '0px'});

        component.stickyFooters = ['footer-1', 'footer-2'];
        fixture.detectChanges();
        expectNoStickyStyles([tfoot]);
      });

      it('should stick and unstick left columns', () => {
        component.stickyStartColumns = ['column-1', 'column-3'];
        fixture.detectChanges();

        headerRows.forEach(row => {
          let cells = getHeaderCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[2], '1', {left: '20px'});
          expectNoStickyStyles([cells[1], cells[3], cells[4], cells[5]]);
        });
        dataRows.forEach(row => {
          let cells = getCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[2], '1', {left: '20px'});
          expectNoStickyStyles([cells[1], cells[3], cells[4], cells[5]]);
        });
        footerRows.forEach(row => {
          let cells = getFooterCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[2], '1', {left: '20px'});
          expectNoStickyStyles([cells[1], cells[3], cells[4], cells[5]]);
        });

        component.stickyStartColumns = [];
        fixture.detectChanges();
        headerRows.forEach(row => expectNoStickyStyles(getHeaderCells(row)));
        dataRows.forEach(row => expectNoStickyStyles(getCells(row)));
        footerRows.forEach(row => expectNoStickyStyles(getFooterCells(row)));
      });

      it('should stick and unstick right columns', () => {
        component.stickyEndColumns = ['column-4', 'column-6'];
        fixture.detectChanges();

        headerRows.forEach(row => {
          let cells = getHeaderCells(row);
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectStickyStyles(cells[3], '1', {right: '20px'});
          expectNoStickyStyles([cells[0], cells[1], cells[2], cells[4]]);
        });
        dataRows.forEach(row => {
          let cells = getCells(row);
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectStickyStyles(cells[3], '1', {right: '20px'});
          expectNoStickyStyles([cells[0], cells[1], cells[2], cells[4]]);
        });
        footerRows.forEach(row => {
          let cells = getFooterCells(row);
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectStickyStyles(cells[3], '1', {right: '20px'});
          expectNoStickyStyles([cells[0], cells[1], cells[2], cells[4]]);
        });

        component.stickyEndColumns = [];
        fixture.detectChanges();
        headerRows.forEach(row => expectNoStickyStyles(getHeaderCells(row)));
        dataRows.forEach(row => expectNoStickyStyles(getCells(row)));
        footerRows.forEach(row => expectNoStickyStyles(getFooterCells(row)));
      });

      it('should stick and unstick combination of sticky header, footer, and columns', () => {
        component.stickyHeaders = ['header-1'];
        component.stickyFooters = ['footer-3'];
        component.stickyStartColumns = ['column-1'];
        component.stickyEndColumns = ['column-6'];
        fixture.detectChanges();

        const headerCells = getHeaderCells(headerRows[0]);
        expectStickyStyles(headerCells[0], '101', {top: '0px', left: '0px'});
        expectStickyStyles(headerCells[1], '100', {top: '0px'});
        expectStickyStyles(headerCells[2], '100', {top: '0px'});
        expectStickyStyles(headerCells[3], '100', {top: '0px'});
        expectStickyStyles(headerCells[4], '100', {top: '0px'});
        expectStickyStyles(headerCells[5], '101', {top: '0px', right: '0px'});
        expectNoStickyStyles(headerRows);

        dataRows.forEach(row => {
          let cells = getCells(row);
          expectStickyStyles(cells[0], '1', {left: '0px'});
          expectStickyStyles(cells[5], '1', {right: '0px'});
          expectNoStickyStyles([cells[1], cells[2], cells[3], cells[4]]);
        });

        const footerCells = getFooterCells(footerRows[0]);
        expectStickyStyles(footerCells[0], '11', {bottom: '0px', left: '0px'});
        expectStickyStyles(footerCells[1], '10', {bottom: '0px'});
        expectStickyStyles(footerCells[2], '10', {bottom: '0px'});
        expectStickyStyles(footerCells[3], '10', {bottom: '0px'});
        expectStickyStyles(footerCells[4], '10', {bottom: '0px'});
        expectStickyStyles(footerCells[5], '11', {bottom: '0px', right: '0px'});
        expectNoStickyStyles(footerRows);

        component.stickyHeaders = [];
        component.stickyFooters = [];
        component.stickyStartColumns = [];
        component.stickyEndColumns = [];
        fixture.detectChanges();

        headerRows.forEach(row => expectNoStickyStyles([row, ...getHeaderCells(row)]));
        dataRows.forEach(row => expectNoStickyStyles([row, ...getCells(row)]));
        footerRows.forEach(row => expectNoStickyStyles([row, ...getFooterCells(row)]));
      });
    });
  });

  describe('with trackBy', () => {
    function createTestComponentWithTrackyByTable(trackByStrategy: string) {
      fixture = createComponent(TrackByCdkTableApp);

      component = fixture.componentInstance;
      component.trackByStrategy = trackByStrategy;

      tableElement = fixture.nativeElement.querySelector('cdk-table');
      fixture.detectChanges();

      // Each row receives an attribute 'initialIndex' the element's original place
      getRows(tableElement).forEach((row: Element, index: number) => {
        row.setAttribute('initialIndex', index.toString());
      });

      // Prove that the attributes match their indicies
      const initialRows = getRows(tableElement);
      expect(initialRows[0].getAttribute('initialIndex')).toBe('0');
      expect(initialRows[1].getAttribute('initialIndex')).toBe('1');
      expect(initialRows[2].getAttribute('initialIndex')).toBe('2');
    }

    // Swap first two elements, remove the third, add new data
    function mutateData() {
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
    }

    it('should add/remove/move rows with reference-based trackBy', () => {
      createTestComponentWithTrackyByTable('reference');
      mutateData();

      // Expect that the first and second rows were swapped and that the last row is new
      const changedRows = getRows(tableElement);
      expect(changedRows.length).toBe(3);
      expect(changedRows[0].getAttribute('initialIndex')).toBe('1');
      expect(changedRows[1].getAttribute('initialIndex')).toBe('0');
      expect(changedRows[2].getAttribute('initialIndex')).toBe(null);
    });

    it('should add/remove/move rows with changed references without property-based trackBy', () => {
      createTestComponentWithTrackyByTable('reference');
      mutateData();

      // Change each item reference to show that the trackby is not checking the item properties.
      component.dataSource.data =
          component.dataSource.data.map((item: TestData) => ({a: item.a, b: item.b, c: item.c}));

      // Expect that all the rows are considered new since their references are all different
      const changedRows = getRows(tableElement);
      expect(changedRows.length).toBe(3);
      expect(changedRows[0].getAttribute('initialIndex')).toBe(null);
      expect(changedRows[1].getAttribute('initialIndex')).toBe(null);
      expect(changedRows[2].getAttribute('initialIndex')).toBe(null);
    });

    it('should add/remove/move rows with changed references with property-based trackBy', () => {
      createTestComponentWithTrackyByTable('propertyA');
      mutateData();

      // Change each item reference to show that the trackby is checking the item properties.
      // Otherwise this would cause them all to be removed/added.
      component.dataSource.data =
          component.dataSource.data.map((item: TestData) => ({a: item.a, b: item.b, c: item.c}));

      // Expect that the first and second rows were swapped and that the last row is new
      const changedRows = getRows(tableElement);
      expect(changedRows.length).toBe(3);
      expect(changedRows[0].getAttribute('initialIndex')).toBe('1');
      expect(changedRows[1].getAttribute('initialIndex')).toBe('0');
      expect(changedRows[2].getAttribute('initialIndex')).toBe(null);
    });

    it('should add/remove/move rows with changed references with index-based trackBy', () => {
      createTestComponentWithTrackyByTable('index');
      mutateData();

      // Change each item reference to show that the trackby is checking the index.
      // Otherwise this would cause them all to be removed/added.
      component.dataSource.data =
          component.dataSource.data.map((item: TestData) => ({a: item.a, b: item.b, c: item.c}));

      // Expect first two to be the same since they were swapped but indicies are consistent.
      // The third element was removed and caught by the table so it was removed before another
      // item was added, so it is without an initial index.
      const changedRows = getRows(tableElement);
      expect(changedRows.length).toBe(3);
      expect(changedRows[0].getAttribute('initialIndex')).toBe('0');
      expect(changedRows[1].getAttribute('initialIndex')).toBe('1');
      expect(changedRows[2].getAttribute('initialIndex')).toBe(null);
    });

    it('should change row implicit data even when trackBy finds no changes', () => {
      createTestComponentWithTrackyByTable('index');
      const firstRow = getRows(tableElement)[0];
      expect(firstRow.textContent!.trim()).toBe('a_1 b_1');
      expect(firstRow.getAttribute('initialIndex')).toBe('0');
      mutateData();

      // Change each item reference to show that the trackby is checking the index.
      // Otherwise this would cause them all to be removed/added.
      component.dataSource.data =
          component.dataSource.data.map((item: TestData) => ({a: item.a, b: item.b, c: item.c}));

      // Expect the rows were given the right implicit data even though the rows were not moved.
      fixture.detectChanges();
      expect(firstRow.textContent!.trim()).toBe('a_2 b_2');
      expect(firstRow.getAttribute('initialIndex')).toBe('0');
    });
  });

  it('should match the right table content with dynamic data source', () => {
    setupTableTestApp(DynamicDataSourceCdkTableApp);

    // Expect that the component has no data source and the table element reflects empty data.
    expect(component.dataSource).toBeUndefined();
    expectTableToMatchContent(tableElement, [
      ['Column A']
    ]);

    // Add a data source that has initialized data. Expect that the table shows this data.
    const dynamicDataSource = new FakeDataSource();
    component.dataSource = dynamicDataSource;
    fixture.detectChanges();
    expect(dynamicDataSource.isConnected).toBe(true);

    const data = component.dataSource.data;
    expectTableToMatchContent(tableElement, [
      ['Column A'],
      [data[0].a],
      [data[1].a],
      [data[2].a],
    ]);

    // Remove the data source and check to make sure the table is empty again.
    component.dataSource = undefined;
    fixture.detectChanges();

    // Expect that the old data source has been disconnected.
    expect(dynamicDataSource.isConnected).toBe(false);
    expectTableToMatchContent(tableElement, [
      ['Column A']
    ]);

    // Reconnect a data source and check that the table is populated
    const newDynamicDataSource = new FakeDataSource();
    component.dataSource = newDynamicDataSource;
    fixture.detectChanges();
    expect(newDynamicDataSource.isConnected).toBe(true);

    const newData = component.dataSource.data;
    expectTableToMatchContent(tableElement, [
      ['Column A'],
      [newData[0].a],
      [newData[1].a],
      [newData[2].a],
    ]);
  });

  it('should be able to apply classes to rows based on their context', () => {
    setupTableTestApp(RowContextCdkTableApp);

    let rowElements = tableElement.querySelectorAll('cdk-row');

    // Rows should not have any context classes
    for (let i = 0; i < rowElements.length; i++) {
      expect(rowElements[i].classList.contains('custom-row-class-first')).toBe(false);
      expect(rowElements[i].classList.contains('custom-row-class-last')).toBe(false);
      expect(rowElements[i].classList.contains('custom-row-class-even')).toBe(false);
      expect(rowElements[i].classList.contains('custom-row-class-odd')).toBe(false);
    }

    // Enable all the context classes
    component.enableRowContextClasses = true;
    fixture.detectChanges();

    expect(rowElements[0].classList.contains('custom-row-class-first')).toBe(true);
    expect(rowElements[0].classList.contains('custom-row-class-last')).toBe(false);
    expect(rowElements[0].classList.contains('custom-row-class-even')).toBe(true);
    expect(rowElements[0].classList.contains('custom-row-class-odd')).toBe(false);

    expect(rowElements[1].classList.contains('custom-row-class-first')).toBe(false);
    expect(rowElements[1].classList.contains('custom-row-class-last')).toBe(false);
    expect(rowElements[1].classList.contains('custom-row-class-even')).toBe(false);
    expect(rowElements[1].classList.contains('custom-row-class-odd')).toBe(true);

    expect(rowElements[2].classList.contains('custom-row-class-first')).toBe(false);
    expect(rowElements[2].classList.contains('custom-row-class-last')).toBe(true);
    expect(rowElements[2].classList.contains('custom-row-class-even')).toBe(true);
    expect(rowElements[2].classList.contains('custom-row-class-odd')).toBe(false);
  });

  it('should be able to apply classes to cells based on their row context', () => {
    setupTableTestApp(RowContextCdkTableApp);

    const rowElements = fixture.nativeElement.querySelectorAll('cdk-row');

    for (let i = 0; i < rowElements.length; i++) {
      // Cells should not have any context classes
      const cellElements = rowElements[i].querySelectorAll('cdk-cell');
      for (let j = 0; j < cellElements.length; j++) {
        expect(cellElements[j].classList.contains('custom-cell-class-first')).toBe(false);
        expect(cellElements[j].classList.contains('custom-cell-class-last')).toBe(false);
        expect(cellElements[j].classList.contains('custom-cell-class-even')).toBe(false);
        expect(cellElements[j].classList.contains('custom-cell-class-odd')).toBe(false);
      }
    }

    // Enable the context classes
    component.enableCellContextClasses = true;
    fixture.detectChanges();

    let cellElement = rowElements[0].querySelectorAll('cdk-cell')[0];
    expect(cellElement.classList.contains('custom-cell-class-first')).toBe(true);
    expect(cellElement.classList.contains('custom-cell-class-last')).toBe(false);
    expect(cellElement.classList.contains('custom-cell-class-even')).toBe(true);
    expect(cellElement.classList.contains('custom-cell-class-odd')).toBe(false);

    cellElement = rowElements[1].querySelectorAll('cdk-cell')[0];
    expect(cellElement.classList.contains('custom-cell-class-first')).toBe(false);
    expect(cellElement.classList.contains('custom-cell-class-last')).toBe(false);
    expect(cellElement.classList.contains('custom-cell-class-even')).toBe(false);
    expect(cellElement.classList.contains('custom-cell-class-odd')).toBe(true);

    cellElement = rowElements[2].querySelectorAll('cdk-cell')[0];
    expect(cellElement.classList.contains('custom-cell-class-first')).toBe(false);
    expect(cellElement.classList.contains('custom-cell-class-last')).toBe(true);
    expect(cellElement.classList.contains('custom-cell-class-even')).toBe(true);
    expect(cellElement.classList.contains('custom-cell-class-odd')).toBe(false);
  });
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
    return combineLatest(this._dataChange, collectionViewer.viewChange)
      .pipe(map(data => data[0]));
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
      c: `c_${nextIndex}`
    });

    this.data = copiedData;
  }
}

class BooleanDataSource extends DataSource<boolean> {
  _dataChange = new BehaviorSubject<boolean[]>([false, true, false, true]);

  connect(): Observable<boolean[]> {
    return this._dataChange;
  }

  disconnect() {}
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer A </cdk-footer-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer B </cdk-footer-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef> Column C </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer C </cdk-footer-cell>
      </ng-container>

      <cdk-header-row class="customHeaderRowClass"
                      *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row class="customRowClass"
               *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
      <cdk-footer-row class="customFooterRowClass"
                      *cdkFooterRowDef="columnsToRender"></cdk-footer-row>
    </cdk-table>
  `
})
class SimpleCdkTableApp {
  dataSource: FakeDataSource | undefined = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
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

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CdkTableWithDifferentDataInputsApp {
  dataSource: DataSource<TestData> | Observable<TestData[]> | TestData[] | any = null;
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef></cdk-header-cell>
        <cdk-cell *cdkCellDef="let data"> {{data}} </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="['column_a']"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: ['column_a']"></cdk-row>
    </cdk-table>
  `
})
class BooleanRowCdkTableApp {
  dataSource = new BooleanDataSource();
}


@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef></cdk-header-cell>
        <cdk-cell *cdkCellDef="let data"> {{data}} </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="['column_a']"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: ['column_a']"></cdk-row>
    </cdk-table>
  `
})
class NullDataCdkTableApp {
  dataSource = observableOf(null);
}


@Component({
  template: `
    <cdk-table [dataSource]="[]">
      <ng-container cdkColumnDef="first-header">
        <th cdk-header-cell *cdkHeaderCellDef> first-header </th>
      </ng-container>

      <ng-container cdkColumnDef="second-header">
        <th cdk-header-cell *cdkHeaderCellDef> second-header </th>
      </ng-container>

      <ng-container cdkColumnDef="first-footer">
        <td cdk-footer-cell *cdkFooterCellDef> first-footer </td>
      </ng-container>

      <ng-container cdkColumnDef="second-footer">
        <td cdk-footer-cell *cdkFooterCellDef> second-footer </td>
      </ng-container>

      <tr cdk-header-row *cdkHeaderRowDef="['first-header']"></tr>
      <tr cdk-header-row *cdkHeaderRowDef="['second-header']"></tr>
      <tr cdk-footer-row *cdkFooterRowDef="['first-footer']"></tr>
      <tr cdk-footer-row *cdkFooterRowDef="['second-footer']"></tr>
    </cdk-table>
  `
})
class MultipleHeaderFooterRowsCdkTableApp {
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" [multiTemplateDataRows]="multiTemplateDataRows">
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

      <ng-container cdkColumnDef="index1Column">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef> index_1_special_row</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="c3Column">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef> c3_special_row</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="index">
        <cdk-header-cell *cdkHeaderCellDef> Index</cdk-header-cell>
        <cdk-cell *cdkCellDef="let index = index"> {{index}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="dataIndex">
        <cdk-header-cell *cdkHeaderCellDef> Data Index</cdk-header-cell>
        <cdk-cell *cdkCellDef="let dataIndex = dataIndex"> {{dataIndex}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="renderIndex">
        <cdk-header-cell *cdkHeaderCellDef> Render Index</cdk-header-cell>
        <cdk-cell *cdkCellDef="let renderIndex = renderIndex"> {{renderIndex}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
      <cdk-row *cdkRowDef="let row; columns: columnsForIsIndex1Row; when: isIndex1"></cdk-row>
      <cdk-row *cdkRowDef="let row; columns: columnsForHasC3Row; when: hasC3"></cdk-row>
    </cdk-table>
  `
})
class WhenRowCdkTableApp {
  multiTemplateDataRows = false;
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
  columnsForIsIndex1Row = ['index1Column'];
  columnsForHasC3Row = ['c3Column'];
  isIndex1 = (index: number, _rowData: TestData) => index == 1;
  hasC3 = (_index: number, rowData: TestData) => rowData.c == 'c_3';

  constructor() {
    this.dataSource.addData();
  }

  @ViewChild(CdkTable) table: CdkTable<TestData>;

  showIndexColumns() {
    const indexColumns = ['index', 'dataIndex', 'renderIndex'];
    this.columnsToRender = indexColumns;
    this.columnsForIsIndex1Row = indexColumns;
    this.columnsForHasC3Row = indexColumns;
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

      <ng-container cdkColumnDef="index1Column">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef> index_1_special_row </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="c3Column">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef> c3_special_row </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: ['index1Column']; when: isIndex1"></cdk-row>
      <cdk-row *cdkRowDef="let row; columns: ['c3Column']; when: hasC3"></cdk-row>
    </cdk-table>
  `
})
class WhenRowWithoutDefaultCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
  isIndex1 = (index: number, _rowData: TestData) => index == 1;
  hasC3 = (_index: number, rowData: TestData) => rowData.c == 'c_3';

  @ViewChild(CdkTable) table: CdkTable<TestData>;
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

      <ng-container cdkColumnDef="index1Column">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef> index_1_special_row </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="c3Column">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef> c3_special_row </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
      <cdk-row *cdkRowDef="let row; columns: ['index1Column']"></cdk-row>
      <cdk-row *cdkRowDef="let row; columns: ['c3Column']; when: hasC3"></cdk-row>
    </cdk-table>
  `
})
class WhenRowMultipleDefaultsCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
  hasC3 = (_index: number, rowData: TestData) => rowData.c == 'c_3';

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class DynamicDataSourceCdkTableApp {
  dataSource: FakeDataSource | undefined;
  columnsToRender = ['column_a'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" [trackBy]="trackBy">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column B</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class TrackByCdkTableApp {
  trackByStrategy: 'reference' | 'propertyA' | 'index' = 'reference';

  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;

  trackBy = (index: number, item: TestData) => {
    switch (this.trackByStrategy) {
      case 'reference': return item;
      case 'propertyA': return item.a;
      case 'index': return index;
    }
  }
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" [dir]="dir">
      <ng-container [cdkColumnDef]="column" *ngFor="let column of columns"
                    [sticky]="isStuck(stickyStartColumns, column)"
                    [stickyEnd]="isStuck(stickyEndColumns, column)">
        <cdk-header-cell *cdkHeaderCellDef> Header {{column}} </cdk-header-cell>
        <cdk-cell *cdkCellDef>{{column}}</cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer {{column}} </cdk-footer-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columns; sticky: isStuck(stickyHeaders, 'header-1')">
      </cdk-header-row>
      <cdk-header-row *cdkHeaderRowDef="columns; sticky: isStuck(stickyHeaders, 'header-2')">
      </cdk-header-row>
      <cdk-header-row *cdkHeaderRowDef="columns; sticky: isStuck(stickyHeaders, 'header-3')">
      </cdk-header-row>

      <cdk-row *cdkRowDef="let row; columns: columns"></cdk-row>

      <cdk-footer-row *cdkFooterRowDef="columns; sticky: isStuck(stickyFooters, 'footer-1')">
      </cdk-footer-row>
      <cdk-footer-row *cdkFooterRowDef="columns; sticky: isStuck(stickyFooters, 'footer-2')">
      </cdk-footer-row>
      <cdk-footer-row *cdkFooterRowDef="columns; sticky: isStuck(stickyFooters, 'footer-3')">
      </cdk-footer-row>
    </cdk-table>
  `,
  styles: [`
    .cdk-header-cell, .cdk-cell, .cdk-footer-cell {
      display: block;
      width: 20px;
    }
  `]
})
class StickyFlexLayoutCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columns = ['column-1', 'column-2', 'column-3', 'column-4', 'column-5', 'column-6'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;

  dir = 'ltr';
  stickyHeaders: string[] = [];
  stickyFooters: string[] = [];
  stickyStartColumns: string[] = [];
  stickyEndColumns: string[] = [];

  isStuck(list: string[], id: string) {
    return list.indexOf(id) != -1;
  }
}

@Component({
  template: `
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
  `,
  styles: [`
    .cdk-header-cell, .cdk-cell, .cdk-footer-cell {
      display: block;
      width: 20px;
      box-sizing: border-box;
    }
  `]
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

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container [cdkColumnDef]="column" *ngFor="let column of dynamicColumns">
        <cdk-header-cell *cdkHeaderCellDef> {{column}} </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{column}} </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="dynamicColumns"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: dynamicColumns;"></cdk-row>
    </cdk-table>
  `
})
class DynamicColumnDefinitionsCdkTableApp {
  dynamicColumns: any[] = [];
  dataSource: FakeDataSource = new FakeDataSource();

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" role="treegrid">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CustomRoleCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container [cdkColumnDef]="columnsToRender[0]">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CrazyColumnNameCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['crazy-column-NAME-1!@#$%^-_&*()2'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="['column_a']"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: ['column_a']"></cdk-row>
    </cdk-table>
  `
})
class DuplicateColumnDefNameCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="['column_a']"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: ['column_a']"></cdk-row>
    </cdk-table>
  `
})
class MissingColumnDefCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="displayedColumns"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: displayedColumns"></cdk-row>
    </cdk-table>
  `
})
class MissingColumnDefAfterRenderCdkTableApp implements AfterViewInit {
  dataSource: FakeDataSource|null = null;
  displayedColumns: string[] = [];

  ngAfterViewInit() {
    setTimeout(() => {
      this.displayedColumns = ['column_a'];
    }, 0);
  }
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>
    </cdk-table>
  `
})
class MissingAllRowDefsCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer A </cdk-footer-cell>
      </ng-container>

      <cdk-row *cdkRowDef="let row; columns: ['column_a']"></cdk-row>
      <cdk-footer-row *cdkFooterRowDef="['column_a']"></cdk-footer-row>
    </cdk-table>
  `
})
class MissingHeaderRowDefCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer A </cdk-footer-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="['column_a']"></cdk-header-row>
      <cdk-footer-row *cdkFooterRowDef="['column_a']"></cdk-footer-row>
    </cdk-table>
  `
})
class MissingRowDefCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer A </cdk-footer-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="['column_a']"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: ['column_a']"></cdk-row>
    </cdk-table>
  `
})
class MissingFooterRowDefCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="undefinedColumns"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: undefinedColumns"></cdk-row>
    </cdk-table>
  `
})
class UndefinedColumnsCdkTableApp {
  undefinedColumns: string[];
  dataSource: FakeDataSource = new FakeDataSource();
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row; let first = first;
                               let last = last; let even = even; let odd = odd"
                  [ngClass]="{
                    'custom-cell-class-first': enableCellContextClasses && first,
                    'custom-cell-class-last': enableCellContextClasses && last,
                    'custom-cell-class-even': enableCellContextClasses && even,
                    'custom-cell-class-odd': enableCellContextClasses && odd
                  }">
          {{row.a}}
        </cdk-cell>
      </ng-container>
      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender;
                           let first = first; let last = last; let even = even; let odd = odd"
               [ngClass]="{
                 'custom-row-class-first': enableRowContextClasses && first,
                 'custom-row-class-last': enableRowContextClasses && last,
                 'custom-row-class-even': enableRowContextClasses && even,
                 'custom-row-class-odd': enableRowContextClasses && odd
               }">
      </cdk-row>
    </cdk-table>
  `
})
class RowContextCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a'];
  enableRowContextClasses = false;
  enableCellContextClasses = false;
}

@Component({
  selector: 'wrapper-table',
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="content_column_a">
        <cdk-header-cell *cdkHeaderCellDef> Content Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
      </ng-container>
      <ng-container cdkColumnDef="content_column_b">
        <cdk-header-cell *cdkHeaderCellDef> Content Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
      </ng-container>

      <cdk-row *cdkRowDef="let row; columns: columns"></cdk-row>
    </cdk-table>
  `
})
class WrapperCdkTableApp<T> implements AfterContentInit {
  @ContentChildren(CdkColumnDef) columnDefs: QueryList<CdkColumnDef>;
  @ContentChild(CdkHeaderRowDef) headerRowDef: CdkHeaderRowDef;
  @ContentChildren(CdkRowDef) rowDefs: QueryList<CdkRowDef<T>>;

  @ViewChild(CdkTable, {static: true}) table: CdkTable<T>;

  @Input() columns: string[];
  @Input() dataSource: DataSource<T>;

  ngAfterContentInit() {
    // Register the content's column, row, and header row definitions.
    this.columnDefs.forEach(columnDef => this.table.addColumnDef(columnDef));
    this.rowDefs.forEach(rowDef => this.table.addRowDef(rowDef));
    this.table.addHeaderRowDef(this.headerRowDef);
  }
}

@Component({
  template: `
    <wrapper-table [dataSource]="dataSource" [columns]="columnsToRender">
      <ng-container cdkColumnDef="injected_column_a">
        <cdk-header-cell *cdkHeaderCellDef> Injected Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
      </ng-container>
      <ng-container cdkColumnDef="injected_column_b">
        <cdk-header-cell *cdkHeaderCellDef> Injected Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
      </ng-container>

      <!-- Only used for the 'when' row, the first row -->
      <ng-container cdkColumnDef="special_column">
        <cdk-cell *cdkCellDef="let row"> injected row with when predicate </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row class="first-row" *cdkRowDef="let row; columns: ['special_column']; when: firstRow">
      </cdk-row>
    </wrapper-table>
  `
})
class OuterTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender =
      ['content_column_a', 'content_column_b', 'injected_column_a', 'injected_column_b'];

  firstRow = (i: number) => i === 0;
}

@Component({
  template: `
    <table cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <th cdk-header-cell *cdkHeaderCellDef> Column A</th>
        <td cdk-cell *cdkCellDef="let row"> {{row.a}}</td>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <th cdk-header-cell *cdkHeaderCellDef> Column B</th>
        <td cdk-cell *cdkCellDef="let row"> {{row.b}}</td>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <th cdk-header-cell *cdkHeaderCellDef> Column C</th>
        <td cdk-cell *cdkCellDef="let row"> {{row.c}}</td>
      </ng-container>

      <tr cdk-header-row *cdkHeaderRowDef="columnsToRender"></tr>
      <tr cdk-row *cdkRowDef="let row; columns: columnsToRender" class="customRowClass"></tr>
    </table>
  `
})
class NativeHtmlTableApp {
  dataSource: FakeDataSource | undefined = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <table cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <th cdk-header-cell *cdkHeaderCellDef> Column A</th>
        <td cdk-cell *cdkCellDef="let row"> {{row.a}}</td>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <th cdk-header-cell *cdkHeaderCellDef> Column B</th>
        <td cdk-cell *cdkCellDef="let row"> {{row.b}}</td>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <th cdk-header-cell *cdkHeaderCellDef> Column C</th>
        <td cdk-cell *cdkCellDef="let row"> {{row.c}}</td>
      </ng-container>

      <tr cdk-row *cdkRowDef="let row; columns: columnsToRender" class="customRowClass"></tr>
    </table>
  `
})
class NativeTableWithNoHeaderOrFooterRows {
  dataSource: FakeDataSource | undefined = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

@Component({
  template: `
    <table cdk-table [dataSource]="dataSource">
      <caption>Very important data</caption>
      <ng-container cdkColumnDef="column_a">
        <th cdk-header-cell *cdkHeaderCellDef> Column A</th>
        <td cdk-cell *cdkCellDef="let row"> {{row.a}}</td>
      </ng-container>

      <tr cdk-header-row *cdkHeaderRowDef="columnsToRender"></tr>
      <tr cdk-row *cdkRowDef="let row; columns: columnsToRender" class="customRowClass"></tr>
    </table>
  `
})
class NativeHtmlTableWithCaptionApp {
  dataSource: FakeDataSource | undefined = new FakeDataSource();
  columnsToRender = ['column_a'];

  @ViewChild(CdkTable) table: CdkTable<TestData>;
}

function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.cdk-header-row'))!;
}

function getFooterRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.cdk-footer-row'))!;
}

function getRows(tableElement: Element): Element[] {
  return getElements(tableElement, '.cdk-row');
}

function getCells(row: Element): Element[] {
  if (!row) {
    return [];
  }

  let cells = getElements(row, 'cdk-cell');
  if (!cells.length) {
    cells = getElements(row, 'td.cdk-cell');
  }

  return cells;
}

function getHeaderCells(headerRow: Element): Element[] {
  let cells = getElements(headerRow, 'cdk-header-cell');
  if (!cells.length) {
    cells = getElements(headerRow, 'th.cdk-header-cell');
  }

  return cells;
}

function getFooterCells(footerRow: Element): Element[] {
  let cells = getElements(footerRow, 'cdk-footer-cell');
  if (!cells.length) {
    cells = getElements(footerRow, 'td.cdk-footer-cell');
  }

  return cells;
}

function getActualTableContent(tableElement: Element): string[][] {
  let actualTableContent: Element[][] = [];
  getHeaderRows(tableElement).forEach(row => {
    actualTableContent.push(getHeaderCells(row));
  });

  // Check data row cells
  const rows = getRows(tableElement).map(row => getCells(row));
  actualTableContent = actualTableContent.concat(rows);

  getFooterRows(tableElement).forEach(row => {
    actualTableContent.push(getFooterCells(row));
  });

  // Convert the nodes into their text content;
  return actualTableContent.map(row => row.map(cell => cell.textContent!.trim()));
}

function expectTableToMatchContent(tableElement: Element, expected: any[]) {
  const missedExpectations: string[] = [];
  function checkCellContent(actualCell: string, expectedCell: string) {
    if (actualCell !== expectedCell) {
      missedExpectations.push(`Expected cell contents to be ${expectedCell} but was ${actualCell}`);
    }
  }

  const actual = getActualTableContent(tableElement);

  // Make sure the number of rows match
  if (actual.length !== expected.length) {
    missedExpectations.push(`Expected ${expected.length} total rows but got ${actual.length}`);
    fail(missedExpectations.join('\n'));
  }

  actual.forEach((row, rowIndex) => {
    const expectedRow = expected[rowIndex];

    // Make sure the number of cells match
    if (row.length !== expectedRow.length) {
      missedExpectations.push(`Expected ${expectedRow.length} cells in row but got ${row.length}`);
      fail(missedExpectations.join('\n'));
    }

    row.forEach((actualCell, cellIndex) => {
      const expectedCell = expectedRow ? expectedRow[cellIndex] : null;
      checkCellContent(actualCell, expectedCell);
    });
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}
