import {Component, signal, linkedSignal, computed} from '@angular/core';
import {FormsModule} from '@angular/forms';

interface Product {
  id: string;
  name: string;
  defaultQuantity: number;
}

@Component({
  selector: 'app-order-form',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormsModule],
})
export class OrderForm {
  allProducts = signal<Product[]>([
    {id: '1', name: 'Laptop', defaultQuantity: 1},
    {id: '2', name: 'Mouse', defaultQuantity: 2},
    {id: '3', name: 'Keyboard', defaultQuantity: 1},
    {id: '4', name: 'Monitor', defaultQuantity: 1},
  ]);

  selectedProductId = signal<string>(this.allProducts()[0].id);

  selectedProduct = computed(() =>
    this.allProducts().find((p) => p.id === this.selectedProductId()),
  );

  quantity = linkedSignal({
    source: this.selectedProduct,
    computation: (product) => product?.defaultQuantity ?? 1,
  });
}
