import {MatTableDataSource} from './table-data-source';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component, ViewChild} from '@angular/core';

describe('MatTableDataSource', () => {
  const dataSource = new MatTableDataSource();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSortModule, NoopAnimationsModule],
      declarations: [MatSortApp],
    }).compileComponents();
  }));

  describe('sort', () => {
    let fixture: ComponentFixture<MatSortApp>;
    let sort: MatSort;

    beforeEach(() => {
      fixture = TestBed.createComponent(MatSortApp);
      sort = fixture.componentInstance.sort;
      fixture.detectChanges();
    });

    /** Test the data source's `sortData` function. */
    function testSortWithValues(values: any[]) {
      // The data source and MatSort expect the list to contain objects with values, where
      // the sort should be performed over a particular key.
      // Map the values into an array of objects where where each value is keyed by "prop"
      // e.g. [0, 1, 2] -> [{prop: 0}, {prop: 1}, {prop: 2}]
      const data = values.map(v => ({'prop': v}));

      // Set the active sort to be on the "prop" key
      sort.active = 'prop';

      const reversedData = data.slice().reverse();
      const sortedData = dataSource.sortData(reversedData, sort);
      expect(sortedData).toEqual(data);
    }

    it('should be able to correctly sort an array of numbers', () => {
      testSortWithValues([-2, -1, 0, 1, 2]);
    });

    it('should be able to correctly sort an array of string', () => {
      testSortWithValues(['apples', 'bananas', 'cherries', 'lemons', 'strawberries']);
    });
  });
});

@Component({
  template: `<div matSort matSortDirection="asc"></div>`
})
class MatSortApp {
  @ViewChild(MatSort, {static: true}) sort: MatSort;
}
