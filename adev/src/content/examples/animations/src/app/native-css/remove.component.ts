// #docplaster
import {Component, ElementRef, inject, signal} from '@angular/core';

@Component({
  selector: 'app-remove',
  templateUrl: 'remove.component.html',
  styleUrls: ['remove.component.css'],
})
export class RemoveComponent {
  isShown = signal(false);
  deleting = signal(false);
  private el = inject(ElementRef);

  toggle() {
    if (this.isShown()) {
      const target = this.el.nativeElement.querySelector('.insert-container');
      target.addEventListener('transitionend', () => this.hide());
      this.deleting.set(true);
    } else {
      this.isShown.update((isShown) => !isShown);
    }
  }

  hide() {
    this.isShown.set(false);
    this.deleting.set(false);
  }
}
