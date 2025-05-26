/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  input,
  signal,
} from '@angular/core';
import {FormsModule} from '@angular/forms';

// #docregion mark-for-check
@Component({
  selector: 'app-root',
  template: `Number of ticks: {{ numberOfTicks }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AppComponent {
  numberOfTicks = 0;

  constructor(private ref: ChangeDetectorRef) {
    setInterval(() => {
      this.numberOfTicks++;
      // require view to be updated
      this.ref.markForCheck();
    }, 1000);
  }
}
// #enddocregion mark-for-check

// #docregion detach
class DataListProvider {
  // in a real application the returned data will be different every time
  get data() {
    return [1, 2, 3, 4, 5];
  }
}

@Component({
  selector: 'giant-list',
  template: `
  <ul>
    @for( d of dataProvider.data; track $index) {
      <li>Item {{ d }}</li>
    }
  </ul>`,
})
class GiantList {
  constructor(
    private ref: ChangeDetectorRef,
    public dataProvider: DataListProvider,
  ) {
    ref.detach();
    setInterval(() => {
      this.ref.detectChanges();
    }, 5000);
  }
}

@Component({
  selector: 'app',
  providers: [DataListProvider],
  imports: [GiantList],
  template: `<giant-list/>`,
})
class App {}
// #enddocregion detach

// #docregion reattach
class DataProvider {
  data = signal(1);
  constructor() {
    setInterval(() => {
      this.data.set(2);
    }, 500);
  }
}

@Component({
  selector: 'live-data',
  template: 'Data: {{dataProvider.data()}}',
})
class LiveData {
  live = input.required<boolean>();
  constructor(
    private ref: ChangeDetectorRef,
    public dataProvider: DataProvider,
  ) {
    effect(() => {
      if (this.live()) {
        this.ref.reattach();
      } else {
        this.ref.detach();
      }
    });
  }
}

@Component({
  selector: 'app',
  providers: [DataProvider],
  imports: [FormsModule, LiveData],
  template: `
    Live Update: <input type="checkbox" [(ngModel)]="live" />
    <live-data [live]="live"></live-data>
  `,
})
class App1 {
  live = true;
}
// #enddocregion reattach
