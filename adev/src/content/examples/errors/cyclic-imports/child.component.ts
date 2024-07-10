import {Component} from '@angular/core';
import {ParentComponent} from './parent.component';

@Component({
  standalone: true,
  selector: 'app-child',
  template: 'The child!',
})
export class ChildComponent {
  constructor(private parent: ParentComponent) {}
}
