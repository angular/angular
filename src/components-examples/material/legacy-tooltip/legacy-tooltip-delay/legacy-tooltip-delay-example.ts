import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Tooltip with a show and hide delay
 */
@Component({
  selector: 'legacy-tooltip-delay-example',
  templateUrl: 'legacy-tooltip-delay-example.html',
  styleUrls: ['legacy-tooltip-delay-example.css'],
})
export class LegacyTooltipDelayExample {
  showDelay = new FormControl(1000);
  hideDelay = new FormControl(2000);
}
