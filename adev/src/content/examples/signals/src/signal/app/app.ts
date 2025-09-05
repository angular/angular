import {Component, signal, Signal} from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Counter {
  count = signal(0);
  readonlyCount: Signal<number> = this.count.asReadonly();

  increment() {
    this.count.update((c) => c + 1);
  }
  decrement() {
    this.count.update((c) => c - 1);
  }
  reset() {
    this.count.set(0);
  }
}
