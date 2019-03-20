// #docplaster
// #docregion as-generated, imports
import { Component } from '@angular/core';
// #enddocregion as-generated
import { Input } from '@angular/core';
// #enddocregion imports
// #docregion as-generated

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
  styleUrls: ['./product-alerts.component.css']
})
// #docregion input-decorator
export class ProductAlertsComponent {
// #enddocregion as-generated
  @Input() product;
// #docregion as-generated
}
