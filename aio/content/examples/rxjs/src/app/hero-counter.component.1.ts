// #docplaster
// #docregion
// #docregion counter-unsubscribe
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

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
  sub: Subscription;

  ngOnInit() {
    this.counter$ = Observable.create((observer: Observer<number>) => {
      setInterval(() => {
        observer.next(this.count++);
      }, 1000);
    });

    this.sub = this.counter$.subscribe();
  }
// #enddocregion counter-unsubscribe
// #docregion ngOnDestroy-unsubscribe
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
// #enddocregion ngOnDestroy-unsubscribe
// #docregion counter-unsubscribe
}
// #enddocregion
