// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-insert',
  templateUrl: 'insert.component.html',
  styleUrls: ['insert.component.css'],
})
export class InsertComponent {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
