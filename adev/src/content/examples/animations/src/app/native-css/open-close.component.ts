// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-open-close',
  templateUrl: 'open-close.component.html',
  styleUrls: ['open-close.component.css'],
})
export class OpenCloseComponent {
  isOpen = signal(true);
  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
