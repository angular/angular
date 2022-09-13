import {Component} from '@angular/core';

/**
 * @title Tab group with paginated tabs
 */
@Component({
  selector: 'tab-group-paginated-example',
  templateUrl: 'tab-group-paginated-example.html',
})
export class TabGroupPaginatedExample {
  lotsOfTabs = new Array(30).fill(0).map((_, index) => `Tab ${index}`);
}
