import { Component } from '@angular/core';

const calculate = (n: number) => {
  if (n === 1 || n === 2) {
    return 1;
  }
  return calculate(n - 1) + calculate(n - 2);
};

@Component({
  selector: 'app-heavy',
  templateUrl: './heavy.component.html',
  styleUrls: ['./heavy.component.css'],
})
export class HeavyComponent {
  calculate() {
    return calculate(15);
  }
}
