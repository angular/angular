import {Component, ViewEncapsulation} from '@angular/core';

/**
 * @title Tooltip that can have a custom class applied.
 */
@Component({
  selector: 'tooltip-custom-class-example',
  templateUrl: 'tooltip-custom-class-example.html',
  styleUrls: ['tooltip-custom-class-example.css'],
  // Need to remove view encapsulation so that the custom tooltip style defined in
  // `tooltip-custom-class-example.css` will not be scoped to this component's view.
  encapsulation: ViewEncapsulation.None,
})
export class TooltipCustomClassExample {}
