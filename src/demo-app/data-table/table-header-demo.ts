import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'table-header-demo',
  templateUrl: 'table-header-demo.html',
  styleUrls: ['table-header-demo.css'],
})
export class TableHeaderDemo {
  @Output() shiftColumns = new EventEmitter<void>();
  @Output() toggleColorColumn = new EventEmitter<void>();
}
