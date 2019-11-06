import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TooltipPosition} from '@angular/material/tooltip';

/**
 * @title Tooltip that demonstrates auto-hiding when it clips out of its scrolling container.
 */
@Component({
  selector: 'tooltip-auto-hide-example',
  templateUrl: 'tooltip-auto-hide-example.html',
  styleUrls: ['tooltip-auto-hide-example.css'],
})
export class TooltipAutoHideExample {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
}
