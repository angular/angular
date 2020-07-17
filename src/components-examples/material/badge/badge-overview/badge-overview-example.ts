import {Component} from '@angular/core';

/**
 * @title Badge overview
 */
@Component({
  selector: 'badge-overview-example',
  templateUrl: 'badge-overview-example.html',
})
export class BadgeOverviewExample {
  hidden = false;

  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
  }
}
