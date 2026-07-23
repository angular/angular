// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave-binding',
  templateUrl: 'leave-binding.html',
  styleUrls: ['leave-binding.css'],
})
export class LeaveBinding {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  farewell = signal('leaving');
}
