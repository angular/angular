import {Component} from '@angular/core';

/**
 * @title Stacked chips
 */
@Component({
  selector: 'chips-stacked-example',
  templateUrl: 'chips-stacked-example.html',
  styleUrls: ['chips-stacked-example.css'],
})
export class ChipsStackedExample {
  color: string;

  availableColors = [
    { name: 'none', color: '' },
    { name: 'Primary', color: 'primary' },
    { name: 'Accent', color: 'accent' },
    { name: 'Warn', color: 'warn' }
  ];
}
