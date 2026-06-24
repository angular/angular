// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-auto-height',
  templateUrl: 'auto-height.component.html',
  styleUrls: ['auto-height.component.css'],
})
export class AutoHeightComponent {
  isOpen = signal(true);
  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
