import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'progress-bar-a11y',
  templateUrl: 'progress-bar-a11y.html',
})
export class ProgressBarAccessibilityDemo {
  surveyProgress: number = 30;
  videoPlayValue: number = 20;
  videoBufferValue: number = 60;
}
