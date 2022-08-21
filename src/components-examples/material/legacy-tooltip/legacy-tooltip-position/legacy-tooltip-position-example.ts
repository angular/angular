import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TooltipPosition} from '@angular/material/legacy-tooltip';

/**
 * @title Tooltip with a custom position
 */
@Component({
  selector: 'legacy-tooltip-position-example',
  templateUrl: 'legacy-tooltip-position-example.html',
  styleUrls: ['legacy-tooltip-position-example.css'],
})
export class LegacyTooltipPositionExample {
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
}
