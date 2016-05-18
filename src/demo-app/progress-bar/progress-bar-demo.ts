import {Component} from '@angular/core';
import {MdButton} from '@angular2-material/button/button';
import {MdProgressBar} from '@angular2-material/progress-bar/progress-bar';

// TODO(josephperrott): Add an automatically filling example progress bar.

@Component({
  moduleId: module.id,
  selector: 'progress-bar-demo',
  templateUrl: 'progress-bar-demo.html',
  styleUrls: ['progress-bar-demo.css'],
  directives: [MdProgressBar, MdButton]
})
export class ProgressBarDemo {
  determinateProgressValue: number = 30;
  bufferProgressValue: number = 30;
  bufferBufferValue: number = 40;

  stepDeterminateProgressVal(val: number) {
    this.determinateProgressValue += val;
  }

  stepBufferProgressVal(val: number) {
    this.bufferProgressValue += val;
  }

  stepBufferBufferVal(val: number) {
    this.bufferBufferValue += val;
  }
}
