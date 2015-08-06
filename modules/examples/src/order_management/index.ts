import {
  bootstrap,
  NgIf,
  NgFor,
  Component,
  Directive,
  View,
  Host,
  NgValidator,
  forwardRef,
  Binding,
  EventEmitter
} from 'angular2/bootstrap';

import {Injectable} from 'angular2/di';

import {formDirectives} from 'angular2/forms';

import {ListWrapper} from 'angular2/src/facade/collection';

/**
 * You can find the Angular 1 implementation of this example here:
 * https://github.com/wardbell/ng1DataBinding
 */

// ---- model

class OrderItem {
  constructor(public orderItemId: number, public orderId: number, public productName: string,
              public qty: number, public unitPrice: number) {}

  get total(): number { return this.qty * this.unitPrice; }
}

class Order {
  constructor(public orderId: number, public customerName: string, public limit: number,
              private dataService: DataService) {}

  get items(): OrderItem[] { return this.dataService.itemsFor(this); }
  get total(): number { return this.items.map(i => i.total).reduce((a, b) => a + b); }
}



// ---- services

var _nextId = 1000;
@Injectable()
class DataService {
  orderItems: OrderItem[];
  orders: Order[];
  currentOrder: Order = null;

  constructor() {
    this.orders = [
      new Order(_nextId++, "J. Coltrane", 100, this),
      new Order(_nextId++, "B. Evans", 200, this)
    ];

    this.orderItems = [
      new OrderItem(_nextId++, this.orders[0].orderId, "Bread", 5, 1),
      new OrderItem(_nextId++, this.orders[0].orderId, "Brie", 5, 2),
      new OrderItem(_nextId++, this.orders[0].orderId, "IPA", 5, 3),

      new OrderItem(_nextId++, this.orders[1].orderId, "Mozzarella", 5, 2),
      new OrderItem(_nextId++, this.orders[1].orderId, "Wine", 5, 3)
    ];
  }

  itemsFor(order: Order): OrderItem[] {
    return ListWrapper.filter(this.orderItems, i => i.orderId === order.orderId);
  }

  addItemForOrder(order: Order): void {
    this.orderItems.push(new OrderItem(_nextId++, order.orderId, "", 0, 0));
  }

  deleteItem(item: OrderItem): void { ListWrapper.remove(this.orderItems, item); }
}



// ---- components

@Component({selector: 'order-list-cmp'})
@View({
  template: `
    <h1>Orders</h1>
  	<div *ng-for="#order of orders" [class.warning]="order.total > order.limit">
      <div>
        <label>Customer name:</label>
        {{order.customerName}}
      </div>

      <div>
        <label>Limit: <input [(ng-model)]="order.limit" type="number" placeholder="Limit"></label>
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
  `,
  directives: [formDirectives, NgFor]
})
class OrderListComponent {
  orders: Order[];

  constructor(private service: DataService) { this.orders = service.orders; }
  select(order: Order): void { this.service.currentOrder = order; }
}


@Component({selector: 'order-item-cmp', properties: ['item'], events: ['delete']})
@View({
  template: `
    <div>
      <div>
        <label>Product name: <input [(ng-model)]="item.productName" type="text" placeholder="Product name"></label>
      </div>

      <div>
        <label>Quantity: <input [(ng-model)]="item.qty" type="number" placeholder="Quantity"></label>
      </div>

      <div>
        <label>Unit Price: <input [(ng-model)]="item.unitPrice" type="number" placeholder="Unit price"></label>
      </div>

      <div>
        <label>Total:</label>
        {{item.total}}
      </div>

      <button (click)="onDelete()">Delete</button>
    </div>
  `,
  directives: [formDirectives]
})
class OrderItemComponent {
  item: OrderItem;
  delete = new EventEmitter();

  onDelete(): void { this.delete.next(this.item); }
}

@Component({selector: 'order-details-cmp'})
@View({
  template: `
    <div *ng-if="order !== null">
      <h1>Selected Order</h1>
      <div>
        <label>Customer name: <input [(ng-model)]="order.customerName" type="text" placeholder="Customer name"></label>
      </div>

      <div>
        <label>Limit: <input [(ng-model)]="order.limit" type="number" placeholder="Limit"></label>
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
      <order-item-cmp *ng-for="#item of order.items" [item]="item" (delete)="deleteItem(item)"></order-item-cmp>
    </div>
  `,
  directives: [formDirectives, OrderItemComponent, NgFor, NgIf]
})
class OrderDetailsComponent {
  constructor(private service: DataService) {}

  get order(): Order { return this.service.currentOrder; }

  deleteItem(item: OrderItem): void { this.service.deleteItem(item); }

  addItem(): void { this.service.addItemForOrder(this.order); }
}

@Component({selector: 'order-management-app', viewBindings: [DataService]})
@View({
  template: `
    <order-list-cmp></order-list-cmp>
    <order-details-cmp></order-details-cmp>
  `,
  directives: [OrderListComponent, OrderDetailsComponent]
})
class OrderManagementApplication {
}

export function main() {
  bootstrap(OrderManagementApplication);
}
