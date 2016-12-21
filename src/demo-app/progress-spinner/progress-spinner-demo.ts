import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'progress-spinner-demo',
  templateUrl: 'progress-spinner-demo.html',
  styleUrls: ['progress-spinner-demo.css'],
})
export class ProgressSpinnerDemo {
  progressValue: number = 40;

  step(val: number) {
    this.progressValue += val;
  }

}
