import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class TaxRateService {
  getRate(rateName: string) { return 0.10; } // 10% everywhere
}
