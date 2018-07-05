import {Component, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Select with custom panel styling
 */
@Component({
  selector: 'select-panel-class-example',
  templateUrl: 'select-panel-class-example.html',
  styleUrls: ['select-panel-class-example.css'],
  // Encapsulation has to be disabled in order for the
  // component style to apply to the select panel.
  encapsulation: ViewEncapsulation.None,
})
export class SelectPanelClassExample {
  panelColor = new FormControl('red');
}
