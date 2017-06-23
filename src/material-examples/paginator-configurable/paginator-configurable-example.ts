import {Component} from '@angular/core';
import {PageEvent} from '@angular/material';

@Component({
  selector: 'paginator-configurable-example',
  templateUrl: 'paginator-configurable-example.html',
})
export class PaginatorConfigurableExample {
  // MdPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];

  // MdPaginator Output
  pageEvent: PageEvent;

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }
}
