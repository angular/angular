
// #docplaster
// #docregion
// #docregion takeUntil-operator
import 'rxjs/add/operator/takeUntil';
// #enddocregion takeUntil-operator
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { EventAggregatorService } from './event-aggregator.service';

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

  constructor(private eventService: EventAggregatorService) {}

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
      .subscribe(this.getObserver(1));

    this.counter$
      .takeUntil(this.onDestroy$)
      .subscribe(this.getObserver(2));

    this.counter$
      .takeUntil(this.onDestroy$)
      .subscribe(this.getObserver(3));
  }

  getObserver(num: number): Observer<number> {
    return {
      next: () => {},
      error: () => {},
      complete: () => {
        this.eventService.add({ type: 'status', message: `Counter ${num} complete`});
      }
    };
  }

// #docregion ngOnDestroy-complete
  ngOnDestroy() {
    this.onDestroy$.next();
  }
// #enddocregion ngOnDestroy-complete
}
// #enddocregion
