import {MatLegacyTableDataSource} from './table-data-source';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component, ViewChild} from '@angular/core';

describe('MatTableDataSource', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSortModule, NoopAnimationsModule],
      declarations: [MatSortApp],
    }).compileComponents();
  }));

  describe('sort', () => {
    let dataSource: MatLegacyTableDataSource<any>;
    let fixture: ComponentFixture<MatSortApp>;
    let sort: MatSort;

    beforeEach(() => {
      fixture = TestBed.createComponent(MatSortApp);
      fixture.detectChanges();
      dataSource = new MatLegacyTableDataSource();
      sort = fixture.componentInstance.sort;
      dataSource.sort = sort;
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

    it('should be able to correctly sort an array of strings and numbers', () => {
      testSortWithValues([3, 'apples', 'bananas', 'cherries', 'lemons', 'strawberries']);
    });

    it('should unsubscribe from the re-render stream when disconnected', () => {
      const spy = spyOn(dataSource._renderChangesSubscription!, 'unsubscribe');
      dataSource.disconnect();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should re-subscribe to the sort stream when re-connecting after being disconnected', () => {
      dataSource.disconnect();
      const spy = spyOn(fixture.componentInstance.sort.sortChange, 'subscribe');
      dataSource.connect();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should update filteredData even if the data source is disconnected', () => {
      dataSource.data = [1, 2, 3, 4, 5];
      expect(dataSource.filteredData).toEqual([1, 2, 3, 4, 5]);

      dataSource.disconnect();
      dataSource.data = [5, 4, 3, 2, 1];
      expect(dataSource.filteredData).toEqual([5, 4, 3, 2, 1]);
    });
  });
});

@Component({
  template: `<div matSort matSortDirection="asc"></div>`,
})
class MatSortApp {
  @ViewChild(MatSort) sort: MatSort;
}
