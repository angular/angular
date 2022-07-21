import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {LegacyProgressBarMode} from '@angular/material/legacy-progress-bar';

/**
 * @title Configurable progress-bar
 */
@Component({
  selector: 'progress-bar-configurable-example',
  templateUrl: 'progress-bar-configurable-example.html',
  styleUrls: ['progress-bar-configurable-example.css'],
})
export class ProgressBarConfigurableExample {
  color: ThemePalette = 'primary';
  mode: LegacyProgressBarMode = 'determinate';
  value = 50;
  bufferValue = 75;
}
