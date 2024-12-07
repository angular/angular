import {Component} from '@angular/core';

function it(_desc: string, fn: () => void) {}

it('case 1', () => {
  @Component({
    template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
    standalone: false
})
  class TestComponent {
  }
});

it('case 2', () => {
  @Component({
    template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
    standalone: false
})
  class TestComponent {
  }
});
