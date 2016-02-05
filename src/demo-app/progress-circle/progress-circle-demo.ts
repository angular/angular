import {Component} from 'angular2/core';
import {MdButton} from '../../components/button/button';
import {MdProgressCircle, MdSpinner} from '../../components/progress-circle/progress_circle';

@Component({
  selector: 'progress-circle-demo',
  templateUrl: 'demo-app/progress-circle/progress-circle-demo.html',
  styleUrls: ['demo-app/progress-circle/progress-circle-demo.css'],
  directives: [MdProgressCircle, MdSpinner, MdButton]
})
export class ProgressCircleDemo {
  progressValue: number = 40;

  step(val: number) {
    this.progressValue += val;
  }

}