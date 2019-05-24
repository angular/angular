// #docplaster
// #docregion imports
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
// #enddocregion imports

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
  styleUrls: ['./product-alerts.component.css']
})
// #docregion input-output
export class ProductAlertsComponent {
  @Input() product;
  @Output() notify = new EventEmitter();
}
