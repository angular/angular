// #docplaster
// #docregion imports
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../products';
// #enddocregion imports

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
  styleUrls: ['./product-alerts.component.css']
})
// #docregion input-output
export class ProductAlertsComponent {
  @Input() product: Product | undefined;
  @Output() notify = new EventEmitter();
}
