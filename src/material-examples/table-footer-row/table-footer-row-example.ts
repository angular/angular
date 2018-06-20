import {Component} from '@angular/core';

export interface Transaction {
  item: string;
  cost: number;
}

/**
 * @title Footer row table
 */
@Component({
  selector: 'table-footer-row-example',
  styleUrls: ['table-footer-row-example.css'],
  templateUrl: 'table-footer-row-example.html',
})
export class TableFooterRowExample {
  displayedColumns: string[] = ['item', 'cost'];
  transactions: Transaction[] = [
    {item: 'Beach ball', cost: 4},
    {item: 'Towel', cost: 5},
    {item: 'Frisbee', cost: 2},
    {item: 'Sunscreen', cost: 4},
    {item: 'Cooler', cost: 25},
    {item: 'Swim suit', cost: 15},
  ];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }
}
