import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-child',
  templateUrl: './child.html',
  styleUrl: './child.css',
})
export class Child {
  isExpanded = signal(false);

  toggle() {
    this.isExpanded.update((e) => !e);
  }
}
