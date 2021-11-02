/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';


// #docregion mark-for-check
@Component({
  selector: 'app-root',
  template: `Number of ticks: {{numberOfTicks}}`,
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
      <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
    `,
})
class GiantList {
  constructor(private ref: ChangeDetectorRef, public dataProvider: DataListProvider) {
    ref.detach();
    setInterval(() => {
      this.ref.detectChanges();
    }, 5000);
  }
}

@Component({
  selector: 'app',
  providers: [DataListProvider],
  template: `
      <giant-list></giant-list>
    `,
})
class App {
}
// #enddocregion detach

// #docregion reattach
class DataProvider {
  data = 1;
  constructor() {
    setInterval(() => {
      this.data = 2;
    }, 500);
  }
}


@Component({selector: 'live-data', inputs: ['live'], template: 'Data: {{dataProvider.data}}'})
class LiveData {
  constructor(private ref: ChangeDetectorRef, public dataProvider: DataProvider) {}

  @Input()
  set live(value: boolean) {
    if (value) {
      this.ref.reattach();
    } else {
      this.ref.detach();
    }
  }
}

@Component({
  selector: 'app',
  providers: [DataProvider],
  template: `
       Live Update: <input type="checkbox" [(ngModel)]="live">
       <live-data [live]="live"></live-data>
     `,
})

class App1 {
  live = true;
}
// #enddocregion reattach


@NgModule({declarations: [AppComponent, GiantList, App, LiveData, App1], imports: [FormsModule]})
class CoreExamplesModule {
}
