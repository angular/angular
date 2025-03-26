// #docplaster
// #docregion
import {Component, ElementRef, OnInit, signal, viewChild} from '@angular/core';

@Component({
  selector: 'app-increment-decrement',
  templateUrl: 'increment-decrement.component.html',
  styleUrls: ['increment-decrement.component.css'],
})
export class IncrementDecrementComponent implements OnInit {
  num = signal(0);
  el = viewChild<ElementRef<HTMLParagraphElement>>('el');

  ngOnInit() {
    this.el()?.nativeElement.addEventListener('animationend', (ev) => {
      if (ev.animationName.endsWith('decrement') || ev.animationName.endsWith('increment')) {
        this.animationFinished();
      }
    });
  }

  modify(n: number) {
    const targetClass = n > 0 ? 'increment' : 'decrement';
    this.num.update((v) => (v += n));
    this.el()?.nativeElement.classList.add(targetClass);
  }

  animationFinished() {
    this.el()?.nativeElement.classList.remove('increment', 'decrement');
  }

  ngOnDestroy() {
    this.el()?.nativeElement.removeEventListener('animationend', this.animationFinished);
  }
}
