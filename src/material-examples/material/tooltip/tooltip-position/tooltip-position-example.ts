import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TooltipPosition} from '@angular/material/tooltip';

/**
 * @title Tooltip with a custom position
 */
@Component({
  selector: 'tooltip-position-example',
  templateUrl: 'tooltip-position-example.html',
  styleUrls: ['tooltip-position-example.css'],
})
export class TooltipPositionExample {
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
}
