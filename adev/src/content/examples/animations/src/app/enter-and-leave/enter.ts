// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-enter',
  templateUrl: 'enter.html',
  styleUrls: ['enter.css'],
})
export class Enter {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
