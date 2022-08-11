import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Basic tooltip
 */
@Component({
  selector: 'tooltip-position-at-origin-example',
  templateUrl: 'tooltip-position-at-origin-example.html',
  styleUrls: ['tooltip-position-at-origin-example.css'],
})
export class TooltipPositionAtOriginExample {
  enabled = new FormControl(false);
}
