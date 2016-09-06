import {TableCell} from '../util';
const {patch, elementOpen, elementClose, elementOpenStart, elementOpenEnd, attr, text} =
    require('incremental-dom');

export class TableComponent {
  constructor(private _rootEl: any) {}

  set data(data: TableCell[][]) { patch(this._rootEl, () => this._render(data)); }

  private _render(data: TableCell[][]) {
    elementOpen('table');
    elementOpen('tbody');
    for (let r = 0; r < data.length; r++) {
      elementOpen('tr');
      const row = data[r];
      for (let c = 0; c < row.length; c++) {
        elementOpenStart('td');
        if (r % 2 === 0) {
          attr('style', 'background-color: grey');
        }
        elementOpenEnd('td');
        text(row[c].value);
        elementClose('td');
      }
      elementClose('tr');
    }
    elementClose('tbody');
    elementClose('table');
  }
}
