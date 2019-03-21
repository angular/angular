// #docplaster
// #docregion imports
import { Component, Input } from '@angular/core';
// #enddocregion imports

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
  styleUrls: ['./product-alerts.component.css']
})
export class ProductAlertsComponent {
  @Input() product;
}
