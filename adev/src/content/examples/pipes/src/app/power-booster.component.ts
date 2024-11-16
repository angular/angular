import {Component} from '@angular/core';
import {ExponentialStrengthPipe} from './exponential-strength.pipe';

@Component({
  selector: 'app-power-booster',
  template: `
    <h2>Power Booster</h2>
    <p>Super power boost: {{2 | exponentialStrength: 10}}</p>
  `,
  imports: [ExponentialStrengthPipe],
})
export class PowerBoosterComponent {}
