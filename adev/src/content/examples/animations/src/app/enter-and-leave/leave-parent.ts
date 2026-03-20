// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave-parent',
  templateUrl: 'leave-parent.html',
  styleUrls: ['leave-parent.css'],
})
export class LeaveParent {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
