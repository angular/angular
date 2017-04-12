import {Component} from '@angular/core';


@Component({
  selector: 'progress-spinner-configurable-example',
  templateUrl: './progress-spinner-configurable-example.html',
  styleUrls: ['./progress-spinner-configurable-example.css'],
})
export class ProgressSpinnerConfigurableExample {
  color = 'primary';
  mode = 'determinate';
  value = 50;
}
