import {Component, signal} from '@angular/core';
import {Child} from './child';

@Component({
  selector: 'app-parent',
  imports: [Child],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Parent {
  currentCount = signal(0);

  setParentTo100() {
    this.currentCount.set(100);
  }
}
