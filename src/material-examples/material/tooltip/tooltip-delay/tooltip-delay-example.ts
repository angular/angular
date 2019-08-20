import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Tooltip with a show and hide delay
 */
@Component({
  selector: 'tooltip-delay-example',
  templateUrl: 'tooltip-delay-example.html',
  styleUrls: ['tooltip-delay-example.css'],
})
export class TooltipDelayExample {
  showDelay = new FormControl(1000);
  hideDelay = new FormControl(2000);
}
