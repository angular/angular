import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

import {Customer, CustomersService} from './customers.service';

@Component({
  template: `
    <h3 highlight>Customer List</h3>
    @for (customer of customers | async; track customer) {
      <div>
        <a routerLink="{{customer.id}}">{{customer.id}} - {{customer.name}}</a>
      </div>
    }
    `,
})
export class CustomersListComponent {
  customers: Observable<Customer[]>;
  constructor(private customersService: CustomersService) {
    this.customers = this.customersService.getCustomers();
  }
}
