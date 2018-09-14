import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'aio-gs-ng-for',
  template: `
    <aio-gs-container>
      <ng-container class="template">&lt;span *ngFor="let product of products">
  {{'{'+'{'}}product{{'}'+'}'}}
&lt;/span&gt;</ng-container>

      <ng-container class="data">
        products = <input #input (input)="productsData$.next(input.value)" [value]="productsData$ | async">;
        <div *ngIf="parseError$ | async" class="material-icons" matTooltip="The provided JSON is invalid">error_outline</div>
      </ng-container>

      <ng-container class="result">
        <span *ngFor="let product of products$ | async">{{product}}</span>
      </ng-container>
    </aio-gs-container>
  `,
  styles: [`
    span::after {
      content: ' ';
    }
  `],
  preserveWhitespaces: true
})
export class NgForComponent implements OnInit, OnDestroy {
  productsData$ = this.productService.productsData$;
  products$ = this.productService.products$;
  parseError$ = this.productService.parseError$;
  productsSub: Subscription;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productsSub = this.productService.init().subscribe();
  }

  ngOnDestroy() {
    this.productsSub.unsubscribe();
  }
}
