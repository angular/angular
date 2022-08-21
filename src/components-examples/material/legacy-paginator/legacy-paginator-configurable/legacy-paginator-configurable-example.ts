import {Component} from '@angular/core';
import {PageEvent} from '@angular/material/legacy-paginator';

/**
 * @title Configurable paginator
 */
@Component({
  selector: 'legacy-paginator-configurable-example',
  templateUrl: 'legacy-paginator-configurable-example.html',
  styleUrls: ['legacy-paginator-configurable-example.css'],
})
export class LegacyPaginatorConfigurableExample {
  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
}
