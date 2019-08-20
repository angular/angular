import {Component} from '@angular/core';

/**
 * @title MatRipple basic usage
 */
@Component({
  selector: 'ripple-overview-example',
  templateUrl: 'ripple-overview-example.html',
  styleUrls: ['ripple-overview-example.css'],
})
export class RippleOverviewExample {
  centered = false;
  disabled = false;
  unbounded = false;

  radius: number;
  color: string;
}
