// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave',
  templateUrl: 'leave.html',
  styleUrls: ['leave.css'],
})
export class Leave {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
