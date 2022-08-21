import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Tooltip with a changing message
 */
@Component({
  selector: 'legacy-tooltip-message-example',
  templateUrl: 'legacy-tooltip-message-example.html',
  styleUrls: ['legacy-tooltip-message-example.css'],
})
export class LegacyTooltipMessageExample {
  message = new FormControl('Info about the action');
}
