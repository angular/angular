import { Component } from '@angular/core';

const fib = (n: number) => {
  if (n === 1 || n === 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
};

@Component({
  selector: 'app-heavy',
  templateUrl: './heavy.component.html',
  styleUrls: ['./heavy.component.css'],
})
export class HeavyComponent {
  calculate(): number {
    return fib(15);
  }
}
