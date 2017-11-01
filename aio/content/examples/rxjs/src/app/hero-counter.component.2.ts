// #docplaster
// #docregion
// #docregion takeUntil-operator
import 'rxjs/add/operator/takeUntil';
// #enddocregion takeUntil-operator
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

// #docregion import-subject
import { Subject } from 'rxjs/Subject';
// #enddocregion import-subject

@Component({
  selector: 'hero-counter',
  template: `
    <h2>HERO COUNTER</h2>
    <p>
      Heroes {{ count }}
    </p>
  `
})
export class HeroCounterComponent implements OnInit, OnDestroy {
  count = 0;
  counter$: Observable<number>;

// #docregion onDestroy-subject
  onDestroy$ = new Subject();
// #enddocregion onDestroy-subject

  ngOnInit() {
    this.counter$ = Observable.create((observer: Observer<number>) => {
      setInterval(() => {
        observer.next(this.count++);
      }, 1000);
    });

    this.counter$
      .takeUntil(this.onDestroy$)
      .subscribe();

    this.counter$
      .takeUntil(this.onDestroy$)
      .subscribe();

    this.counter$
      .takeUntil(this.onDestroy$)
      .subscribe();
  }

// #docregion ngOnDestroy-complete
  ngOnDestroy() {
    this.onDestroy$.complete();
  }
// #enddocregion ngOnDestroy-complete
}
// #enddocregion
