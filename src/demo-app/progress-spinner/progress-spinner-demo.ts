import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'progress-spinner-demo',
  templateUrl: 'progress-spinner-demo.html',
  styleUrls: ['progress-spinner-demo.css'],
})
export class ProgressSpinnerDemo {
  progressValue: number = 60;
  color: string = 'primary';
  modeToggle: boolean = false;

  step(val: number) {
    this.progressValue = Math.max(0, Math.min(100, val + this.progressValue));
  }

}
