/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {ELEMENT_DATA, Element} from '../element-data';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {PeopleDatabase, UserData} from '../people-database';
import {SelectionModel} from '@angular/cdk/collections';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {fromEvent} from 'rxjs';

@Component({
  moduleId: module.id,
  templateUrl: 'native-table.html',
  styleUrls: ['native-table.css'],
})
export class NativeTableDemo {
  definedColumns = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay = this.definedColumns;
  data: Element[] = ELEMENT_DATA.slice();

  dataSource = new MatTableDataSource<UserData>();
  columns = ['select', 'userId', 'userName', 'progress', 'color'];
  selection = new SelectionModel<UserData>(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  constructor(public _peopleDatabase: PeopleDatabase) {
    for (let i = 0; i < 3; i++) {
      this.columnsToDisplay = this.definedColumns.concat(this.columnsToDisplay);
      this.data = this.data.concat(this.data);
    }

    this.dataSource.sortingDataAccessor = (data: UserData, property: string) => {
      switch (property) {
        case 'userId': return +data.id;
        case 'userName': return data.name;
        case 'progress': return +data.progress;
        case 'color': return data.color;
        default: return '';
      }
    };
    this.dataSource.filterPredicate =
        (data: UserData, filter: string) => data.name.indexOf(filter) != -1;
  }

  ngAfterViewInit() {
    // Needs to be set up after the view is initialized since the data source will look at the sort
    // and paginator's initial values to know what data should be rendered.
    this.dataSource!.paginator = this.paginator;
    this.dataSource!.sort = this.sort;
  }

  ngOnInit() {
    this.connect();
    fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(
            debounceTime(150),
            distinctUntilChanged()
        ).subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.filter = this.filter.nativeElement.value;
    });
  }

  connect() {
    this._peopleDatabase.initialize();
    this.dataSource!.data = this._peopleDatabase.data.slice();
  }


  /** Whether all filtered rows are selected. */
  isAllFilteredRowsSelected() {
    return this.dataSource.filteredData.every(data => this.selection.isSelected(data));
  }

  /** Whether the selection it totally matches the filtered rows. */
  isMasterToggleChecked() {
    return this.selection.hasValue() &&
        this.isAllFilteredRowsSelected() &&
        this.selection.selected.length >= this.dataSource.filteredData.length;
  }

  /**
   * Whether there is a selection that doesn't capture all the
   * filtered rows there are no filtered rows displayed.
   */
  isMasterToggleIndeterminate() {
    return this.selection.hasValue() &&
        (!this.isAllFilteredRowsSelected() || !this.dataSource.filteredData.length);
  }

  /** Selects all filtered rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isMasterToggleChecked()) {
      this.selection.clear();
    } else {
      this.dataSource.filteredData.forEach(data => this.selection.select(data));
    }
  }

  getOpacity(progress: number) {
    let distanceFromMiddle = Math.abs(50 - progress);
    return distanceFromMiddle / 50 + .3;
  }
}
