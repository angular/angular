import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/**
 * @title Configurable slide-toggle
 */
@Component({
  selector: 'slide-toggle-configurable-example',
  templateUrl: 'slide-toggle-configurable-example.html',
  styleUrls: ['slide-toggle-configurable-example.css'],
})
export class SlideToggleConfigurableExample {
  color: ThemePalette = 'accent';
  checked = false;
  disabled = false;
}
