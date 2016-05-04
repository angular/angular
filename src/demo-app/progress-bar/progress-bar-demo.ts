import {Component} from '@angular/core';
import {MdButton} from '../../components/button/button';
import {MdProgressBar} from '../../components/progress-bar/progress-bar';

// TODO(josephperrott): Add an automatically filling example progress bar.

@Component({
  selector: 'progress-bar-demo',
  templateUrl: 'demo-app/progress-bar/progress-bar-demo.html',
  styleUrls: ['demo-app/progress-bar/progress-bar-demo.css'],
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
