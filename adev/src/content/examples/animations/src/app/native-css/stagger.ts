// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-stagger',
  templateUrl: './stagger.html',
  styleUrls: ['stagger.css'],
})
export class Stagger {
  show = signal(true);
  items = [1, 2, 3];

  refresh() {
    this.show.set(false);
    setTimeout(() => {
      this.show.set(true);
    }, 10);
  }
}
