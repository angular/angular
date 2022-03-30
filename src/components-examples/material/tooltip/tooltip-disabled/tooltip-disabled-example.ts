import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

/**
 * @title Tooltip that can be disabled
 */
@Component({
  selector: 'tooltip-disabled-example',
  templateUrl: 'tooltip-disabled-example.html',
  styleUrls: ['tooltip-disabled-example.css'],
})
export class TooltipDisabledExample {
  disabled = new UntypedFormControl(false);
}
