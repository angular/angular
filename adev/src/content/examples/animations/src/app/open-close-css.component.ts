// #docplaster
import {Component, signal} from '@angular/core';

// #docregion component
@Component({
  selector: 'app-open-close-css',
  templateUrl: 'open-close-css.component.html',
  styleUrls: ['open-close-css.component.css'],
})
export class OpenCloseComponentCss {
  isOpen = signal(true);
  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
// #enddocregion component
