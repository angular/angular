import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

/**
 * @title Tooltip with a changing message
 */
@Component({
  selector: 'tooltip-message-example',
  templateUrl: 'tooltip-message-example.html',
  styleUrls: ['tooltip-message-example.css'],
})
export class TooltipMessageExample {
  message = new UntypedFormControl('Info about the action');
}
