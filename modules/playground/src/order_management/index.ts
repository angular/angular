/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Injectable, Input, NgModule, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

/**
 * You can find the AngularJS implementation of this example here:
 * https://github.com/wardbell/ng1DataBinding
 */

// ---- model

class OrderItem {
  constructor(
      public orderItemId: number, public orderId: number, public productName: string,
      public qty: number, public unitPrice: number) {}

  get total(): number {
    return this.qty * this.unitPrice;
  }
}

class Order {
  constructor(
      public orderId: number, public customerName: string, public limit: number,
      private _dataService: DataService) {}

  get items(): OrderItem[] {
    return this._dataService.itemsFor(this);
  }
  get total(): number {
    return this.items.map(i => i.total).reduce((a, b) => a + b, 0);
  }
}



// ---- services

let _nextId = 1000;
@Injectable()
export class DataService {
  orderItems: OrderItem[];
  orders: Order[];
  currentOrder: Order = null;

  constructor() {
    this.orders = [
      new Order(_nextId++, 'J. Coltrane', 100, this), new Order(_nextId++, 'B. Evans', 200, this)
    ];

    this.orderItems = [
      new OrderItem(_nextId++, this.orders[0].orderId, 'Bread', 5, 1),
      new OrderItem(_nextId++, this.orders[0].orderId, 'Brie', 5, 2),
      new OrderItem(_nextId++, this.orders[0].orderId, 'IPA', 5, 3),

      new OrderItem(_nextId++, this.orders[1].orderId, 'Mozzarella', 5, 2),
      new OrderItem(_nextId++, this.orders[1].orderId, 'Wine', 5, 3)
    ];
  }

  itemsFor(order: Order): OrderItem[] {
    return this.orderItems.filter(i => i.orderId === order.orderId);
  }

  addItemForOrder(order: Order): void {
    this.orderItems.push(new OrderItem(_nextId++, order.orderId, '', 0, 0));
  }

  deleteItem(item: OrderItem): void {
    this.orderItems.splice(this.orderItems.indexOf(item), 1);
  }
}



// ---- components

@Component({
  selector: 'order-list-cmp',
  template: `
    <h1>Orders</h1>
  	<div *ngFor="let order of orders" [class.warning]="order.total > order.limit">
      <div>
        <label>Customer name:</label>
        {{order.customerName}}
      </div>

      <div>
        <label>Limit: <input [(ngModel)]="order.limit" type="number" placeholder="Limit"></label>
      </div>

      <div>
        <label>Number of items:</label>
        {{order.items.length}}
      </div>

      <div>
        <label>Order total:</label>
        {{order.total}}
      </div>

      <button (click)="select(order)">Select</button>
  	</div>
  `
})
export class OrderListComponent {
  orders: Order[];

  constructor(private _service: DataService) {
    this.orders = _service.orders;
  }
  select(order: Order): void {
    this._service.currentOrder = order;
  }
}


@Component({
  selector: 'order-item-cmp',
  template: `
    <div>
      <div>
        <label>Product name: <input [(ngModel)]="item.productName" type="text" placeholder="Product name"></label>
      </div>

      <div>
        <label>Quantity: <input [(ngModel)]="item.qty" type="number" placeholder="Quantity"></label>
      </div>

      <div>
        <label>Unit Price: <input [(ngModel)]="item.unitPrice" type="number" placeholder="Unit price"></label>
      </div>

      <div>
        <label>Total:</label>
        {{item.total}}
      </div>

      <button (click)="onDelete()">Delete</button>
    </div>
  `
})
export class OrderItemComponent {
  @Input() item: OrderItem;
  @Output() delete = new EventEmitter();

  onDelete(): void {
    this.delete.emit(this.item);
  }
}

@Component({
  selector: 'order-details-cmp',
  template: `
    <div *ngIf="order !== null">
      <h1>Selected Order</h1>
      <div>
        <label>Customer name: <input [(ngModel)]="order.customerName" type="text" placeholder="Customer name"></label>
      </div>

      <div>
        <label>Limit: <input [(ngModel)]="order.limit" type="number" placeholder="Limit"></label>
      </div>

      <div>
        <label>Number of items:</label>
        {{order.items.length}}
      </div>

      <div>
        <label>Order total:</label>
        {{order.total}}
      </div>

      <h2>Items</h2>
      <button (click)="addItem()">Add Item</button>
      <order-item-cmp *ngFor="let item of order.items" [item]="item" (delete)="deleteItem(item)"></order-item-cmp>
    </div>
  `
})
export class OrderDetailsComponent {
  constructor(private _service: DataService) {}

  get order(): Order {
    return this._service.currentOrder;
  }

  deleteItem(item: OrderItem): void {
    this._service.deleteItem(item);
  }

  addItem(): void {
    this._service.addItemForOrder(this.order);
  }
}

@Component({
  selector: 'order-management-app',
  providers: [DataService],
  template: `
    <order-list-cmp></order-list-cmp>
    <order-details-cmp></order-details-cmp>
  `
})
export class OrderManagementApplication {
}

@NgModule({
  bootstrap: [OrderManagementApplication],
  declarations:
      [OrderManagementApplication, OrderListComponent, OrderDetailsComponent, OrderItemComponent],
  imports: [BrowserModule, FormsModule]
})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
