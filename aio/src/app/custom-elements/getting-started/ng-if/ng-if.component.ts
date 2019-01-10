import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'aio-gs-ng-if',
  template: `
    <aio-gs-container>
      <ng-container class="template">&lt;p *ngIf="products.length > 0"&gt;
  We still have products available.
&lt;/p&gt;</ng-container>

      <ng-container class="data">
        products = <input #input (input)="productsData$.next(input.value)" [value]="productsData$ | async">;
        <div *ngIf="parseError$ | async" class="material-icons" matTooltip="The provided JSON is invalid">error_outline</div>
      </ng-container>

      <ng-container class="result">
        <p *ngIf="(products$ | async)?.length > 0">
          We still have products available.
        </p>
      </ng-container>
    </aio-gs-container>
  `,
  preserveWhitespaces: true
})
export class NgIfComponent implements OnInit, OnDestroy {
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
