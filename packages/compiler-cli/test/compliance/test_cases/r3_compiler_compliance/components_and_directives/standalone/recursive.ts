import {Component} from '@angular/core';

@Component({
  selector: 'recursive-cmp',
  // Simple recursion. Note: no `imports`.
  template: '<recursive-cmp></recursive-cmp>',
})
export class RecursiveComponent {
}
