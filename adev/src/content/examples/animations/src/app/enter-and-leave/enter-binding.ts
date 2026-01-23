// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-enter-binding',
  templateUrl: 'enter-binding.html',
  styleUrls: ['enter-binding.css'],
})
export class EnterBinding {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  enterClass = signal('enter-animation');
}
