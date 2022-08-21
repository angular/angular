import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TooltipPosition} from '@angular/material/legacy-tooltip';

/**
 * @title Tooltip that demonstrates auto-hiding when it clips out of its scrolling container.
 */
@Component({
  selector: 'legacy-tooltip-auto-hide-example',
  templateUrl: 'legacy-tooltip-auto-hide-example.html',
  styleUrls: ['legacy-tooltip-auto-hide-example.css'],
})
export class LegacyTooltipAutoHideExample {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
}
