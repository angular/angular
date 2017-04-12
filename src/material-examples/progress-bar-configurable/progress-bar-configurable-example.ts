import {Component} from '@angular/core';


@Component({
  selector: 'progress-bar-configurable-example',
  templateUrl: './progress-bar-configurable-example.html',
  styleUrls: ['./progress-bar-configurable-example.css'],
})
export class ProgressBarConfigurableExample {
  color = 'primary';
  mode = 'determinate';
  value = 50;
  bufferValue = 75;
}
