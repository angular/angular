import {Component} from '@angular/core';

const USD_TO_JPY = 110.29;

@Component({
  moduleId: module.id,
  selector: 'input-a11y',
  templateUrl: 'input-a11y.html',
})
export class InputAccessibilityDemo {
  firstName: string;
  lastName: string;
  password: string;
  showPassword = false;
  email: string;
  usd: number;
  comment: string;
  commentMax = 200;

  get passwordType() { return this.showPassword ? 'text' : 'password'; }

  get passwordToggleLabel() { return this.showPassword ? 'Hide password' : 'Reveal password'; }

  get passwordToggleIcon() { return this.showPassword ? 'visibility_off' : 'visibility'; }

  get jpy() { return this.usd ? this.usd * USD_TO_JPY : this.usd; }
  set jpy(value) { this.usd = value ? value / USD_TO_JPY : value; }

  get commentCount() { return this.comment ? this.comment.length : 0; }
}
