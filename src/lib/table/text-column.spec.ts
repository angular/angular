import {Component} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTableModule} from './table-module';
import {expectTableToMatchContent} from './table.spec';

describe('MatTextColumn', () => {
  let fixture: ComponentFixture<BasicTextColumnApp>;
  let tableElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTableModule],
      declarations: [
        BasicTextColumnApp,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicTextColumnApp);
    fixture.detectChanges();

    tableElement = fixture.nativeElement.querySelector('.mat-table');
  });

  it('should be able to render the basic columns', () => {
    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
    ]);
  });
});

interface TestData {
  propertyA: string;
  propertyB: string;
  propertyC: string;
}

@Component({
  template: `
    <mat-table [dataSource]="data">
      <mat-text-column name="propertyA"></mat-text-column>
      <mat-text-column name="propertyB"></mat-text-column>
      <mat-text-column name="propertyC"></mat-text-column>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns"></mat-row>
    </mat-table>
  `
})
class BasicTextColumnApp {
  displayedColumns = ['propertyA', 'propertyB', 'propertyC'];

  data: TestData[] = [
    {propertyA: 'a_1', propertyB: 'b_1', propertyC: 'c_1'},
    {propertyA: 'a_2', propertyB: 'b_2', propertyC: 'c_2'},
  ];
}
