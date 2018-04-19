/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Element, ELEMENT_DATA} from '../element-data';
import {fromEvent} from 'rxjs';

@Component({
  moduleId: module.id,
  templateUrl: 'mat-table-data-source.html',
  styles: [`
    .demo-action { margin: 16px 0; }
    table { width: 100%; }
  `]
})
export class MatTableDataSourceDemo {
  columns = ['name', 'weight', 'symbol', 'position'];
  dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);

  // Add button that lets you override the filter predicate with a strict name match
  originalFilterPredicate = this.dataSource.filterPredicate;
  useOverrideFilterPredicate: boolean;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('filter') filter: ElementRef;

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    fromEvent(this.filter.nativeElement, 'keyup')
        .subscribe(() => this.dataSource.filter = this.filter.nativeElement.value);
  }

  toggleFilterPredicate() {
    this.useOverrideFilterPredicate = !this.useOverrideFilterPredicate;
    this.dataSource.filterPredicate = this.useOverrideFilterPredicate ?
        (d: Element, filter: string) => d.name.indexOf(filter) != -1 :
        this.originalFilterPredicate;
  }
}
