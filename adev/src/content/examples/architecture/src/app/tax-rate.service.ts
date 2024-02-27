import {Injectable} from '@angular/core';

@Injectable()
export class TaxRateService {
  getRate(rateName: string) {
    return 0.1;
  } // 10% everywhere
}
