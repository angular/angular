import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { LazyLoaderService } from '../lazy-loader.service';

@Component({
  selector: 'app-angular-js',
  template: '<div ng-view></div>'
})
export class AngularJSComponent implements OnInit, OnDestroy {
  constructor(
    private lazyLoader: LazyLoaderService,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.lazyLoader.load(this.elRef.nativeElement);
  }


  ngOnDestroy() {
    this.lazyLoader.destroy();
  }
}
