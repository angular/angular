import {Component} from '@angular/core';


@Component({
  selector: 'slide-toggle-configurable-example',
  templateUrl: './slide-toggle-configurable-example.html',
  styleUrls: ['./slide-toggle-configurable-example.css'],
})
export class SlideToggleConfigurableExample {
  color = 'accent';
  checked = false;
  disabled = false;
}
