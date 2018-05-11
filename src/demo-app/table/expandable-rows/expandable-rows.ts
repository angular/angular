/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ELEMENT_DATA, PeriodicElement} from 'table/element-data';

@Component({
  moduleId: module.id,
  selector: 'expandable-rows',
  templateUrl: 'expandable-rows.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed',
          animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styles: [`
    table {
      width: 100%;
    }

    tr.demo-detail-row {
      height: 0;
    }

    tr.demo-element-row:not(.demo-expanded):hover {
      background: #F5F5F5;
    }

    tr.demo-element-row:not(.demo-expanded):active {
      background: #EFEFEF;
    }

    .demo-element-row td {
      border-bottom-width: 0;
    }
  `]
})
export class ExpandableRowsDemo implements OnInit {
  dataSource = new MatTableDataSource(ELEMENT_DATA.slice());
  columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  expandedElement: PeriodicElement;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
