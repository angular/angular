import {Component} from '@angular/core';
import {ChildComponent} from './child.component';

@Component({
  selector: 'app-parent',
  imports: [ChildComponent],
  template: '<app-child/>',
})
export class ParentComponent {}
