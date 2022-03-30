import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

/**
 * @title Tooltip with a show and hide delay
 */
@Component({
  selector: 'tooltip-delay-example',
  templateUrl: 'tooltip-delay-example.html',
  styleUrls: ['tooltip-delay-example.css'],
})
export class TooltipDelayExample {
  showDelay = new UntypedFormControl(1000);
  hideDelay = new UntypedFormControl(2000);
}
