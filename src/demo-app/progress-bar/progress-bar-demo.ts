import {Component} from '@angular/core';


// TODO(josephperrott): Add an automatically filling example progress bar.

@Component({
  moduleId: module.id,
  selector: 'progress-bar-demo',
  templateUrl: 'progress-bar-demo.html',
  styleUrls: ['progress-bar-demo.css'],
})
export class ProgressBarDemo {
  color: string = 'primary';
  determinateProgressValue: number = 30;
  bufferProgressValue: number = 30;
  bufferBufferValue: number = 40;

  stepDeterminateProgressVal(val: number) {
    this.determinateProgressValue = this.clampValue(val + this.determinateProgressValue);
  }

  stepBufferProgressVal(val: number) {
    this.bufferProgressValue = this.clampValue(val + this.bufferProgressValue);
  }

  stepBufferBufferVal(val: number) {
    this.bufferBufferValue = this.clampValue(val + this.bufferBufferValue);
  }

  private clampValue(value: number) {
    return Math.max(0, Math.min(100, value));
  }
}
