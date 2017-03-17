import {Component, ChangeDetectionStrategy} from '@angular/core';
import {TooltipPosition} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
  styleUrls: ['tooltip-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TooltipDemo {
  position: TooltipPosition = 'below';
  message: string = 'Here is the tooltip';
  disabled = false;
  showDelay = 0;
  hideDelay = 1000;
}
