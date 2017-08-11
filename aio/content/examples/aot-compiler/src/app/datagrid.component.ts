// Imagine a really nifty, reusable data grid

import { Component } from '@angular/core';

let nextId = 1;

@Component({
  selector: 'data-grid',
  template: `<h3>DataGrid {{id}}</h3>`
})
export class DataGridComponent {
  id = nextId++;
}
