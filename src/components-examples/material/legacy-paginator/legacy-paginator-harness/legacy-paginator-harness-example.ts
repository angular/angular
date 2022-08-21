import {Component} from '@angular/core';
import {PageEvent} from '@angular/material/legacy-paginator';

/**
 * @title Testing with MatPaginatorHarness
 */
@Component({
  selector: 'legacy-paginator-harness-example',
  templateUrl: 'legacy-paginator-harness-example.html',
})
export class LegacyPaginatorHarnessExample {
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
