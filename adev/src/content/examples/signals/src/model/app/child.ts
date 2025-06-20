import {Component, model} from '@angular/core';

@Component({
  selector: 'app-child',
  templateUrl: './child.html',
  styleUrl: './child.css',
})
export class Child {
  value = model(0);

  increment() {
    this.value.update((v) => v + 1);
  }

  decrement() {
    this.value.update((v) => v - 1);
  }
}
