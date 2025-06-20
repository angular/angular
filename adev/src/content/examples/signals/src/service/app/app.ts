import {Component} from '@angular/core';
import {ProductList} from './product-list';
import {CartSummary} from './cart-summary';

@Component({
  selector: 'app-root',
  imports: [ProductList, CartSummary],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
