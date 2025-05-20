// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-stagger',
  templateUrl: './stagger.component.html',
  styleUrls: ['stagger.component.css'],
})
export class StaggerComponent {
  show = signal(true);
  items = [1, 2, 3];

  refresh() {
    this.show.set(false);
    setTimeout(() => {
      this.show.set(true);
    }, 10);
  }
}
