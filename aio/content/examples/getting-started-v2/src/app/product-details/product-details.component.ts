// #docplaster
// #docregion imports
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { DataService } from '../data.service';
// #enddocregion imports

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
// #docregion props-methods, get-product, add-to-cart
export class ProductDetailsComponent implements OnInit {
  product;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

// #enddocregion props-methods
  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => this.dataService.getOne(+params.get('productId')))
    ).subscribe(product => this.product = product);
  }

  addToCart(product) {
    window.alert('Your product has been added to the cart!');
    this.dataService.addToCart(product);
  }
// #docregion props-methods
}
