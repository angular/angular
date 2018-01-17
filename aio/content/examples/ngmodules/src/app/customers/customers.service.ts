import { Injectable, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';
import { delay }      from 'rxjs/operator/delay';

export class Customer {
  constructor(public id: number, public name: string) { }
}

const CUSTOMERS: Customer[] = [
  new Customer(11, 'Julian'),
  new Customer(12, 'Eric'),
  new Customer(13, 'Momi'),
  new Customer(14, 'Madeleine'),
  new Customer(15, 'Seth'),
  new Customer(16, 'Teresa')
];

const FETCH_LATENCY = 500;

/** Simulate a data service that retrieves heroes from a server */
@Injectable()
export class CustomersService implements OnDestroy {

  constructor() { console.log('CustomersService instance created.'); }
  ngOnDestroy() { console.log('CustomersService instance destroyed.'); }

  getCustomers(): Observable<Customer[]>  {
    return delay.call(of(CUSTOMERS), FETCH_LATENCY);
  }

  getCustomer(id: number | string): Observable<Customer> {
    const customer$ = of(CUSTOMERS.find(customer => customer.id === +id));
    return delay.call(customer$, FETCH_LATENCY);
  }
}
