import {Component, signal, computed} from '@angular/core';
import {FormsModule} from '@angular/forms';

interface Product {
  id: number;
  name: string;
  category: string;
}

@Component({
  selector: 'app-filter',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormsModule],
})
export class Filter {
  searchTerm = signal('');

  allProducts = signal<Product[]>([
    {id: 1, name: 'Laptop Pro', category: 'Elec.'},
    {id: 2, name: 'Wireless Mouse', category: 'Elec.'},
    {id: 3, name: 'Ergo Keyboard', category: 'Elec.'},
    {id: 4, name: 'The Art of Signals', category: 'Books'},
    {id: 5, name: 'Coffee Mug', category: 'Office'},
    {id: 6, name: 'Standing Desk', category: 'Office'},
  ]);

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const products = this.allProducts();
    if (!term) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term),
    );
  });
}
