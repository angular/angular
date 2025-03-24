import {Component} from '@angular/core';
import {UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-pipe-precedence',
  templateUrl: './precedence.component.html',
  imports: [UpperCasePipe],
  styles: ['code {font-family: monospace; background-color: #eee; padding: 0.5em;}'],
})
export class PrecedenceComponent {
  isLeft = true;
  toggleDirection() {
    this.isLeft = !this.isLeft;
  }

  isGood = true;
  toggleGood() {
    this.isGood = !this.isGood;
  }

  isUpper = true;
  toggleCase() {
    this.isUpper = !this.isUpper;
  }
}
