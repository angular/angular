/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatLegacyPaginatorModule, LegacyPageEvent} from '@angular/material/legacy-paginator';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';

@Component({
  selector: 'legacy-paginator-demo',
  templateUrl: 'legacy-paginator-demo.html',
  styleUrls: ['legacy-paginator-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatLegacyCardModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyPaginatorModule,
    MatLegacySlideToggleModule,
  ],
})
export class LegacyPaginatorDemo {
  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent: LegacyPageEvent;

  handlePageEvent(e: LegacyPageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }
}
