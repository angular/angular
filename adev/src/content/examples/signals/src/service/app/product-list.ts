import {Component, signal, inject} from '@angular/core';
import {CartService, Product} from './cart';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  cartService = inject(CartService);

  products = signal<Product[]>([
    {id: 1, name: 'Widget', price: 99.99},
    {id: 2, name: 'Gadget', price: 149.5},
    {id: 3, name: 'Gizmo', price: 19.95},
  ]);
}
