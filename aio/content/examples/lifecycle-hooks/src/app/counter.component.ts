// #docregion
import {
  Component, Input,
  OnChanges, SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Counter = {{counter}}</p>

    <div class="info">
      <h3>Counter Change Log</h3>
      <div *ngFor="let chg of changeLog" appSpy class="log">{{chg}}</div>
    </div>
  `
})
export class MyCounterComponent implements OnChanges {
  @Input() counter = 0;
  changeLog: string[] = [];

  ngOnChanges(changes: SimpleChanges) {

    // Empty the changeLog whenever counter goes to zero
    // hint: this is a way to respond programmatically to external value changes.
    if (this.counter === 0) {
      this.changeLog = [];
    }

    // A change to `counter` is the only change we care about
    const chng = changes.counter;
    const cur = chng.currentValue;
    const prev = JSON.stringify(chng.previousValue); // first time is {}; after is integer
    this.changeLog.push(`counter: currentValue = ${cur}, previousValue = ${prev}`);
  }
}
