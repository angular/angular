import {Component} from '@angular/core';

/**
 * @title Use of the tab nav bar with the dedicated panel component.
 */
@Component({
  selector: 'tab-nav-bar-with-panel-example',
  templateUrl: 'tab-nav-bar-with-panel-example.html',
  styleUrls: ['tab-nav-bar-with-panel-example.css'],
})
export class TabNavBarWithPanelExample {
  links = ['First', 'Second', 'Third'];
  activeLink = this.links[0];
}
