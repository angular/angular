// #docplaster
// #docregion imports
import { Component , OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { Product } from '../products';
// #enddocregion imports

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
// #docregion inject-cart, items
export class CartComponent implements OnInit {

// #enddocregion inject-cart
  items: Product[] = [];
// #docregion inject-cart

  constructor(
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // get the items from cartService
    this.items = this.cartService.getItems();
  }
}
