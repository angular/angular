import {Component} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {
  getTableTextColumnMissingParentTableError,
  getTableTextColumnMissingNameError,
} from './table-errors';
import {CdkTableModule} from './table-module';
import {expectTableToMatchContent} from './table.spec';
import {TEXT_COLUMN_OPTIONS, TextColumnOptions} from './tokens';


describe('CdkTextColumn', () => {
  let fixture: ComponentFixture<BasicTextColumnApp>;
  let component: BasicTextColumnApp;
  let tableElement: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [CdkTableModule],
          declarations: [
            BasicTextColumnApp,
            MissingTableApp,
            TextColumnWithoutNameApp,
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicTextColumnApp);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tableElement = fixture.nativeElement.querySelector('.cdk-table');
  });

  it('should render the basic columns', () => {
    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
    ]);
  });

  it('should throw an error if the text column is not in the content of a table', () => {
    expect(() => TestBed.createComponent(MissingTableApp).detectChanges())
        .toThrowError(getTableTextColumnMissingParentTableError().message);
  });

  it('should throw an error if the text column does not have a name', () => {
    expect(() => TestBed.createComponent(TextColumnWithoutNameApp).detectChanges())
        .toThrowError(getTableTextColumnMissingNameError().message);
  });

  it('should allow for alternate header text', () => {
    component.headerTextB = 'column-b';
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'column-b', 'PropertyC'],
      ['a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
    ]);
  });

  it('should allow for custom data accessor', () => {
    component.dataAccessorA = (data: TestData) => data.propertyA + '!';
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['a_1!', 'b_1', 'c_1'],
      ['a_2!', 'b_2', 'c_2'],
    ]);
  });

  it('should allow for custom data accessor', () => {
    component.dataAccessorA = (data: TestData) => data.propertyA + '!';
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['a_1!', 'b_1', 'c_1'],
      ['a_2!', 'b_2', 'c_2'],
    ]);
  });

  it('should update values when data changes', () => {
    component.data = [
      {propertyA: 'changed-a_1', propertyB: 'b_1', propertyC: 'c_1'},
      {propertyA: 'changed-a_2', propertyB: 'b_2', propertyC: 'c_2'},
    ];
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['changed-a_1', 'b_1', 'c_1'],
      ['changed-a_2', 'b_2', 'c_2'],
    ]);
  });

  describe('with options', () => {
    function createTestComponent(options: TextColumnOptions<any>) {
      // Reset the previously configured testing module to be able set new providers.
      // The testing module has been initialized in the root describe group for the ripples.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [CdkTableModule],
        declarations: [BasicTextColumnApp],
        providers: [{provide: TEXT_COLUMN_OPTIONS, useValue: options}]
      });

      fixture = TestBed.createComponent(BasicTextColumnApp);
      fixture.detectChanges();

      tableElement = fixture.nativeElement.querySelector('.cdk-table');
    }

    it('should be able to provide a header text transformation', () => {
      const defaultHeaderTextTransform = (name: string) => `${name}!`;
      createTestComponent({defaultHeaderTextTransform});

      expectTableToMatchContent(tableElement, [
        ['propertyA!', 'propertyB!', 'propertyC!'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
      ]);
    });

    it('should be able to provide a general data accessor', () => {
      const defaultDataAccessor = (data: TestData, name: string) => {
        switch (name) {
          case 'propertyA':
            return `A: ${data.propertyA}`;
          case 'propertyB':
            return `B: ${data.propertyB}`;
          case 'propertyC':
            return `C: ${data.propertyC}`;
          default:
            return '';
        }
      };
      createTestComponent({defaultDataAccessor});

      expectTableToMatchContent(tableElement, [
        ['PropertyA', 'PropertyB', 'PropertyC'],
        ['A: a_1', 'B: b_1', 'C: c_1'],
        ['A: a_2', 'B: b_2', 'C: c_2'],
      ]);
    });
  });
});

interface TestData {
  propertyA: string;
  propertyB: string;
  propertyC: string;
}

@Component({
  template: `
    <cdk-table [dataSource]="data">
      <cdk-text-column name="propertyA" [dataAccessor]="dataAccessorA"></cdk-text-column>
      <cdk-text-column name="propertyB" [headerText]="headerTextB"></cdk-text-column>
      <cdk-text-column name="propertyC" [justify]="justifyC"></cdk-text-column>

      <cdk-header-row *cdkHeaderRowDef="displayedColumns"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: displayedColumns"></cdk-row>
    </cdk-table>
  `
})
class BasicTextColumnApp {
  displayedColumns = ['propertyA', 'propertyB', 'propertyC'];

  data: TestData[] = [
    {propertyA: 'a_1', propertyB: 'b_1', propertyC: 'c_1'},
    {propertyA: 'a_2', propertyB: 'b_2', propertyC: 'c_2'},
  ];

  headerTextB: string;
  dataAccessorA: (data: TestData) => string;
  justifyC = 'start';
}

@Component({
  template: `
    <cdk-text-column name="column-a"></cdk-text-column>
  `
})
class MissingTableApp {
}


@Component({
  template: `
    <cdk-table [dataSource]="data">
      <cdk-text-column [dataAccessor]="dataAccessorA"></cdk-text-column>

      <cdk-header-row *cdkHeaderRowDef="displayedColumns"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: displayedColumns"></cdk-row>
    </cdk-table>
  `
})
class TextColumnWithoutNameApp extends BasicTextColumnApp {
}

