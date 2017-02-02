import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  selector: 'slider-configurable-example',
  templateUrl: './slider-configurable-example.html',
  styleUrls: ['./slider-configurable-example.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SliderConfigurableExample {
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
  vertical = false;

  get tickInterval(): number | 'auto' {
    return this.showTicks ? (this.autoTicks ? 'auto' : this._tickInterval) : null;
  }
  set tickInterval(v) {
    this._tickInterval = Number(v);
  }
  private _tickInterval = 1;
}
