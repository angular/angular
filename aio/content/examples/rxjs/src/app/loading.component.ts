// #docplaster
// #docregion
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { LoadingService } from './loading.service';

@Component({
  moduleId: module.id,
  selector: 'loading-component',
  template: `
    <div class="loading" *ngIf="loading">LOADING</div>
  `,
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit, OnDestroy {
  loading = true;
  sub: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit() {
    this.sub = this.loadingService.loading$
      .subscribe(loading => this.loading = loading);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
