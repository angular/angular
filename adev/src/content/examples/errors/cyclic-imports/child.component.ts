import {Component, inject} from '@angular/core';
import {ParentComponent} from './parent.component';

@Component({
  selector: 'app-child',
  template: 'The child!',
})
export class ChildComponent {
  private parent = inject(ParentComponent);
}
