import { Component } from '@angular/core';

import { SalesTaxService } from './sales-tax.service';
import { TaxRateService } from './tax-rate.service';

@Component({
  selector:    'app-sales-tax',
  template: `
    <h2>Sales Tax Calculator</h2>
    <label>Amount: <input #amountBox (change)="0"></label>

    <div *ngIf="amountBox.value">
    The sales tax is
     {{ getTax(amountBox.value) | currency:'USD':true:'1.2-2' }}
    </div>
  `,
  providers: [SalesTaxService, TaxRateService]
})
export class SalesTaxComponent {
  constructor(private salesTaxService: SalesTaxService) { }

  getTax(value: string | number) {
    return this.salesTaxService.getVAT(value);
  }
}
