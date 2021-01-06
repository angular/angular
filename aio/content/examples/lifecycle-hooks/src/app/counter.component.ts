// #docregion
import {
  Component, Input,
  OnChanges, SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
  <div class="counter">
    Counter = {{counter}}

    <h5>-- Counter Change Log --</h5>
    <div *ngFor="let chg of changeLog" appSpy>{{chg}}</div>
  </div>
  `,
  styles: ['.counter {background: LightYellow; padding: 8px; margin-top: 8px}']
})
export class MyCounterComponent implements OnChanges {
  @Input() counter: number;
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
