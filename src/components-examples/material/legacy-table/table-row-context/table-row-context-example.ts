import {Component} from '@angular/core';

/**
 * @title Table showing each row context properties.
 */
@Component({
  selector: 'table-row-context-example',
  styleUrls: ['table-row-context-example.css'],
  templateUrl: 'table-row-context-example.html',
})
export class TableRowContextExample {
  displayedColumns: string[] = ['$implicit', 'index', 'count', 'first', 'last', 'even', 'odd'];
  data: string[] = ['one', 'two', 'three', 'four', 'five'];
}
