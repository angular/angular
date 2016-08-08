import {Component} from '@angular/core';
import {TooltipPosition} from '@angular2-material/tooltip/tooltip';


@Component({
  moduleId: module.id,
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
  styleUrls: ['tooltip-demo.css'],
})
export class TooltipDemo {
  position: TooltipPosition = 'below';
}
