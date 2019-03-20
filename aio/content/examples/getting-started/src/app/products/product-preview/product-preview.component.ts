// #docplaster
// #docregion
// #docregion core-imports, product-imports
import { Component, OnInit, Input } from '@angular/core';
// #enddocregion core-imports

import { Product } from '../product';
// #enddocregion product-imports


@Component({
  selector: 'app-product-preview',
  templateUrl: './product-preview.component.html',
  styleUrls: ['./product-preview.component.css']
})
// #docregion inputs-outputs
export class ProductPreviewComponent {
  @Input() product: Product;
}
// #enddocregion inputs-outputs
