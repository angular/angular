import {Component, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Select with custom panel styling
 */
@Component({
  selector: 'select-panel-class-example',
  templateUrl: 'select-panel-class-example.html',
  styleUrls: ['select-panel-class-example.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SelectPanelClassExample {
  panelColor = new FormControl('red');
}
