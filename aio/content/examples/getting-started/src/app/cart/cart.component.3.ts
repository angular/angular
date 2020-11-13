// #docplaster
// #docregion imports
import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
// #enddocregion imports

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
// #docregion props-services, submit
export class CartComponent implements OnInit {
  items;

  constructor(
    private cartService: CartService
  ) { }

  ngOnInit(): void  {
    this.items = this.cartService.getItems();
  }
}
