import {Component} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';

/**
 * @title Testing with MatPaginatorHarness
 */
@Component({
  selector: 'paginator-harness-example',
  templateUrl: 'paginator-harness-example.html'
})
export class PaginatorHarnessExample {
  length = 500;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  showFirstLastButtons = true;

  handlePageEvent(event: PageEvent) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }
}
