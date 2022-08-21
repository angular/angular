import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Basic tooltip
 */
@Component({
  selector: 'legacy-tooltip-position-at-origin-example',
  templateUrl: 'legacy-tooltip-position-at-origin-example.html',
  styleUrls: ['legacy-tooltip-position-at-origin-example.css'],
})
export class LegacyTooltipPositionAtOriginExample {
  enabled = new FormControl(false);
}
