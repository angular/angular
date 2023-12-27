import { Component } from '@angular/core';
import { NgIf, CurrencyPipe } from '@angular/common';

import { SalesTaxService } from './sales-tax.service';

@Component({
  standalone: true,
  selector:    'app-sales-tax',
  template: `
    <h2>Sales Tax Calculator</h2>
    <p><em>Enter a number and press enter to calculate tax.</em></p>
    <label for="amount-input">Amount: </label>
    <input type="text" id="amount-input" #amountBox (change)="0">
    <div *ngIf="amountBox.value">
    <p>The sales tax is
     {{ getTax(amountBox.value) | currency:'USD':true:'1.2-2' }}</p>
    </div>
  `,
  imports: [NgIf, CurrencyPipe]
})
export class SalesTaxComponent {
  constructor(private salesTaxService: SalesTaxService) { }

  getTax(value: string | number) {
    return this.salesTaxService.getVAT(value);
  }
}
