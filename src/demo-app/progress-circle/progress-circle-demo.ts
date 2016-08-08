import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'progress-circle-demo',
  templateUrl: 'progress-circle-demo.html',
  styleUrls: ['progress-circle-demo.css'],
})
export class ProgressCircleDemo {
  progressValue: number = 40;

  step(val: number) {
    this.progressValue += val;
  }

}
